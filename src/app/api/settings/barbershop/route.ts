import { requireBarbershopRole } from "@/lib/authz";
import { barbershopSchema } from "@/lib/validations/schemas";
import { NextResponse } from "next/server";

function cleanDigits(value?: string) {
  return value?.replace(/\D/g, "") ?? null;
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function PATCH(request: Request) {
  const auth = await requireBarbershopRole(["owner", "admin"]);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = barbershopSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const values = parsed.data;

  const { error: shopError } = await auth.admin
    .from("barbershops")
    .update({
      name: values.name,
      slug: values.slug,
      phone: cleanDigits(values.phone),
      whatsapp: cleanDigits(values.whatsapp),
      email: emptyToNull(values.email),
      address: emptyToNull(values.address),
      city: emptyToNull(values.city),
      state: emptyToNull(values.state)?.toUpperCase() ?? null,
    })
    .eq("id", auth.membership.barbershopId);

  if (shopError) {
    const duplicated = shopError.message.toLowerCase().includes("duplicate");
    return NextResponse.json(
      { error: duplicated ? "Este link publico ja esta em uso." : shopError.message },
      { status: duplicated ? 409 : 500 },
    );
  }

  const { data: currentSettings } = await auth.admin
    .from("settings")
    .select("theme")
    .eq("barbershop_id", auth.membership.barbershopId)
    .maybeSingle();
  const currentTheme = (currentSettings?.theme ?? {}) as Record<string, unknown>;

  const { error: settingsError } = await auth.admin.from("settings").upsert(
    {
      barbershop_id: auth.membership.barbershopId,
      public_booking_enabled: values.publicBookingEnabled,
      theme: {
        ...currentTheme,
        company: {
          ...(typeof currentTheme.company === "object" && currentTheme.company ? currentTheme.company : {}),
          legal_name: emptyToNull(values.legalName),
          cnpj: cleanDigits(values.cnpj),
          zip_code: cleanDigits(values.zipCode),
          address_number: emptyToNull(values.addressNumber),
          address_complement: emptyToNull(values.addressComplement),
          neighborhood: emptyToNull(values.neighborhood),
        },
      },
    },
    { onConflict: "barbershop_id" },
  );

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
