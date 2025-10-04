import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Shield, Globe, BadgeDollarSign, BarChart3, Clock, CheckCircle2, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      {/* Ambient background accents */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_30%,#000_20%,transparent_70%)]">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px', color: 'var(--border)' }} />
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-web.png" alt="Logo" className="h-8 w-8 object-contain" />
          <span className="font-semibold">Expense Manager</span>
        </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" className="text-sm" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Features
            </Button>
            <Button variant="ghost" className="text-sm" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate('/signup')}>
              Get started
            </Button>
            <div className="ml-1">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Streamlined spend control for teams
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Control expenses with clarity
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Submit, approve, and track expenses with smart workflows, multi‑currency support, and insightful dashboards.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/signup')}>Get started</Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')}>Sign in</Button>
            </div>
            {/* Social proof */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 items-center opacity-80">
              <div className="text-xs text-muted-foreground">Multi‑currency</div>
              <div className="text-xs text-muted-foreground">Audit ready</div>
              <div className="text-xs text-muted-foreground">Secure</div>
              <div className="text-xs text-muted-foreground">Fast setup</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Everything you need</h2>
              <p className="mt-2 text-muted-foreground">Modern tooling to keep spending under control without slowing anyone down.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard icon={<Shield className="h-5 w-5 text-primary" />} title="Approval workflows" desc="Sequential or parallel approvals with minimum thresholds and required approvers." />
              <FeatureCard icon={<BadgeDollarSign className="h-5 w-5 text-primary" />} title="Policy & limits" desc="Set per‑role rules, categories, and amount limits to keep spend in bounds." />
              <FeatureCard icon={<Globe className="h-5 w-5 text-primary" />} title="Multi‑currency" desc="Auto‑convert with up‑to‑date rates and report in your company currency." />
              <FeatureCard icon={<BarChart3 className="h-5 w-5 text-primary" />} title="Dashboards" desc="Get instant visibility with trend charts and status breakdowns." />
              <FeatureCard icon={<Clock className="h-5 w-5 text-primary" />} title="Fast capture" desc="Scan receipts and autofill details to submit in seconds." />
              <FeatureCard icon={<CheckCircle2 className="h-5 w-5 text-primary" />} title="Audit trail" desc="Every action is logged for compliance and accountability." />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3">
            <StepCard step="1" title="Submit" desc="Employees add expenses, scan receipts, and pick categories." />
            <StepCard step="2" title="Approve" desc="Managers review with clear context and one‑click actions." />
            <StepCard step="3" title="Track" desc="Finance monitors status and spends from one dashboard." />
          </div>
        </section>

        {/* CTA band */}
        <section className="container mx-auto px-4 pb-16">
          <div className="rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold">Ready to modernize expense management?</h3>
              <p className="text-muted-foreground mt-1">Start free and invite your team in minutes.</p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={() => navigate('/signup')}>Get started</Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')}>Sign in</Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/logo-web.png" alt="Logo" className="h-5 w-5 object-contain" />
            <span>Expense Manager</span>
          </div>
          <div>© {new Date().getFullYear()} Expense Manager</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

// Small presentational components
function FeatureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-transform hover:-translate-y-0.5 hover:shadow-sm">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <div className="font-medium">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
        {step}
      </div>
      <div className="font-medium">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
