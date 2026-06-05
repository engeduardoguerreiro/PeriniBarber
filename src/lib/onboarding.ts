import type { SupabaseClient, User } from "@supabase/supabase-js";
import { slugify } from "./slug";

type EnsureOwnerWorkspaceInput = {
  admin: SupabaseClient;
  user: User;
};

export async function ensureOwnerWorkspace({ admin, user }: EnsureOwnerWorkspaceInput) {
  const metadata = user.user_metadata ?? {};
  const ownerName = typeof metadata.name === "string" ? metadata.name : user.email?.split("@")[0] ?? "Owner";
  const barbershopName =
    typeof metadata.barbershop_name === "string" ? metadata.barbershop_name : "Minha barbearia";
  const whatsapp = typeof metadata.whatsapp === "string" ? metadata.whatsapp : null;

  const { error: profileError } = await admin.from("profiles").upsert({
    id: user.id,
    name: ownerName,
    email: user.email,
    phone: whatsapp,
  });

  if (profileError) {
    throw new Error("Nao foi possivel criar o perfil.");
  }

  const { data: existingMembership } = await admin
    .from("barbershop_users")
    .select("id,barbershop_id")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (existingMembership) {
    return { barbershopId: existingMembership.barbershop_id as string };
  }

  const baseSlug = slugify(barbershopName) || `barbearia-${user.id.slice(0, 8)}`;
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data } = await admin.from("barbershops").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const { data: barbershop, error: shopError } = await admin
    .from("barbershops")
    .insert({
      name: barbershopName,
      slug,
      whatsapp,
      active: true,
      opening_hours: {
        monday: ["09:00", "19:00"],
        tuesday: ["09:00", "19:00"],
        wednesday: ["09:00", "19:00"],
        thursday: ["09:00", "19:00"],
        friday: ["09:00", "19:00"],
        saturday: ["09:00", "17:00"],
      },
    })
    .select("id")
    .single();

  if (shopError || !barbershop) {
    throw new Error("Nao foi possivel criar a barbearia.");
  }

  const { error: membershipError } = await admin.from("barbershop_users").insert({
    barbershop_id: barbershop.id,
    user_id: user.id,
    role: "owner",
    active: true,
  });

  if (membershipError) {
    throw new Error("Nao foi possivel vincular o usuario a barbearia.");
  }

  await admin.from("settings").insert({
    barbershop_id: barbershop.id,
    public_booking_enabled: true,
  });

  return { barbershopId: barbershop.id as string };
}
