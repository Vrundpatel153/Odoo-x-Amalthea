import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/lib/storage';
import { ApprovalRule } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

const ApprovalRulesPage = () => {
  const { currentCompany } = useAuthStore();
  const [rules, setRules] = useState(storage.getApprovalRules().filter(r => r.companyId === currentCompany?.id));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null as ApprovalRule | null);
  const [formData, setFormData] = useState({
    name: '',
    scope: 'all',
    parallel: false,
    minApprovalPercentage: 100,
    escalationDays: 3,
    approverIds: [] as string[],
    requiredFlags: {} as Record<string, boolean>,
    specificApproverId: 'none',
  });

  // Exclude employees from being approvers; only managers/admins can be selected
  const users = storage
    .getUsers()
    .filter(u => u.companyId === currentCompany?.id && u.role !== 'employee');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    const allRules = storage.getApprovalRules();
    const sequence = formData.approverIds.length > 0 ? formData.approverIds : ['manager'];
    const requiredFlags = { ...formData.requiredFlags };
    // normalize specificApproverId
    const specific = formData.specificApproverId === 'none' ? null : formData.specificApproverId;

    const newRule: ApprovalRule = {
      id: editingRule?.id || `rule-${Date.now()}`,
      companyId: currentCompany!.id,
      name: formData.name,
      scope: formData.scope,
      sequence,
      parallel: formData.parallel,
      requiredFlags,
      minApprovalPercentage: formData.minApprovalPercentage,
      specificApproverId: specific,
      escalationDays: formData.escalationDays,
      createdAt: editingRule?.createdAt || new Date().toISOString(),
    };

    let updatedRules;
    if (editingRule) {
      updatedRules = allRules.map(r => r.id === editingRule.id ? newRule : r);
      toast.success('Rule updated successfully');
    } else {
      updatedRules = [...allRules, newRule];
      toast.success('Rule created successfully');
    }

    storage.setApprovalRules(updatedRules);
    setRules(updatedRules.filter(r => r.companyId === currentCompany?.id));
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      scope: rule.scope,
      parallel: rule.parallel,
      minApprovalPercentage: rule.minApprovalPercentage,
      escalationDays: rule.escalationDays,
      approverIds: rule.sequence || [],
      requiredFlags: rule.requiredFlags || {},
      specificApproverId: rule.specificApproverId || 'none',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this approval rule?')) return;

    const allRules = storage.getApprovalRules();
    const updatedRules = allRules.filter(r => r.id !== ruleId);
    storage.setApprovalRules(updatedRules);
    setRules(updatedRules.filter(r => r.companyId === currentCompany?.id));
    toast.success('Rule deleted successfully');
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      scope: 'all',
      parallel: false,
      minApprovalPercentage: 100,
      escalationDays: 3,
      approverIds: [],
      requiredFlags: {},
      specificApproverId: 'none',
    });
  };

  return (
    <div className="container-custom py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Approval Rules</h2>
          <p className="text-muted-foreground">Configure expense approval workflows</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Approval Rule' : 'Create Approval Rule'}</DialogTitle>
              <DialogDescription>
                Configure how expenses should be approved
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope (category or "all")</Label>
                <Input
                  id="scope"
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  placeholder="all"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Approvers (sequence)</Label>
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.approverIds.includes(u.id)}
                        onChange={(e) => {
                          const ids = new Set(formData.approverIds);
                          if (e.target.checked) ids.add(u.id); else ids.delete(u.id);
                          setFormData({ ...formData, approverIds: Array.from(ids) });
                        }}
                      />
                      <span className="flex-1">{u.name} <span className="text-xs text-muted-foreground">({u.role})</span></span>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!formData.requiredFlags[u.id]}
                          onChange={(e) => {
                            const flags = { ...formData.requiredFlags };
                            if (e.target.checked) flags[u.id] = true; else delete flags[u.id];
                            setFormData({ ...formData, requiredFlags: flags });
                          }}
                        />
                        Required
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specific">Specific Approver (auto-approve if this approver approves)</Label>
                <Select value={formData.specificApproverId} onValueChange={(val) => setFormData({ ...formData, specificApproverId: val })}>
                  <SelectTrigger id="specific">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="parallel">Parallel Approval</Label>
                <Switch
                  id="parallel"
                  checked={formData.parallel}
                  onCheckedChange={(checked) => setFormData({ ...formData, parallel: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minPercentage">Minimum Approval Percentage</Label>
                <Input
                  id="minPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.minApprovalPercentage}
                  onChange={(e) => setFormData({ ...formData, minApprovalPercentage: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="escalationDays">Escalation Days</Label>
                <Input
                  id="escalationDays"
                  type="number"
                  min="1"
                  value={formData.escalationDays}
                  onChange={(e) => setFormData({ ...formData, escalationDays: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingRule ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Approval Rules</CardTitle>
          <CardDescription>Manage expense approval workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Min %</TableHead>
                  <TableHead>Escalation (days)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.scope}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.parallel ? 'default' : 'secondary'}>
                        {rule.parallel ? 'Parallel' : 'Sequential'}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.minApprovalPercentage}%</TableCell>
                    <TableCell>{rule.escalationDays}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(rule)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalRulesPage;
