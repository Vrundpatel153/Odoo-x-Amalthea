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
    let unique = Array.from(new Set(approvers));

    // Ensure company admin is always present as a final approver so admin can
    // directly finalize approvals even if managers are in the sequence.
    const companyAdmin = users.find(u => u.companyId === requester.companyId && u.role === 'admin');
    if (companyAdmin && !unique.includes(companyAdmin.id)) {
      unique.push(companyAdmin.id);
    }

    return unique;
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

    // If an admin approves, finalize immediately: admin approvals are final
    // per new business rule (admin acts as final approver).
    const allUsers = storage.getUsers();
    const actingUser = allUsers.find(u => u.id === approverId);
    if (action === 'approved' && actingUser?.role === 'admin') {
      expense.status = 'approved';
      expense.updatedAt = new Date().toISOString();
      storage.setExpenses(expenses);
      return { success: true, message: 'Expense approved by admin' };
    }

    // Check if this is a required approver who rejected. Do NOT auto-finalize
    // the rejection for non-admin users so admins can still override. If an
    // admin rejects explicitly, finalize the rejection immediately.
    if (action === 'rejected' && rule.requiredFlags[approverId]) {
      const allUsers = storage.getUsers();
      const actingUser = allUsers.find(u => u.id === approverId);
      if (actingUser?.role === 'admin') {
        expense.status = 'rejected';
        expense.updatedAt = new Date().toISOString();
        storage.setExpenses(expenses);
        return { success: true, message: 'Expense rejected (admin)' };
      }
      // Non-admin required approver rejected: record action but leave expense pending
      expense.updatedAt = new Date().toISOString();
      storage.setExpenses(expenses);
      return { success: true, message: 'Rejection recorded (admin can override)' };
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

    // Check if threshold is impossible to reach. Instead of auto-rejecting,
    // record the state and leave pending so an admin can still review and
    // override if desired.
    if (maxPossiblePercentage < rule.minApprovalPercentage) {
      expense.updatedAt = new Date().toISOString();
      storage.setExpenses(expenses);
      return { success: true, message: 'Action recorded (threshold impossible, admin can override)' };
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
      // Only finalize sequential rejection if the rejecting approver is an admin.
      const users = storage.getUsers();
      const u = users.find(user => user.id === currentApprover.userId);
      if (u?.role === 'admin') {
        expense.status = 'rejected';
        expense.updatedAt = new Date().toISOString();
        storage.setExpenses(expenses);
        return { success: true, message: 'Expense rejected (admin)' };
      }

      // Non-admin rejection in sequence: keep as pending and allow admin override
      expense.updatedAt = new Date().toISOString();
      storage.setExpenses(expenses);
      return { success: true, message: 'Rejection recorded (admin can override)' };
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
    const users = storage.getUsers();
    const user = users.find(u => u.id === userId);

    return expenses.filter(expense => {
      if (!expense.approverState) return false;
      
      const rule = rules.find(r => r.id === expense.approvalRuleId);
      if (!rule) return false;

      if (rule.parallel) {
        // In parallel mode, show if user is in the approvers list and hasn't acted
        const myApproval = expense.approverState.approvers.find(a => a.userId === userId);
        return myApproval && myApproval.status === 'pending';
      } else {
        // In sequential mode, normally show only the current approver. However,
        // admins should see all pending approvals for their company so they can
        // act directly even if they are not the current approver.
        const currentApprover = expense.approverState.approvers[expense.approverState.sequenceIndex];
        if (user?.role === 'admin') {
          const myApproval = expense.approverState.approvers.find(a => a.userId === userId);
          return myApproval && myApproval.status === 'pending';
        }
        return currentApprover?.userId === userId && currentApprover.status === 'pending';
      }
    });
  }
}
