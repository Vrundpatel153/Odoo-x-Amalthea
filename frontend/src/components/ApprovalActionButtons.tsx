import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ApprovalEngine } from '@/lib/approvalEngine';
import { toast } from 'sonner';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ApprovalActionButtonsProps {
  expenseId: string;
  approverId: string;
  onActionComplete?: () => void;
}

export const ApprovalActionButtons = ({ 
  expenseId, 
  approverId,
  onActionComplete 
}: ApprovalActionButtonsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('approved' as 'approved' | 'rejected');
  const [comment, setComment] = useState('');

  const handleAction = (action: 'approved' | 'rejected') => {
    setActionType(action);
    setIsDialogOpen(true);
  };

  const handleSubmitAction = () => {
    try {
      const result = ApprovalEngine.processApprovalAction(
        expenseId,
        approverId,
        actionType,
        comment
      );

      if (result.success) {
        toast.success(result.message);
        setIsDialogOpen(false);
        setComment('');
        
        if (onActionComplete) {
          onActionComplete();
        } else {
          setTimeout(() => window.location.reload(), 500);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Approval action error:', error);
      toast.error('Failed to process approval action');
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => handleAction('approved')}
          className="gap-1"
        >
          <CheckCircle2 className="h-3 w-3" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleAction('rejected')}
          className="gap-1"
        >
          <XCircle className="h-3 w-3" />
          Reject
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approved' ? 'Approve Expense' : 'Reject Expense'}
            </DialogTitle>
            <DialogDescription>
              Add a comment for this approval action (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Add your comments here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitAction}
                className="flex-1"
                variant={actionType === 'approved' ? 'default' : 'destructive'}
              >
                Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setComment('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
