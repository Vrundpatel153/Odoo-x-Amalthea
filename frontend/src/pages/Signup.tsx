import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { CountryCurrencyService, type CountryInfo } from '@/lib/countries';

// Dynamic countries will be fetched at runtime

const Signup = () => {
  const navigate = useNavigate();
  const signup = useAuthStore(state => state.signup);
  
  const [formData, setFormData] = useState({
    companyName: '',
    adminName: '',
    email: '',
    password: '',
    country: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([] as CountryInfo[]);

  useEffect(() => {
    let mounted = true;
    CountryCurrencyService.getCountries().then((list) => {
      if (!mounted) return;
      setCountries(list);
    });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.adminName || !formData.email || !formData.password || !formData.country) {
      toast.error('All fields are required', {
        description: 'Please fill in all the fields to continue',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await signup(
        formData.companyName,
        formData.adminName,
        formData.email,
        formData.password,
        formData.country
      );

      if (success) {
        toast.success('Welcome aboard!', {
          description: 'Your account has been created successfully',
        });
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        toast.error('Registration failed', {
          description: 'This email is already registered',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 overflow-hidden">
      {/* stronger background accent to match Login */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_40%,#000_10%,transparent_70%)]">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>
      {/* Home link */}
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
        ← Home
      </button>
      <div className="w-full max-w-md space-y-4 relative">
        <Card className="glass-card">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <img src="/logo-web.png" alt="Logo" className="h-8 w-8 object-contain" />
              </div>
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Set up your company's expense management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Corporation"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                  disabled={isLoading}
                  className="focus-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={async (value) => {
                    // On country change, we still store the country name.
                    // default currency is resolved during signup in store.
                    setFormData({ ...formData, country: value });
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger id="country" className="focus-ring">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}{c.primaryCurrency ? ` · ${c.primaryCurrency}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminName">Your Name</Label>
                <Input
                  id="adminName"
                  placeholder="John Doe"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  required
                  disabled={isLoading}
                  className="focus-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                  className="focus-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  className="focus-ring"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Creating account…' : 'Create Account'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate('/login')}
                  disabled={isLoading}
                >
                  Sign in
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
