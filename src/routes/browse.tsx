import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ServiceCard } from "@/components/site/ServiceCard";
import { fetchCategories, fetchServices } from "@/lib/api";
import { Search } from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  maxPrice: z.coerce.number().optional().catch(undefined),
});

export const Route = createFileRoute("/browse")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Browse services — ServiceHub" },
      { name: "description", content: "Search vetted local professionals by category, city, and price." },
      { property: "og:title", content: "Browse services — ServiceHub" },
      { property: "og:description", content: "Filter by category, city and price to find the right pro." },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", search],
    queryFn: () => fetchServices({ q: search.q, city: search.city, categorySlug: search.category, maxPrice: search.maxPrice }),
  });

  function set(next: Partial<typeof search>) {
    navigate({ search: (prev: any) => ({ ...prev, ...next }) });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl">Find your pro</h1>
        <p className="mt-2 text-muted-foreground">Filter by category, location, and price to find the right service.</p>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-border bg-card p-3 shadow-card sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              defaultValue={search.q ?? ""}
              placeholder="Search services…"
              onKeyDown={(e) => { if (e.key === "Enter") set({ q: (e.target as HTMLInputElement).value }); }}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <input
            defaultValue={search.city ?? ""}
            placeholder="City"
            onKeyDown={(e) => { if (e.key === "Enter") set({ city: (e.target as HTMLInputElement).value }); }}
            className="w-full rounded-2xl border border-transparent bg-muted/60 px-3 py-2 text-sm outline-none sm:w-40"
          />
          <input
            defaultValue={search.maxPrice ?? ""}
            type="number" min={0}
            placeholder="Max price"
            onKeyDown={(e) => { if (e.key === "Enter") set({ maxPrice: Number((e.target as HTMLInputElement).value) || undefined }); }}
            className="w-full rounded-2xl border border-transparent bg-muted/60 px-3 py-2 text-sm outline-none sm:w-32"
          />
        </div>

        {/* Category chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => set({ category: undefined })} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${!search.category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>All</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => set({ category: c.slug })} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${search.category === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-muted" />)}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No services match your filters.</p>
              <Link to="/browse" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Reset filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
