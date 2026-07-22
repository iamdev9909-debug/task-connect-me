import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchCategories } from "@/lib/api";
import { Header } from "@/components/site/Header";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/services/new")({
  head: () => ({ meta: [{ title: "New service — ServiceHub" }, { name: "robots", content: "noindex" }] }),
  component: NewServicePage,
});

function NewServicePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const [form, setForm] = useState({
    title: "", description: "", category_id: "", price: "", price_type: "hourly" as "hourly" | "fixed" | "negotiable",
    city: "", radius_km: 25, image_url: "",
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      // ensure provider role
      await supabase.from("profiles").update({ is_provider: true }).eq("id", user.id);
      await supabase.from("user_roles").upsert({ user_id: user.id, role: "provider" }, { onConflict: "user_id,role" });
      const { data, error } = await supabase.from("services").insert({
        provider_id: user.id,
        category_id: form.category_id,
        title: form.title,
        description: form.description,
        price: form.price ? Number(form.price) : null,
        price_type: form.price_type,
        city: form.city || null,
        radius_km: form.radius_km,
        images: form.image_url ? [form.image_url] : [],
      }).select().single();
      if (error) throw error;
      toast.success("Service published!");
      navigate({ to: "/services/$id", params: { id: data.id } });
    } catch (e: any) {
      toast.error(e.message ?? "Could not save");
    } finally { setSaving(false); }
  }

  const input = "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl">Publish a service</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tell customers what you offer and where.</p>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Professional home cleaning" className={input} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Category</label>
            <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={input}>
              <option value="">Choose a category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Description</label>
            <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's included, experience, why customers should book you…" className={input} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Price</label>
              <input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={input} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Pricing type</label>
              <select value={form.price_type} onChange={(e) => setForm({ ...form, price_type: e.target.value as any })} className={input}>
                <option value="hourly">Hourly</option>
                <option value="fixed">Fixed</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">City</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={input} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Service radius (km)</label>
              <input type="number" min={1} value={form.radius_km} onChange={(e) => setForm({ ...form, radius_km: Number(e.target.value) })} className={input} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Cover image URL (optional)</label>
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" className={input} />
          </div>
          <button disabled={saving} className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50">
            {saving ? "Publishing…" : "Publish service"}
          </button>
        </form>
      </div>
    </div>
  );
}
