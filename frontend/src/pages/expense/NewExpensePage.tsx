import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/lib/storage';
import { ApprovalEngine } from '@/lib/approvalEngine';
import { ExchangeRateService } from '@/lib/exchangeRates';
import { Expense, Receipt } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
const categories = ['Travel', 'Supplies', 'Equipment', 'Food', 'Entertainment', 'Other'];

const NewExpensePage = () => {
  const navigate = useNavigate();
  const { currentUser, currentCompany } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(true);
  const [receiptFile, setReceiptFile] = useState(null as any);
  const [isScanning, setIsScanning] = useState(false as any);
  const fileInputRef = useRef(null as any);
  const [ocrData, setOcrData] = useState(undefined as any);
  
  const [formData, setFormData] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    paidBy: currentUser?.name || '',
    remarks: '',
    expenseCurrency: currentCompany?.defaultCurrency || 'USD',
    totalAmount: 0,
  });

  const startScan = () => {
    // trigger hidden file input
    fileInputRef.current?.click();
  };

  const handleReceiptUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setIsScanning(true);

    // Simulate 3-second OCR processing and autofill with fixed data
    setTimeout(() => {
      const fixedDateDisplay = '04-10-2025'; // dd-mm-yyyy for display in OCR panel
      const toIso = (ddmmyyyy: string) => {
        const [dd, mm, yyyy] = ddmmyyyy.split('-');
        return `${yyyy}-${mm}-${dd}`; // yyyy-mm-dd for input type="date"
      };

      const fixedData = {
        description: 'purchased supplies',
        date: toIso(fixedDateDisplay),
        category: 'Supplies',
        expenseCurrency: 'USD',
        totalAmount: 531.6429849125534,
        paidBy: 'user 1',
      } as const;

      const mockOcr = {
        amount: fixedData.totalAmount,
        date: fixedDateDisplay,
        merchant: undefined,
        confidence: 1,
      };

      setOcrData(mockOcr);
      setFormData(prev => ({
        ...prev,
        description: fixedData.description,
        date: fixedData.date,
        category: fixedData.category,
        expenseCurrency: fixedData.expenseCurrency,
        totalAmount: fixedData.totalAmount,
        paidBy: fixedData.paidBy,
      }));

      setIsScanning(false);
      toast.success('Receipt scanned and details autofilled');
    }, 3000);
  };

  const handleSubmit = async (e: any, submitAs: 'draft' | 'submit' = 'submit') => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get exchange rate if needed
      let totalInCompanyCurrency = formData.totalAmount;
      let exchangeRate = 1.0;
      let exchangeRateTimestamp = new Date().toISOString();

      if (formData.expenseCurrency !== currentCompany?.defaultCurrency) {
        const conversion = await ExchangeRateService.convert(
          formData.totalAmount,
          formData.expenseCurrency,
          currentCompany!.defaultCurrency
        );
        totalInCompanyCurrency = conversion.amount;
        exchangeRate = conversion.rate;
        exchangeRateTimestamp = conversion.timestamp;
      }

      // Create expense
      const expenseId = `expense-${Date.now()}`;
      const users = storage.getUsers();
      
      const expense: Expense = {
        id: expenseId,
        companyId: currentCompany!.id,
        requesterId: currentUser!.id,
        description: formData.description,
        date: formData.date,
        category: formData.category,
        paidBy: formData.paidBy,
        remarks: formData.remarks,
        expenseCurrency: formData.expenseCurrency,
        totalAmount: formData.totalAmount,
        totalInCompanyCurrency,
        exchangeRate,
        exchangeRateTimestamp,
        status: submitAs === 'draft' ? 'draft' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (submitAs !== 'draft') {
        // Find applicable approval rule
        const rules = storage.getApprovalRules().filter(r => r.companyId === currentCompany?.id);
        const applicableRule = rules.find(r =>
          r.scope === 'all' || r.scope === formData.category
        ) || rules.find(r => r.scope === 'all');

        if (!applicableRule) {
          toast.error('No approval rule found for this expense');
          setIsSubmitting(false);
          return;
        }
        expense.approvalRuleId = applicableRule.id;
        // Initialize approval state
        expense.approverState = ApprovalEngine.initializeApprovalState(
          expense,
          applicableRule,
          users
        );
      }

      // Save receipt if uploaded
      if (receiptFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const receipt: Receipt = {
            id: `receipt-${Date.now()}`,
            expenseId,
            fileName: receiptFile.name,
            fileData: event.target?.result as string,
            ocrData,
            createdAt: new Date().toISOString(),
          };

          const receipts = storage.getReceipts();
          receipts.push(receipt);
          storage.setReceipts(receipts);
          expense.receiptId = receipt.id;
        };
        reader.readAsDataURL(receiptFile);
      }

      const expenses = storage.getExpenses();
      expenses.push(expense);
      storage.setExpenses(expenses);

  toast.success(submitAs === 'draft' ? 'Draft saved' : 'Expense submitted successfully');
  setOpen(false);
  navigate('/employee/expenses');
    } catch (error) {
      toast.error('Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) navigate('/employee/expenses'); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Expense</DialogTitle>
          <CardDescription>Fill in the information for your expense</CardDescription>
        </DialogHeader>
        <form onSubmit={(e) => handleSubmit(e, 'submit')} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Brief description of the expense"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.expenseCurrency}
                  onValueChange={(value) => setFormData({ ...formData, expenseCurrency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalAmount || ''}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By</Label>
              <Input
                id="paidBy"
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (optional)</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Scan Receipt</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={startScan} disabled={isScanning} className="gap-2">
                  {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isScanning ? 'Scanning receipt…' : 'Scan receipt'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </div>
              {ocrData && (
                <div className="text-sm text-muted-foreground mt-2 p-3 rounded-lg bg-muted/50">
                  <div className="font-medium mb-1">OCR Results (Confidence: {(ocrData.confidence! * 100).toFixed(0)}%)</div>
                  {ocrData.merchant && <div>Merchant: {ocrData.merchant}</div>}
                  <div>Amount: {ocrData.amount?.toFixed(2)}</div>
                  <div>Date: {ocrData.date}</div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Expense
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpen(false); navigate('/employee/expenses'); }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={isSubmitting}
              >
                Save as Draft
              </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewExpensePage;
