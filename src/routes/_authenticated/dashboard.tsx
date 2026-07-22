import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Calendar, Plus, Star, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ServiceHub" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, services(title, images), customer:profiles!bookings_customer_id_fkey(full_name, avatar_url), provider:profiles!bookings_provider_id_fkey(full_name, avatar_url)")
        .or(`customer_id.eq.${user!.id},provider_id.eq.${user!.id}`)
        .order("scheduled_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: myServices = [] } = useQuery({
    queryKey: ["my-services", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("services").select("*, categories(name)").eq("provider_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const becomeProvider = useMutation({
    mutationFn: async () => {
      await supabase.from("profiles").update({ is_provider: true }).eq("id", user!.id);
      await supabase.from("user_roles").upsert({ user_id: user!.id, role: "provider" }, { onConflict: "user_id,role" });
    },
    onSuccess: () => { toast.success("You're now a provider!"); qc.invalidateQueries({ queryKey: ["profile"] }); },
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); toast.success("Booking updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const asProvider = bookings.filter((b: any) => b.provider_id === user?.id);
  const asCustomer = bookings.filter((b: any) => b.customer_id === user?.id);
  const earnings = asProvider.filter((b: any) => b.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-4xl">Hi, {profile?.full_name ?? "there"} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">{profile?.is_provider ? "Manage your services and bookings." : "Track your bookings and favorites."}</p>
          </div>
          {profile?.is_provider ? (
            <Link to="/services/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft">
              <Plus className="h-4 w-4" /> New service
            </Link>
          ) : (
            <button onClick={() => becomeProvider.mutate()} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background">
              Become a provider
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Calendar, label: "Bookings as customer", value: asCustomer.length },
            { icon: Star, label: "Bookings as provider", value: asProvider.length },
            { icon: DollarSign, label: "Completed jobs", value: earnings },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary"><s.icon className="h-4 w-4" /></span>
              <div className="mt-3 text-3xl font-semibold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <section className="mt-10">
          <h2 className="text-2xl">Bookings</h2>
          {bookings.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No bookings yet. <Link to="/browse" className="text-primary underline">Browse services</Link>.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {bookings.map((b: any) => {
                const isProviderView = b.provider_id === user?.id;
                const other = isProviderView ? b.customer : b.provider;
                return (
                  <div key={b.id} className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary/50 text-lg font-semibold">
                      {b.services?.images?.[0] ? <img src={b.services.images[0]} className="h-full w-full rounded-2xl object-cover" alt="" /> : (b.services?.title?.[0] ?? "?")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{b.services?.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(b.scheduled_at).toLocaleString()} · {b.duration_min}min · with {other?.full_name ?? "user"}
                      </div>
                    </div>
                    <StatusPill status={b.status} />
                    {isProviderView && b.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => updateBooking.mutate({ id: b.id, status: "confirmed" })} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Accept</button>
                        <button onClick={() => updateBooking.mutate({ id: b.id, status: "rejected" })} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"><XCircle className="h-3.5 w-3.5" /> Decline</button>
                      </div>
                    )}
                    {isProviderView && b.status === "confirmed" && (
                      <button onClick={() => updateBooking.mutate({ id: b.id, status: "completed" })} className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">Mark completed</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* My services (provider only) */}
        {profile?.is_provider && (
          <section className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">My services</h2>
              <Link to="/services/new" className="text-sm font-medium text-primary hover:underline">+ Add service</Link>
            </div>
            {myServices.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                No services yet. Create your first listing.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {myServices.map((s: any) => (
                  <Link key={s.id} to="/services/$id" params={{ id: s.id }} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-card">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/50 font-semibold">
                      {s.images?.[0] ? <img src={s.images[0]} className="h-full w-full rounded-2xl object-cover" alt="" /> : s.title[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{s.title}</div>
                      <div className="text-xs text-muted-foreground">{s.categories?.name} · {s.city ?? "Anywhere"}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; label: string; Icon: any }> = {
    pending: { bg: "bg-secondary/70 text-secondary-foreground", label: "Pending", Icon: Clock },
    confirmed: { bg: "bg-primary/10 text-primary", label: "Confirmed", Icon: CheckCircle2 },
    rejected: { bg: "bg-muted text-muted-foreground", label: "Rejected", Icon: XCircle },
    completed: { bg: "bg-foreground text-background", label: "Completed", Icon: CheckCircle2 },
    cancelled: { bg: "bg-muted text-muted-foreground", label: "Cancelled", Icon: XCircle },
  };
  const s = map[status] ?? map.pending;
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg}`}><s.Icon className="h-3 w-3" /> {s.label}</span>;
}
