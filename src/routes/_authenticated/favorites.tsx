import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({ meta: [{ title: "Favorites — ServiceHub" }, { name: "robots", content: "noindex" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["favorites", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("service_id, services(*, categories(name, slug), profiles!services_provider_id_fkey(full_name, avatar_url, verified, business_name))")
        .eq("customer_id", user!.id);
      return data ?? [];
    },
  });

  const remove = useMutation({
    mutationFn: async (serviceId: string) => {
      await supabase.from("favorites").delete().eq("customer_id", user!.id).eq("service_id", serviceId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl">Favorites</h1>
        <p className="mt-1 text-sm text-muted-foreground">Services you saved for later.</p>
        {data.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No favorites yet.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.filter((r: any) => r.services).map((r: any) => (
              <div key={r.service_id} className="relative">
                <ServiceCard service={r.services} />
                <button onClick={() => remove.mutate(r.service_id)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 shadow-soft transition hover:bg-background">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
