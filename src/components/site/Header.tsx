import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Heart, LayoutDashboard, LogOut, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">ServiceHub</span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 text-sm md:flex">
          <Link to="/browse" className="rounded-full px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">Browse</Link>
          <Link to="/browse" search={{ q: "" } as never} className="rounded-full px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">How it works</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/browse" className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-soft transition hover:bg-muted sm:flex">
            <Search className="h-4 w-4" /> Search services
          </Link>
          {user ? (
            <>
              <Link to="/favorites" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition hover:bg-muted" aria-label="Favorites">
                <Heart className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="hidden items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 sm:inline-flex">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button onClick={signOut} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition hover:bg-muted" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
