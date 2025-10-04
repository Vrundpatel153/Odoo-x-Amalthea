import { useState } from 'react';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const SettingsPage = () => {
  const { currentCompany, logout } = useAuthStore();
  const handleExport = () => {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ems-export-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          storage.importAll(data);
          toast.success('Data imported successfully. Please refresh the page.');
        } catch (error) {
          toast.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleDeleteCompany = () => {
    if (!currentCompany) {
      toast.error('No company to delete');
      return;
    }
    const ok = confirm('Delete this company and ALL its data (users, expenses, receipts, rules, logs)? This cannot be undone.');
    if (!ok) return;

    const companyId = currentCompany.id;
    // Filter out company-specific records
    const companies = storage.getCompanies().filter(c => c.id !== companyId);
    const users = storage.getUsers().filter(u => u.companyId !== companyId);
    const expenses = storage.getExpenses().filter(e => e.companyId !== companyId);
    const receipts = storage.getReceipts().filter(r => !expenses.some(e => e.id === r.expenseId));
    const rules = storage.getApprovalRules().filter(r => r.companyId !== companyId);
    const actions = storage.getApprovalActions().filter(a => !expenses.some(e => e.id === a.expenseId));

    storage.setCompanies(companies);
    storage.setUsers(users);
    storage.setExpenses(expenses);
    storage.setReceipts(receipts);
    storage.setApprovalRules(rules);
    storage.setApprovalActions(actions);

    toast.success('Company and all related data deleted');
    // End session and redirect to landing
    logout();
    setTimeout(() => window.location.assign('/'), 300);
  };

  const handleClearAll = () => {
    const ok = confirm('Remove all imported JSON data and local records? This will clear the app data from your browser.');
    if (!ok) return;
    storage.clearAll();
    toast.success('All data removed');
    setTimeout(() => window.location.reload(), 300);
  };

  // Removed reset to seed functionality from production UI

  return (
    <div className="container-custom py-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage system settings and data</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Download all system data as JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="gap-2 w-full">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Upload and restore data from JSON file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleImport} variant="secondary" className="gap-2 w-full">
              <Upload className="h-4 w-4" />
              Import JSON
            </Button>
            <div className="mt-3" />
            <Button onClick={handleClearAll} variant="destructive" className="gap-2 w-full">
              <Trash2 className="h-4 w-4" />
              Remove imported JSON data
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Company
            </CardTitle>
            <CardDescription>
              Permanently delete this company and all associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDeleteCompany} variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete company and all data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
