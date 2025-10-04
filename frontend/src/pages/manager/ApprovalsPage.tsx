import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/lib/storage';
import { ApprovalEngine } from '@/lib/approvalEngine';
import { ApprovalActionButtons } from '@/components/ApprovalActionButtons';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

const ApprovalsPage = () => {
  const { currentUser, currentCompany } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const users = storage.getUsers();
  
  // Get expenses pending approval by current user using the approval engine
  const myApprovals = currentUser && currentCompany 
    ? ApprovalEngine.getPendingApprovalsForUser(currentUser.id, currentCompany.id)
    : [];

  const filteredApprovals = myApprovals.filter(expense => {
    const requester = users.find(u => u.id === expense.requesterId);
    return (
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requester?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container-custom py-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
        <p className="text-muted-foreground">Review and approve expense submissions</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Approvals Queue</CardTitle>
          <CardDescription>Review and process pending expense approvals</CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search approvals..."
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
                  <TableHead>Subject</TableHead>
                  <TableHead>Request Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No pending approvals
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApprovals.map((expense) => {
                    const requester = users.find(u => u.id === expense.requesterId);
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>{requester?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currentCompany?.defaultCurrency || 'USD',
                          }).format(expense.totalInCompanyCurrency || expense.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <ApprovalActionButtons 
                              expenseId={expense.id}
                              approverId={currentUser?.id || ''}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalsPage;
