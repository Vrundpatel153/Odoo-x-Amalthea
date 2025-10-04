import { Expense, ApprovalRule, User, ApprovalAction, ApprovalStatus } from './types';
import { storage } from './storage';

export class ApprovalEngine {
  /**
   * Build the list of approvers for an expense based on the rule
   */
  static buildApproverList(
    expense: Expense,
    rule: ApprovalRule,
    users: User[],
    requester: User
  ): string[] {
    const approvers: string[] = [];
    
    for (const item of rule.sequence) {
      if (item === 'manager') {
        // Resolve manager
        if (requester.managerId) {
          approvers.push(requester.managerId);
        } else {
          // Fallback to company admin
          const admin = users.find(
            u => u.companyId === requester.companyId && u.role === 'admin'
          );
          if (admin) {
            approvers.push(admin.id);
          }
        }
      } else {
        approvers.push(item);
      }
    }

    // Deduplicate
    return Array.from(new Set(approvers));
  }

  /**
   * Initialize approval state when expense is submitted
   */
  static initializeApprovalState(
    expense: Expense,
    rule: ApprovalRule,
    users: User[]
  ): Expense['approverState'] {
    const requester = users.find(u => u.id === expense.requesterId);
    if (!requester) return undefined;

    const approvers = this.buildApproverList(expense, rule, users, requester);

    return {
      approvers: approvers.map(userId => ({
        userId,
        status: 'pending' as ApprovalStatus,
      })),
      sequenceIndex: 0,
    };
  }

  /**
   * Process an approval action
   */
  static processApprovalAction(
    expenseId: string,
    approverId: string,
    action: 'approved' | 'rejected',
    comment?: string
  ): { success: boolean; message: string } {
    const expenses = storage.getExpenses();
    const expense = expenses.find(e => e.id === expenseId);
    
    if (!expense || !expense.approverState) {
      return { success: false, message: 'Expense not found' };
    }

    const rules = storage.getApprovalRules();
    const rule = rules.find(r => r.id === expense.approvalRuleId);
    
    if (!rule) {
      return { success: false, message: 'Approval rule not found' };
    }

    // Record the action
    const approvalAction: ApprovalAction = {
      id: `action-${Date.now()}-${Math.random()}`,
      expenseId,
      approverId,
      action,
      comment,
      timestamp: new Date().toISOString(),
    };

    const actions = storage.getApprovalActions();
    actions.push(approvalAction);
    storage.setApprovalActions(actions);

    // Update approver state
    const approver = expense.approverState.approvers.find(a => a.userId === approverId);
    if (!approver) {
      return { success: false, message: 'Approver not found in approval state' };
    }

    approver.status = action === 'approved' ? 'approved' : 'rejected';
    approver.comment = comment;
    approver.actedAt = new Date().toISOString();

    // Check if this is a required approver who rejected
    if (action === 'rejected' && rule.requiredFlags[approverId]) {
      expense.status = 'rejected';
      expense.updatedAt = new Date().toISOString();
      storage.setExpenses(expenses);
      return { success: true, message: 'Expense rejected (required approver)' };
    }

    // Process based on rule type
    if (rule.parallel) {
      return this.processParallelApproval(expense, rule, expenses);
    } else {
      return this.processSequentialApproval(expense, rule, expenses);
    }
  }

