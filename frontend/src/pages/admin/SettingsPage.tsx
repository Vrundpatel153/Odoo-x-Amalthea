import { useState } from 'react';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';

const SettingsPage = () => {
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
          </CardContent>
        </Card>

        {/* Reset to Seed removed */}
      </div>
    </div>
  );
};

export default SettingsPage;
