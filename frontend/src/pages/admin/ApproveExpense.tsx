import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/lib/storage';
import { ApprovalEngine } from '@/lib/approvalEngine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

const ApproveExpensePage = () => {
  const { currentUser, currentCompany } = useAuthStore();
  const [pending, setPending] = useState<any[]>([]);
  const [users, setUsers] = useState(storage.getUsers());
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!currentUser || !currentCompany) return;
    refresh();
    setUsers(storage.getUsers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, currentCompany]);

  const refresh = () => {
    if (!currentUser || !currentCompany) return;
    const items = ApprovalEngine.getPendingApprovalsForUser(currentUser.id, currentCompany.id);
    setPending(items);
  };

  const handleAction = (expenseId: string, action: 'approved' | 'rejected') => {
    if (!currentUser) return;
    const res = ApprovalEngine.processApprovalAction(expenseId, currentUser.id, action, comment || undefined);
    if (res.success) {
      toast.success(res.message);
      setComment('');
      setSelectedExpense(null);
      refresh();
    } else {
      toast.error(res.message || 'Action failed');
    }
  };

  if (!currentUser || !currentCompany) return null;

  return (
    <div className="container-custom py-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Approve Expenses</h2>
        <p className="text-muted-foreground">Expenses awaiting your approval</p>
      </div>

      <Card className="glass-card mt-6">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>These requests are available for admin action (after manager approval where applicable)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">No pending approvals</TableCell>
                  </TableRow>
                )}

                {pending.map(expense => {
                  const requester = users.find(u => u.id === expense.requesterId);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{requester?.name || expense.requesterId}</TableCell>
                      <TableCell className="max-w-sm truncate">{expense.description}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentCompany.defaultCurrency }).format(expense.totalInCompanyCurrency || expense.totalAmount)}
                      </TableCell>
                      <TableCell className="capitalize">{expense.status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog open={selectedExpense?.id === expense.id} onOpenChange={(open) => {
                            if (!open) {
                              setSelectedExpense(null);
                              setComment('');
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedExpense(expense)}>
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Expense</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="font-medium">{expense.description}</p>
                                  <p className="text-sm text-muted-foreground">Requested by {requester?.name}</p>
                                  <p className="text-sm">Amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentCompany.defaultCurrency }).format(expense.totalInCompanyCurrency || expense.totalAmount)}</p>
                                </div>

                                {/* Approver state */}
                                {expense.approverState && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Approval Progress</h4>
                                    <div className="space-y-1">
                                      {expense.approverState.approvers.map((a: any, idx: number) => {
                                        const user = users.find(u => u.id === a.userId);
                                        const isManager = user?.role === 'manager';
                                        return (
                                          <div key={a.userId} className="flex items-start justify-between gap-4 p-2 rounded-md border">
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium">{user?.name || a.userId}</span>
                                                <span className="text-xs text-muted-foreground">{user?.role}</span>
                                                {isManager && <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 rounded">Manager</span>}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {a.comment && <div><strong>Comment:</strong> {a.comment}</div>}
                                                {a.actedAt && <div><strong>At:</strong> {new Date(a.actedAt).toLocaleString()}</div>}
                                              </div>
                                            </div>
                                            <div className="flex items-center">
                                              <span className={`px-2 py-1 rounded text-sm ${a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {a.status}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <Label>Comment (optional)</Label>
                                  <Textarea value={comment} onChange={(e: any) => setComment(e.target.value)} />
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" onClick={() => { setComment(''); setSelectedExpense(null); }}>
                                    Close
                                  </Button>
                                  <Button onClick={() => handleAction(expense.id, 'rejected')} variant="destructive" className="flex items-center gap-2">
                                    <X className="h-4 w-4" />
                                    Reject
                                  </Button>
                                  <Button onClick={() => handleAction(expense.id, 'approved')} className="flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApproveExpensePage;