  /**
   * Process parallel approval logic
   */
  private static processParallelApproval(
    expense: Expense,
    rule: ApprovalRule,
    expenses: Expense[]
  ): { success: boolean; message: string } {
    if (!expense.approverState) {
      return { success: false, message: 'Invalid approval state' };
    }

    // Check specific approver override
    if (rule.specificApproverId) {
      const specificApprover = expense.approverState.approvers.find(
        a => a.userId === rule.specificApproverId
      );
      if (specificApprover?.status === 'approved') {
        expense.status = 'approved';
        expense.updatedAt = new Date().toISOString();
        storage.setExpenses(expenses);
        return { success: true, message: 'Expense approved (specific approver)' };
      }
    }

    // Calculate approval percentage
    const totalApprovers = expense.approverState.approvers.length;
    const approvedCount = expense.approverState.approvers.filter(
      a => a.status === 'approved'
    ).length;
    const rejectedCount = expense.approverState.approvers.filter(
      a => a.status === 'rejected'
    ).length;

    const approvalPercentage = (approvedCount / totalApprovers) * 100;
    const possibleApprovals = totalApprovers - rejectedCount;
    const maxPossiblePercentage = (possibleApprovals / totalApprovers) * 100;

    // Check if threshold is met
    if (approvalPercentage >= rule.minApprovalPercentage) {
      expense.status = 'approved';
      expense.updatedAt = new Date().toISOString();
      storage.setExpenses(expenses);
      return { success: true, message: 'Expense approved (threshold met)' };
    }

    // Check if threshold is impossible to reach
    if (maxPossiblePercentage < rule.minApprovalPercentage) {
      expense.status = 'rejected';
      expense.updatedAt = new Date().toISOString();
      storage.setExpenses(expenses);
      return { success: true, message: 'Expense rejected (threshold impossible)' };
    }

    expense.updatedAt = new Date().toISOString();
    storage.setExpenses(expenses);
    return { success: true, message: 'Action recorded' };
  }

  /**
   * Process sequential approval logic
   */
  private static processSequentialApproval(
    expense: Expense,
    rule: ApprovalRule,
    expenses: Expense[]
  ): { success: boolean; message: string } {
    if (!expense.approverState) {
      return { success: false, message: 'Invalid approval state' };
    }

    const currentApprover = expense.approverState.approvers[expense.approverState.sequenceIndex];
    
    if (currentApprover.status === 'rejected') {
      expense.status = 'rejected';
      expense.updatedAt = new Date().toISOString();
      storage.setExpenses(expenses);
      return { success: true, message: 'Expense rejected' };
    }

    if (currentApprover.status === 'approved') {
      // Move to next approver
      expense.approverState.sequenceIndex += 1;
      
      // Check if we've gone through all approvers
      if (expense.approverState.sequenceIndex >= expense.approverState.approvers.length) {
        expense.status = 'approved';
        expense.updatedAt = new Date().toISOString();
        storage.setExpenses(expenses);
        return { success: true, message: 'Expense approved (all approvers)' };
      }
    }

    expense.updatedAt = new Date().toISOString();
    storage.setExpenses(expenses);
    return { success: true, message: 'Action recorded' };
  }

  /**
   * Check for escalations (expenses pending beyond escalationDays)
   */
  static checkEscalations(): void {
    const expenses = storage.getExpenses();
    const rules = storage.getApprovalRules();
    const now = new Date();

    expenses.forEach(expense => {
      if (expense.status !== 'pending' || !expense.approverState) return;

      const rule = rules.find(r => r.id === expense.approvalRuleId);
      if (!rule) return;

      const createdAt = new Date(expense.createdAt);
      const daysPending = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysPending >= rule.escalationDays) {
        expense.approverState.approvers.forEach(approver => {
          if (approver.status === 'pending') {
            approver.escalated = true;
          }
        });
      }
    });

    storage.setExpenses(expenses);
  }

  /**
   * Get pending approvals for a specific user
   */
  static getPendingApprovalsForUser(userId: string, companyId: string): any[] {
    const expenses = storage.getExpenses().filter(
      e => e.companyId === companyId && e.status === 'pending'
    );
    const rules = storage.getApprovalRules();

    return expenses.filter(expense => {
      if (!expense.approverState) return false;
      
      const rule = rules.find(r => r.id === expense.approvalRuleId);
      if (!rule) return false;

      if (rule.parallel) {
        // In parallel mode, show if user is in the approvers list and hasn't acted
        const myApproval = expense.approverState.approvers.find(a => a.userId === userId);
        return myApproval && myApproval.status === 'pending';
      } else {
        // In sequential mode, show if user is the current approver
        const currentApprover = expense.approverState.approvers[expense.approverState.sequenceIndex];
        return currentApprover?.userId === userId && currentApprover.status === 'pending';
      }
    });
  }
}
