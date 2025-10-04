import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/lib/storage';
import { Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye } from 'lucide-react';
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

  const getStatusBadge = (status: Expense['status']) => {
    const variants = {
      draft: 'secondary' as const,
      pending: 'default' as const,
      approved: 'default' as const,
      rejected: 'destructive' as const,
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

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
