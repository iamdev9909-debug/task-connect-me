import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, BadgeCheck, Star, Calendar, Heart, ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchService, fetchReviewsForProvider } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/services/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Service — ServiceHub` },
      { name: "description", content: "View provider details, availability, reviews and book this service." },
      { property: "og:title", content: `Service — ServiceHub` },
      { property: "og:description", content: "Book a vetted local pro on ServiceHub." },
    ],
  }),
  component: ServicePage,
});

function ServicePage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: service, isLoading } = useQuery({ queryKey: ["service", id], queryFn: () => fetchService(id) });
  const providerId = service?.provider_id;
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", providerId], enabled: !!providerId,
    queryFn: () => fetchReviewsForProvider(providerId!),
  });

  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");

  const book = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first");
      const { error } = await supabase.from("bookings").insert({
        service_id: id, customer_id: user.id, provider_id: service.provider_id,
        scheduled_at: new Date(when).toISOString(), duration_min: duration, notes, status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Booking request sent!"); navigate({ to: "/dashboard" }); },
    onError: (e: any) => toast.error(e.message ?? "Could not book"),
  });

  const toggleFav = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in");
      const { error } = await supabase.from("favorites").upsert({ customer_id: user.id, service_id: id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved to favorites"); qc.invalidateQueries({ queryKey: ["favorites"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="min-h-screen"><Header /><div className="mx-auto max-w-6xl p-10">Loading…</div></div>;
  if (!service) return <div className="min-h-screen"><Header /><div className="mx-auto max-w-6xl p-10">Service not found.</div></div>;

  const provider = service.profiles;
  const price = service.price == null ? "Contact" : service.price_type === "hourly" ? `$${service.price}/hr` : service.price_type === "fixed" ? `$${service.price}` : "Negotiable";
  const avg = reviews.length ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link to="/browse" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to browse</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              {service.images?.[0] ? (
                <img src={service.images[0]} className="aspect-[16/10] w-full object-cover" alt={service.title} />
              ) : (
                <div className="grid aspect-[16/10] w-full place-items-center bg-gradient-to-br from-secondary/60 to-primary/20 font-display text-5xl text-primary/70">{service.title?.[0]}</div>
              )}
            </div>
            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{service.categories?.name}</div>
                <h1 className="mt-1 text-4xl">{service.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {service.city && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {service.city} · {service.radius_km}km</span>}
                  {avg && <span className="inline-flex items-center gap-1 text-primary"><Star className="h-4 w-4 fill-current" /> {avg} ({reviews.length})</span>}
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">{price}</span>
            </div>
            <p className="mt-6 whitespace-pre-wrap text-foreground/90">{service.description || "No description provided."}</p>

            {/* Provider */}
            <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-4">
                {provider?.avatar_url ? (
                  <img src={provider.avatar_url} className="h-14 w-14 rounded-full object-cover" alt="" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-lg font-semibold text-secondary-foreground">{provider?.full_name?.[0] ?? "?"}</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate font-display text-lg font-semibold">{provider?.business_name || provider?.full_name}</div>
                    {provider?.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                  </div>
                  {provider?.bio && <p className="mt-1 text-sm text-muted-foreground">{provider.bio}</p>}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-8">
              <h2 className="text-2xl">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">{r.profiles?.full_name ?? "Customer"}</div>
                        <div className="flex items-center gap-0.5 text-primary">
                          {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                        </div>
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-2xl">Request booking</h2>
              <p className="mt-1 text-sm text-muted-foreground">The provider will confirm your slot.</p>
              <label className="mt-4 block text-xs font-semibold text-muted-foreground">Date & time</label>
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <label className="mt-4 block text-xs font-semibold text-muted-foreground">Duration (minutes)</label>
              <input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <label className="mt-4 block text-xs font-semibold text-muted-foreground">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything the pro should know?" className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <button
                onClick={() => user ? book.mutate() : navigate({ to: "/auth" })}
                disabled={!when || book.isPending}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
              >
                <Calendar className="h-4 w-4" /> {user ? "Send request" : "Sign in to book"}
              </button>
              <button
                onClick={() => user ? toggleFav.mutate() : navigate({ to: "/auth" })}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-muted"
              >
                <Heart className="h-4 w-4" /> Save to favorites
              </button>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
