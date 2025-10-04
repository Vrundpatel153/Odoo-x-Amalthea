import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/lib/storage';
import { seedData } from '@/lib/seedData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn, Database } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password);

    if (success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid email or password');
    }
  };

  const handleResetToSeed = () => {
    storage.importAll(seedData);
    toast.success('Database reset to seed data');
  };

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="glass-card">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your expense management account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@acme.test"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus-ring"
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Test Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('admin@acme.test', 'Admin@123')}
                className="justify-start text-xs"
              >
                <span className="font-semibold">Admin:</span>
                <span className="ml-2 text-muted-foreground">admin@acme.test</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('manager@acme.test', 'Manager@123')}
                className="justify-start text-xs"
              >
                <span className="font-semibold">Manager:</span>
                <span className="ml-2 text-muted-foreground">manager@acme.test</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('employee@acme.test', 'Employee@123')}
                className="justify-start text-xs"
              >
                <span className="font-semibold">Employee:</span>
                <span className="ml-2 text-muted-foreground">employee@acme.test</span>
              </Button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetToSeed}
              className="w-full mt-4"
            >
              Reset to Seed Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
