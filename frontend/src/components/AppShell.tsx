import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import {
  LayoutDashboard,
  Users,
  Receipt,
  CheckCircle2,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const navigate = useNavigate();
  const { currentUser, currentCompany, logout, isImpersonating, stopImpersonation } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStopImpersonation = () => {
    stopImpersonation();
    navigate('/dashboard');
  };

  if (!currentUser || !currentCompany) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const adminNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/approval-rules', icon: FileText, label: 'Approval Rules' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const managerNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/manager/approvals', icon: CheckCircle2, label: 'Approvals' },
    { path: '/employee/expenses', icon: Receipt, label: 'My Expenses' },
  ];

  const employeeNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employee/expenses', icon: Receipt, label: 'My Expenses' },
  ];

  const navItems =
    currentUser.role === 'admin'
      ? adminNavItems
      : currentUser.role === 'manager'
      ? managerNavItems
      : employeeNavItems;

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Top Bar */}
      <header className="h-16 border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50 glass-morphism">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <img src="/company-expense-logo.svg" alt="Company expense logo" className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">{currentCompany.name}</h1>
                <p className="text-xs text-muted-foreground">Expense Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isImpersonating && (
              <Badge variant="secondary" className="gap-2">
                <UserCog className="h-3 w-3" />
                Impersonating
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStopImpersonation}
                  className="h-5 px-2 ml-1"
                >
                  Exit
                </Button>
              </Badge>
            )}
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    <Badge variant="outline" className="w-fit mt-1 capitalize">
                      {currentUser.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex w-full">
        {/* Sidebar */}
        <aside
          className={cn(
            'border-r bg-card/30 backdrop-blur-xl transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)]',
            sidebarOpen ? 'w-64' : 'w-0 lg:w-16',
            'overflow-hidden'
          )}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl transition-smooth focus-ring',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted/50 text-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={cn('transition-opacity', sidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0')}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
