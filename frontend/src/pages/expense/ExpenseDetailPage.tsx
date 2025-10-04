import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, DollarSign, User, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ExpenseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const expense = storage.getExpenses().find(e => e.id === id);
  const users = storage.getUsers();
  const receipts = storage.getReceipts();
  const approvalActions = storage.getApprovalActions();

  if (!expense) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Expense not found</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const requester = users.find(u => u.id === expense.requesterId);
  const receipt = receipts.find(r => r.id === expense.receiptId);
  const actions = approvalActions.filter(a => a.expenseId === expense.id);

  return (
    <div className="container-custom py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expense Details</h2>
          <p className="text-muted-foreground">View complete expense information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{expense.description}</p>
              </div>
              <Badge variant={
                expense.status === 'approved' ? 'default' :
                expense.status === 'rejected' ? 'destructive' :
                'secondary'
              }>
                {expense.status}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Date
                </div>
                <p className="font-medium">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Category
                </div>
                <Badge variant="outline">{expense.category}</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Requester
              </div>
              <p className="font-medium">{requester?.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Paid By</p>
              <p className="font-medium">{expense.paidBy}</p>
            </div>

            {expense.remarks && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Remarks</p>
                  <p className="text-sm">{expense.remarks}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Original Amount
              </div>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: expense.expenseCurrency,
                }).format(expense.totalAmount)}
              </p>
            </div>

            {expense.totalInCompanyCurrency && expense.exchangeRate && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Converted Amount</p>
                  <p className="text-xl font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(expense.totalInCompanyCurrency)}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Rate: {expense.exchangeRate.toFixed(4)}</div>
                    <div>
                      Updated: {format(new Date(expense.exchangeRateTimestamp!), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {expense.approverState && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Approval Status</CardTitle>
            <CardDescription>Current approval workflow state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expense.approverState.approvers.map((approver, index) => {
                const approverUser = users.find(u => u.id === approver.userId);
                const action = actions.find(a => a.approverId === approver.userId);
                
                return (
                  <div key={approver.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background">
                        {approver.status === 'approved' ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : approver.status === 'rejected' ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{approverUser?.name}</p>
                        {action?.comment && (
                          <p className="text-sm text-muted-foreground">{action.comment}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        approver.status === 'approved' ? 'default' :
                        approver.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {approver.status}
                      </Badge>
                      {approver.actedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(approver.actedAt), 'MMM dd, HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {receipt && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">File: {receipt.fileName}</p>
              {receipt.fileData.startsWith('data:image') && (
                <img 
                  src={receipt.fileData} 
                  alt="Receipt" 
                  className="max-w-full rounded-lg border"
                />
              )}
              {receipt.ocrData && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                  <p className="font-medium">OCR Data (Confidence: {(receipt.ocrData.confidence! * 100).toFixed(0)}%)</p>
                  <p>Merchant: {receipt.ocrData.merchant}</p>
                  <p>Amount: {receipt.ocrData.amount?.toFixed(2)}</p>
                  <p>Date: {receipt.ocrData.date}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseDetailPage;
