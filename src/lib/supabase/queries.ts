import type { PublicBookingData } from "@/lib/types";
import { createClient } from "./server";

export async function getPublicBookingData(slug: string): Promise<PublicBookingData> {
  const supabase = await createClient();

  if (!supabase) {
    return { barbershop: null, barbers: [], services: [] };
  }

  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("id,name,slug,logo_url,phone,whatsapp,email,active")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (!barbershop) {
    return { barbershop: null, barbers: [], services: [] };
  }

  const [{ data: barbers }, { data: services }] = await Promise.all([
    supabase
      .from("barbers")
      .select("id,name,specialty,photo_url,allow_online_booking")
      .eq("barbershop_id", barbershop.id)
      .eq("active", true)
      .eq("allow_online_booking", true)
      .order("name"),
    supabase
      .from("services")
      .select("id,name,description,price,duration_minutes")
      .eq("barbershop_id", barbershop.id)
      .eq("active", true)
      .order("name"),
  ]);

  return {
    barbershop,
    barbers: barbers ?? [],
    services: services ?? [],
  };
}

export async function getSessionContext() {
  const supabase = await createClient();

  if (!supabase) {
    return { user: null, membership: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, membership: null };
  }

  const { data: membership } = await supabase
    .from("barbershop_users")
    .select("role,barbershop_id,barbershops(name,slug)")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  return { user, membership };
}
