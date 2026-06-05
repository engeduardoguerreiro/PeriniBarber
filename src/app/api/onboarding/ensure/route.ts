import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const admin = getSupabaseAdmin();

  if (!supabase || !admin) {
    return NextResponse.json({ error: "Supabase nao configurado." }, { status: 500 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Usuario nao autenticado." }, { status: 401 });
  }

  const metadata = user.user_metadata ?? {};
  const ownerName = typeof metadata.name === "string" ? metadata.name : user.email?.split("@")[0] ?? "Owner";
  const barbershopName =
    typeof metadata.barbershop_name === "string" ? metadata.barbershop_name : "Minha barbearia";
  const whatsapp = typeof metadata.whatsapp === "string" ? metadata.whatsapp : null;

  await admin.from("profiles").upsert({
    id: user.id,
    name: ownerName,
    email: user.email,
    phone: whatsapp,
  });

  const { data: existingMembership } = await admin
    .from("barbershop_users")
    .select("id,barbershop_id")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (existingMembership) {
    return NextResponse.json({ ok: true, barbershopId: existingMembership.barbershop_id });
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
    return NextResponse.json({ error: "Nao foi possivel criar a barbearia." }, { status: 500 });
  }

  await admin.from("barbershop_users").insert({
    barbershop_id: barbershop.id,
    user_id: user.id,
    role: "owner",
    active: true,
  });

  await admin.from("settings").insert({
    barbershop_id: barbershop.id,
    public_booking_enabled: true,
  });

  return NextResponse.json({ ok: true, barbershopId: barbershop.id });
}
