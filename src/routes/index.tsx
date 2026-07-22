import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Star, ShieldCheck, Zap, Calendar, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ServiceCard } from "@/components/site/ServiceCard";
import { fetchCategories, fetchServices } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ServiceHub — Book trusted local professionals" },
      { name: "description", content: "Discover, book and review local service providers across home, wellness, beauty, education, IT, events and more." },
      { property: "og:title", content: "ServiceHub — Book trusted local professionals" },
      { property: "og:description", content: "A warm, modern marketplace to book vetted pros in your city." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: services = [] } = useQuery({ queryKey: ["services", "home"], queryFn: () => fetchServices() });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/browse", search: { q, city } as never });
  }

  const featured = services.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Zap className="h-3.5 w-3.5" /> Trusted local pros, on demand
            </span>
            <h1 className="mt-4 text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[68px]">
              Book <span className="italic text-primary">anything</span>,<br /> from anyone nearby.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              From haircuts to home repairs, tutors to dog walkers — find vetted professionals and book them in a few taps.
            </p>

            <form onSubmit={submit} className="mt-8 flex flex-col gap-2 rounded-3xl border border-border bg-card p-2 shadow-card sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-2xl px-4 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you need?" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </div>
              <div className="hidden w-px bg-border sm:block" />
              <div className="flex flex-1 items-center gap-2 rounded-2xl px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground">Where</span>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
                Search <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {categories.slice(0, 6).map((c) => (
                <Link key={c.id} to="/browse" search={{ category: c.slug } as never} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-muted">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-secondary/60 to-primary/20 blur-2xl" />
            <img src={heroImg} alt="A friendly local service professional" width={1600} height={1200} className="aspect-[4/5] w-full rounded-[2.5rem] object-cover shadow-card" />
            <div className="absolute -bottom-6 -left-6 hidden max-w-[220px] rounded-2xl border border-border bg-card p-4 shadow-card sm:block">
              <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <div className="mt-1 text-sm font-semibold">4.9 average rating</div>
              <div className="text-xs text-muted-foreground">Across 12k+ bookings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl">Popular categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">Browse services by what you need done.</p>
          </div>
          <Link to="/browse" className="hidden text-sm font-medium text-primary hover:underline sm:inline">See all</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => {
            const Icon = (Icons as any)[c.icon ?? "Sparkles"] ?? Icons.Sparkles;
            return (
              <Link key={c.id} to="/browse" search={{ category: c.slug } as never} className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:-translate-y-0.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/50 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl">Recently added</h2>
            <p className="mt-1 text-sm text-muted-foreground">Fresh services from providers near you.</p>
          </div>
          <Link to="/browse" className="text-sm font-medium text-primary hover:underline">Explore all</Link>
        </div>
        {featured.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">No services yet. Be the first to list one.</p>
            <Link to="/auth" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Become a provider</Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl">How ServiceHub works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { icon: Search, title: "1. Discover", body: "Search by category, city or keyword. Filter by price and ratings." },
            { icon: Calendar, title: "2. Book", body: "Pick a time from the provider's calendar and send a request." },
            { icon: ShieldCheck, title: "3. Relax", body: "Chat, get service, rate your pro. Everything in one place." },
          ].map((step) => (
            <div key={step.title} className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><step.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 p-10 text-primary-foreground shadow-card md:p-14">
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
            <div>
              <h2 className="text-4xl text-primary-foreground">Are you a pro? Get more bookings.</h2>
              <p className="mt-3 max-w-lg text-primary-foreground/80">List your services, set your schedule, and reach thousands of customers looking for someone just like you.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-soft">
                Become a provider <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
