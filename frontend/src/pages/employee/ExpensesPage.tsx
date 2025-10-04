import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/lib/storage';
import { ApprovalEngine } from '@/lib/approvalEngine';
import { Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Send } from 'lucide-react';
import { format } from 'date-fns';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { currentUser, currentCompany } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const expenses = storage.getExpenses().filter(e => 
    e.companyId === currentCompany?.id && e.requesterId === currentUser?.id
  );

  const users = storage.getUsers();

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatusDot = ({ status }: { status: Expense['status'] }) => {
    const color = status === 'draft' ? 'bg-white border' :
      status === 'pending' ? 'bg-yellow-400' :
      status === 'rejected' ? 'bg-red-500' : 'bg-green-500';
    return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
  };
  const getStatusBadge = (status: Expense['status']) => (
    <div className="flex items-center gap-2">
      <StatusDot status={status} />
      <Badge variant={status === 'rejected' ? 'destructive' : status === 'draft' ? 'secondary' : 'default'}>{status}</Badge>
    </div>
  );

  return (
    <div className="container-custom py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Expenses</h2>
          <p className="text-muted-foreground">Track and manage your expense submissions</p>
        </div>
        <Button onClick={() => navigate('/expenses/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Expense
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>All your submitted expenses and their approval status</CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No expenses found. Click "New Expense" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>{expense.paidBy}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: expense.expenseCurrency,
                            }).format(expense.totalAmount)}
                          </div>
                          {expense.totalInCompanyCurrency && expense.expenseCurrency !== currentCompany?.defaultCurrency && (
                            <div className="text-xs text-muted-foreground">
                              ≈ {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: currentCompany?.defaultCurrency,
                              }).format(expense.totalInCompanyCurrency)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(expense.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/expenses/${expense.id}`)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {expense.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Submit"
                            onClick={() => {
                              // submit the draft: set to pending and initialize approval
                              const all = storage.getExpenses();
                              const idx = all.findIndex(e => e.id === expense.id);
                              if (idx !== -1) {
                                const rules = storage.getApprovalRules().filter(r => r.companyId === currentCompany?.id);
                                const applicableRule = rules.find(r => r.scope === 'all' || r.scope === expense.category) || rules.find(r => r.scope === 'all');
                                if (!applicableRule) return;
                                const usersList = storage.getUsers();
                                const updated = { ...all[idx] } as any;
                                updated.status = 'pending';
                                updated.approvalRuleId = applicableRule.id;
                                updated.approverState = ApprovalEngine.initializeApprovalState(updated, applicableRule, usersList);
                                updated.updatedAt = new Date().toISOString();
                                all[idx] = updated;
                                storage.setExpenses(all);
                                // force refresh
                                navigate(0 as any);
                              }
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesPage;
