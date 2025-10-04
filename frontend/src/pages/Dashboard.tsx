import { useAuthStore } from '@/store/authStore';
import { storage } from '@/lib/storage';
import { ApprovalEngine } from '@/lib/approvalEngine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  TrendingUp,
  DollarSign,
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser, currentCompany } = useAuthStore();

  if (!currentUser || !currentCompany) return null;

  const expenses = storage.getExpenses().filter(e => e.companyId === currentCompany.id);
  const users = storage.getUsers().filter(u => u.companyId === currentCompany.id);

  const totalExpenses = expenses.length;
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
  const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
  const rejectedExpenses = expenses.filter(e => e.status === 'rejected').length;
  const totalAmount = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + (e.totalInCompanyCurrency || e.totalAmount), 0);

  
  const myExpenses = expenses.filter(e => e.requesterId === currentUser.id);
  const myPending = myExpenses.filter(e => e.status === 'pending').length;
  const myApproved = myExpenses.filter(e => e.status === 'approved').length;

  const myApprovals = ApprovalEngine.getPendingApprovalsForUser(currentUser.id, currentCompany.id);

  const StatusDot = ({ status }: { status: 'draft' | 'pending' | 'approved' | 'rejected' }) => {
    const color = status === 'draft' ? 'bg-white border' :
      status === 'pending' ? 'bg-yellow-400' :
      status === 'rejected' ? 'bg-red-500' : 'bg-green-500';
    return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
  };

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your expense management system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingExpenses}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedExpenses}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Approved Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currentCompany.defaultCurrency,
              }).format(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All approved expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>System overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Users</span>
              </div>
              <span className="font-semibold">{users.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">Rejected</span>
              </div>
              <span className="font-semibold">{rejectedExpenses}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm">Approval Rate</span>
              </div>
              <span className="font-semibold">
                {totalExpenses > 0
                  ? Math.round((approvedExpenses / (approvedExpenses + rejectedExpenses || 1)) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest expense submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.slice(0, 5).map(expense => {
              const requester = users.find(u => u.id === expense.requesterId);
              return (
                <div key={expense.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">{requester?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot status={expense.status as any} />
                    <Badge variant={
                      expense.status === 'approved' ? 'default' :
                      expense.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {expense.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderManagerDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Your approvals and expense overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myApprovals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires your action</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myExpenses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{myPending} pending</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myApproved}</div>
            <p className="text-xs text-muted-foreground mt-1">Your expenses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Your expense overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myExpenses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myPending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myApproved}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="container-custom py-8">
      {currentUser.role === 'admin' && renderAdminDashboard()}
      {currentUser.role === 'manager' && renderManagerDashboard()}
      {currentUser.role === 'employee' && renderEmployeeDashboard()}
    </div>
  );
};

export default Dashboard;
