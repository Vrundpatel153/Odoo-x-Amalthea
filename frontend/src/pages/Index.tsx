import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      {/* ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_30%,#000_20%,transparent_70%)]">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      {/* header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo-web.png" alt="Logo" className="h-8 w-8 object-contain" />
          <span className="font-semibold">Expense Management</span>
        </div>
        <nav className="flex items-center gap-3">
          <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => navigate('/login')}>Sign in</button>
          <button className="text-sm text-primary hover:underline underline-offset-4" onClick={() => navigate('/signup')}>Get started</button>
        </nav>
      </header>

      {/* hero */}
      <main className="container mx-auto px-4 relative z-10">
        <section className="py-20 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Control expenses with clarity
          </h1>
          <p className="mt-4 text-muted-foreground">
            Submit, approve, and track expenses with smart workflows, multi-currency support, and insightful dashboards.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button className="px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition" onClick={() => navigate('/signup')}>
              Get started
            </button>
            <button className="px-5 py-3 rounded-lg border hover:bg-muted transition" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 pb-8 text-center text-sm text-muted-foreground relative z-10">
        © {new Date().getFullYear()} Expense Management System
      </footer>
    </div>
  );
};

export default Index;
