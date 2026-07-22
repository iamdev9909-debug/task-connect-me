import { Link } from "@tanstack/react-router";
import { MapPin, BadgeCheck } from "lucide-react";

export function ServiceCard({ service }: { service: any }) {
  const provider = service.profiles;
  const priceLabel =
    service.price == null
      ? "Contact"
      : service.price_type === "hourly"
        ? `$${service.price}/hr`
        : service.price_type === "fixed"
          ? `$${service.price}`
          : "Negotiable";
  return (
    <Link
      to="/services/$id"
      params={{ id: service.id }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary/40">
        {service.images?.[0] ? (
          <img src={service.images[0]} alt={service.title} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-secondary/60 to-primary/20 font-display text-3xl text-primary/70">
            {service.title?.[0] ?? "S"}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-xs uppercase tracking-wide text-muted-foreground">{service.categories?.name}</div>
            <h3 className="mt-0.5 truncate font-display text-lg font-semibold">{service.title}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{priceLabel}</span>
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1 truncate">
            {provider?.avatar_url ? (
              <img src={provider.avatar_url} className="h-5 w-5 rounded-full object-cover" alt="" />
            ) : (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                {provider?.full_name?.[0] ?? "?"}
              </span>
            )}
            <span className="truncate">{provider?.business_name || provider?.full_name || "Provider"}</span>
            {provider?.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
          </span>
          {service.city && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5" /> {service.city}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
