import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import ApprovalRulesPage from "./pages/admin/ApprovalRulesPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ExpensesPage from "./pages/employee/ExpensesPage";
import ApprovalsPage from "./pages/manager/ApprovalsPage";
import NewExpensePage from "./pages/expense/NewExpensePage";
import ExpenseDetailPage from "./pages/expense/ExpenseDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard />
              </AppShell>
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppShell>
                <UsersPage />
              </AppShell>
            </ProtectedRoute>
          } />

          <Route path="/admin/approval-rules" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppShell>
                <ApprovalRulesPage />
              </AppShell>
            </ProtectedRoute>
          } />

          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppShell>
                <SettingsPage />
              </AppShell>
            </ProtectedRoute>
          } />

          <Route path="/employee/expenses" element={
            <ProtectedRoute>
              <AppShell>
                <ExpensesPage />
              </AppShell>
            </ProtectedRoute>
          } />

          <Route path="/manager/approvals" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <AppShell>
                <ApprovalsPage />
              </AppShell>
            </ProtectedRoute>
          } />

          <Route path="/expenses/new" element={
            <ProtectedRoute>
              <AppShell>
                <NewExpensePage />
              </AppShell>
            </ProtectedRoute>
          } />

          <Route path="/expenses/:id" element={
            <ProtectedRoute>
              <AppShell>
                <ExpenseDetailPage />
              </AppShell>
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
