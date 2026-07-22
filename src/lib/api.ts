import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
};

export type Service = {
  id: string;
  provider_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number | null;
  price_type: "hourly" | "fixed" | "negotiable";
  city: string | null;
  radius_km: number;
  images: string[];
  active: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  business_name: string | null;
  is_provider: boolean;
  verified: boolean;
  phone: string | null;
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export type ServiceFilters = {
  q?: string;
  categorySlug?: string;
  city?: string;
  maxPrice?: number;
};

export async function fetchServices(filters: ServiceFilters = {}) {
  let query = supabase
    .from("services")
    .select("*, categories(name, slug), profiles!services_provider_id_fkey(full_name, avatar_url, verified, business_name, city)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(60);
  if (filters.q) query = query.ilike("title", `%${filters.q}%`);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  const { data, error } = await query;
  if (error) throw error;
  let rows = data ?? [];
  if (filters.categorySlug) {
    rows = rows.filter((r: any) => r.categories?.slug === filters.categorySlug);
  }
  return rows as any[];
}

export async function fetchService(id: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*, categories(name, slug), profiles!services_provider_id_fkey(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function fetchProfile(id: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function fetchReviewsForProvider(providerId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles!reviews_customer_id_fkey(full_name, avatar_url)")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
