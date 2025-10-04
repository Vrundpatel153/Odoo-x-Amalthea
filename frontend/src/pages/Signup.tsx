import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, User, Mail, Lock, Globe, ArrowRight, Sparkles, UserPlus } from 'lucide-react';

const countries = [
  'United States',
  'United Kingdom',
  'Eurozone',
  'Japan',
  'Canada',
  'Australia',
];

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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-fuchsia-300 dark:bg-fuchsia-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-violet-300 dark:bg-violet-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        
        {/* Sparkle Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="sparkle" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className="sparkle" style={{ top: '60%', left: '80%', animationDelay: '2s' }} />
          <div className="sparkle" style={{ top: '40%', left: '60%', animationDelay: '4s' }} />
          <div className="sparkle" style={{ top: '80%', left: '30%', animationDelay: '3s' }} />
          <div className="sparkle" style={{ top: '15%', left: '85%', animationDelay: '1s' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md px-4 z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-700 shadow-2xl shadow-purple-500/50 mb-6 transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img src="/logo-web.png" alt="Logo" className="h-12 w-12 object-contain filter brightness-0 invert relative z-10" />
            <div className="absolute inset-0 rounded-3xl ring-4 ring-purple-400/50 ring-offset-2 ring-offset-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-gradient">
            Expense Manager
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
            Smart expense tracking for modern teams
            <Sparkles className="w-4 h-4 text-fuchsia-500 animate-pulse animation-delay-1000" />
          </p>
        </div>

        {/* Signup Card */}
        <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 border-2 border-white/30 dark:border-purple-900/30 shadow-2xl shadow-purple-500/20 animate-slide-up hover:shadow-purple-500/30 transition-shadow duration-300 relative overflow-hidden group">
          {/* Card Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          
          <CardHeader className="space-y-1 pb-6 relative">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-base">
              Set up your company's expense management system
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company Name Field */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  Company Name
                </Label>
                <div className="relative group/input">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-purple-600 transition-colors duration-200" />
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-2 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/50 dark:bg-gray-900/50"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 via-fuchsia-500/0 to-purple-500/0 group-focus-within/input:from-purple-500/10 group-focus-within/input:via-fuchsia-500/10 group-focus-within/input:to-purple-500/10 pointer-events-none transition-all duration-300" />
                </div>
              </div>

              {/* Country Field */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  Country
                </Label>
                <div className="relative group/input">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 pointer-events-none group-focus-within/input:text-purple-600 transition-colors duration-200" />
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger 
                      id="country" 
                      className="pl-10 h-12 border-2 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/50 dark:bg-gray-900/50"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 via-fuchsia-500/0 to-purple-500/0 group-focus-within/input:from-purple-500/10 group-focus-within/input:via-fuchsia-500/10 group-focus-within/input:to-purple-500/10 pointer-events-none transition-all duration-300" />
                </div>
              </div>

              {/* Admin Name Field */}
              <div className="space-y-2">
                <Label htmlFor="adminName" className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  Your Name
                </Label>
                <div className="relative group/input">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-purple-600 transition-colors duration-200" />
                  <Input
                    id="adminName"
                    placeholder="John Doe"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-2 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/50 dark:bg-gray-900/50"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 via-fuchsia-500/0 to-purple-500/0 group-focus-within/input:from-purple-500/10 group-focus-within/input:via-fuchsia-500/10 group-focus-within/input:to-purple-500/10 pointer-events-none transition-all duration-300" />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  Email Address
                </Label>
                <div className="relative group/input">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-purple-600 transition-colors duration-200" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-2 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/50 dark:bg-gray-900/50"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 via-fuchsia-500/0 to-purple-500/0 group-focus-within/input:from-purple-500/10 group-focus-within/input:via-fuchsia-500/10 group-focus-within/input:to-purple-500/10 pointer-events-none transition-all duration-300" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  Password
                </Label>
                <div className="relative group/input">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-purple-600 transition-colors duration-200" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-2 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/50 dark:bg-gray-900/50"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 via-fuchsia-500/0 to-purple-500/0 group-focus-within/input:from-purple-500/10 group-focus-within/input:via-fuchsia-500/10 group-focus-within/input:to-purple-500/10 pointer-events-none transition-all duration-300" />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 group/btn font-semibold text-base relative overflow-hidden" 
                size="lg"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </Button>

              {/* Sign In Link */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-950 px-3 text-muted-foreground font-semibold">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-purple-200 dark:border-purple-800/50 bg-white/50 dark:bg-gray-900/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-fuchsia-50 dark:hover:from-purple-950/30 dark:hover:to-fuchsia-950/30 hover:border-purple-400 dark:hover:border-purple-600 text-gray-900 dark:text-gray-100 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-300 font-semibold text-base shadow-sm hover:shadow-md relative overflow-hidden group/signin"
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-fuchsia-500/10 to-purple-500/0 opacity-0 group-hover/signin:opacity-100 transition-opacity duration-300" />
                <span className="relative">Sign in instead</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2 animate-fade-in animation-delay-200">
          <p className="text-xs text-muted-foreground">
            © 2025 Expense Manager. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors font-medium">
              Privacy Policy
            </button>
            <span className="text-muted-foreground">•</span>
            <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors font-medium">
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgb(0 0 0 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          border-radius: 50%;
          animation: sparkle 6s ease-in-out infinite;
          box-shadow: 0 0 10px #a855f7, 0 0 20px #ec4899;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
        }
      `}</style>
    </div>
  );
};

export default Signup;
