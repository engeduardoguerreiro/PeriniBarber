import { bookingSchema } from "@/lib/validations/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function cleanPhone(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: Request) {
  const admin = getSupabaseAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Supabase nao configurado." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bookingSchema
    .extend({
      barbershopId: bookingSchema.shape.serviceId,
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const values = parsed.data;
  const startsAt = new Date(`${values.date}T${values.time}:00-03:00`);

  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Escolha uma data e horario futuros." }, { status: 400 });
  }

  const [{ data: barbershop }, { data: service }, { data: barber }] = await Promise.all([
    admin
      .from("barbershops")
      .select("id,name,active")
      .eq("id", values.barbershopId)
      .eq("active", true)
      .maybeSingle(),
    admin
      .from("services")
      .select("id,name,duration_minutes,active")
      .eq("id", values.serviceId)
      .eq("barbershop_id", values.barbershopId)
      .eq("active", true)
      .maybeSingle(),
    admin
      .from("barbers")
      .select("id,name,active,allow_online_booking")
      .eq("id", values.barberId)
      .eq("barbershop_id", values.barbershopId)
      .eq("active", true)
      .eq("allow_online_booking", true)
      .maybeSingle(),
  ]);

  if (!barbershop || !service || !barber) {
    return NextResponse.json({ error: "Servico, barbeiro ou barbearia indisponivel." }, { status: 404 });
  }

  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60_000);
  const whatsapp = cleanPhone(values.customerWhatsapp);

  const { data: existingCustomer } = await admin
    .from("customers")
    .select("id")
    .eq("barbershop_id", values.barbershopId)
    .eq("whatsapp", whatsapp)
    .maybeSingle();

  const customer =
    existingCustomer ??
    (
      await admin
        .from("customers")
        .insert({
          barbershop_id: values.barbershopId,
          name: values.customerName,
          whatsapp,
          active: true,
        })
        .select("id")
        .single()
    ).data;

  if (!customer) {
    return NextResponse.json({ error: "Nao foi possivel criar o cliente." }, { status: 500 });
  }

  const { data: appointment, error: appointmentError } = await admin
    .from("appointments")
    .insert({
      barbershop_id: values.barbershopId,
      customer_id: customer.id,
      barber_id: values.barberId,
      service_id: values.serviceId,
      appointment_date: values.date,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "agendado",
      notes: values.notes,
      origin: "publico",
    })
    .select("id,starts_at,ends_at")
    .single();

  if (appointmentError) {
    const isConflict = appointmentError.message.toLowerCase().includes("conflict");
    return NextResponse.json(
      { error: isConflict ? "Horario indisponivel para este barbeiro." : appointmentError.message },
      { status: isConflict ? 409 : 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    appointment,
    barbershopName: barbershop.name,
    serviceName: service.name,
    barberName: barber.name,
  });
}
