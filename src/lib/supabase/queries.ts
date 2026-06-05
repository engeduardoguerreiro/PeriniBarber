import type { PublicBookingData } from "@/lib/types";
import { getSupabaseAdmin } from "./admin";
import { createClient } from "./server";

type NamedRelation = { name?: string } | { name?: string }[] | null;

function relationName(relation: NamedRelation) {
  return Array.isArray(relation) ? relation[0]?.name ?? "-" : relation?.name ?? "-";
}

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

export async function getDashboardData() {
  const supabase = await createClient();
  const { user, membership } = await getSessionContext();

  if (!supabase || !user || !membership?.barbershop_id) {
    return null;
  }

  const barbershopId = membership.barbershop_id as string;
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayAppointments,
    monthCustomers,
    todayFinishedAppointments,
    pendingCommissions,
    todayCommands,
    monthCommands,
    nextAppointments,
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("barbershop_id", barbershopId)
      .gte("starts_at", startOfDay.toISOString())
      .lte("starts_at", endOfDay.toISOString()),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("barbershop_id", barbershopId)
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("barbershop_id", barbershopId)
      .eq("status", "finalizado")
      .gte("starts_at", startOfDay.toISOString())
      .lte("starts_at", endOfDay.toISOString()),
    supabase
      .from("commissions")
      .select("commission_amount,paid_amount")
      .eq("barbershop_id", barbershopId),
    supabase
      .from("commands")
      .select("total_amount")
      .eq("barbershop_id", barbershopId)
      .eq("status", "paga")
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString()),
    supabase
      .from("commands")
      .select("total_amount")
      .eq("barbershop_id", barbershopId)
      .eq("status", "paga")
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("appointments")
      .select("id,starts_at,status,customers(name),barbers(name),services(name)")
      .eq("barbershop_id", barbershopId)
      .gte("starts_at", now.toISOString())
      .order("starts_at", { ascending: true })
      .limit(6),
  ]);

  const sum = (rows?: { total_amount: number | string | null }[] | null) =>
    rows?.reduce((total, row) => total + Number(row.total_amount ?? 0), 0) ?? 0;
  const commissionsPending =
    pendingCommissions.data?.reduce(
      (total, row) => total + Number(row.commission_amount ?? 0) - Number(row.paid_amount ?? 0),
      0,
    ) ?? 0;

  return {
    cards: [
      { label: "Faturamento do dia", value: sum(todayCommands.data), hint: "Comandas pagas hoje", type: "money" },
      { label: "Faturamento do mes", value: sum(monthCommands.data), hint: "Comandas pagas no mes", type: "money" },
      { label: "Agendamentos hoje", value: todayAppointments.count ?? 0, hint: "Agenda interna e publica" },
      { label: "Clientes novos", value: monthCustomers.count ?? 0, hint: "No mes atual" },
      { label: "Servicos realizados", value: todayFinishedAppointments.count ?? 0, hint: "Hoje" },
      { label: "Comissoes pendentes", value: commissionsPending, hint: "A pagar", type: "money" },
    ],
    nextAppointments: nextAppointments.data ?? [],
  };
}

export async function getModuleRows(moduleKey: string) {
  const supabase = await createClient();
  const { user, membership } = await getSessionContext();

  if (!supabase || !user || !membership?.barbershop_id) {
    return [];
  }

  const barbershopId = membership.barbershop_id as string;
  const role = membership.role as string;

  if (moduleKey === "servicos") {
    const { data } = await supabase
      .from("services")
      .select("name,price,duration_minutes,default_commission_percent,active")
      .eq("barbershop_id", barbershopId)
      .order("name");
    return (data ?? []).map((row) => [
      row.name,
      `R$ ${Number(row.price ?? 0).toFixed(2)}`,
      `${row.duration_minutes} min`,
      `${row.default_commission_percent ?? 0}%`,
      row.active ? "ativo" : "inativo",
    ]);
  }

  if (moduleKey === "barbeiros") {
    const { data } = await supabase
      .from("barbers")
      .select("name,specialty,default_commission_percent,allow_online_booking,active")
      .eq("barbershop_id", barbershopId)
      .order("name");
    return (data ?? []).map((row) => [
      row.name,
      row.specialty ?? "-",
      `${row.default_commission_percent ?? 0}%`,
      row.allow_online_booking ? "sim" : "nao",
      row.active ? "ativo" : "inativo",
    ]);
  }

  if (moduleKey === "clientes") {
    const { data } = await supabase
      .from("customers")
      .select("name,whatsapp,preferred_barber_id,last_appointment_at,total_spent")
      .eq("barbershop_id", barbershopId)
      .order("name");
    return (data ?? []).map((row) => [
      row.name,
      row.whatsapp,
      row.preferred_barber_id ? "definido" : "-",
      row.last_appointment_at ? new Date(row.last_appointment_at).toLocaleDateString("pt-BR") : "-",
      `R$ ${Number(row.total_spent ?? 0).toFixed(2)}`,
    ]);
  }

  if (moduleKey === "agenda") {
    let barberId: string | null = null;

    if (role === "barber") {
      const { data: barber } = await supabase
        .from("barbers")
        .select("id")
        .eq("barbershop_id", barbershopId)
        .eq("user_id", user.id)
        .maybeSingle();
      barberId = barber?.id ?? null;
    }

    let query = supabase
      .from("appointments")
      .select("starts_at,status,customers(name),barbers(name),services(name)")
      .eq("barbershop_id", barbershopId)
      .order("starts_at", { ascending: true })
      .limit(30);

    if (role === "barber") {
      if (!barberId) {
        return [];
      }

      query = query.eq("barber_id", barberId);
    }

    const { data } = await query;
    return (data ?? []).map((row) => {
      const item = row as {
        customers?: NamedRelation;
        barbers?: NamedRelation;
        services?: NamedRelation;
        starts_at?: string;
        status?: string;
      };
      return [
        relationName(item.customers ?? null),
        relationName(item.barbers ?? null),
        relationName(item.services ?? null),
        item.starts_at ? new Date(item.starts_at).toLocaleString("pt-BR") : "-",
        item.status,
      ];
    });
  }

  return [];
}

export async function getSettingsData() {
  const { user, membership } = await getSessionContext();
  const admin = getSupabaseAdmin();

  if (!user || !membership?.barbershop_id || !admin) {
    return null;
  }

  const barbershopId = membership.barbershop_id as string;
  const role = membership.role as string;
  const canManage = role === "owner" || role === "admin";

  const [{ data: barbershop }, { data: settings }, { data: memberships }, { data: barbers }] = await Promise.all([
    admin
      .from("barbershops")
      .select("id,name,slug,phone,whatsapp,email,address,city,state,active")
      .eq("id", barbershopId)
      .single(),
    admin
      .from("settings")
      .select("id,public_booking_enabled,payment_methods,theme")
      .eq("barbershop_id", barbershopId)
      .maybeSingle(),
    admin
      .from("barbershop_users")
      .select("id,user_id,role,active,created_at")
      .eq("barbershop_id", barbershopId)
      .order("created_at", { ascending: true }),
    admin
      .from("barbers")
      .select("id,user_id,name,email,whatsapp,specialty,default_commission_percent,allow_online_booking,active")
      .eq("barbershop_id", barbershopId),
  ]);

  const userIds = (memberships ?? []).map((item) => item.user_id).filter(Boolean);
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id,name,email,phone").in("id", userIds)
    : { data: [] };

  const theme = (settings?.theme ?? {}) as {
    company?: {
      legal_name?: string | null;
      cnpj?: string | null;
      zip_code?: string | null;
      address_number?: string | null;
      address_complement?: string | null;
      neighborhood?: string | null;
    };
  };

  return {
    currentUserId: user.id,
    currentRole: role,
    canManage,
    barbershop: barbershop
      ? {
          ...barbershop,
          legal_name: theme.company?.legal_name ?? null,
          cnpj: theme.company?.cnpj ?? null,
          zip_code: theme.company?.zip_code ?? null,
          address_number: theme.company?.address_number ?? null,
          address_complement: theme.company?.address_complement ?? null,
          neighborhood: theme.company?.neighborhood ?? null,
        }
      : null,
    settings,
    users: (memberships ?? []).map((item) => {
      const profile = profiles?.find((profileItem) => profileItem.id === item.user_id);
      const barber = barbers?.find((barberItem) => barberItem.user_id === item.user_id);

      return {
        id: item.id,
        userId: item.user_id,
        role: item.role,
        active: item.active,
        name: profile?.name ?? barber?.name ?? "-",
        email: profile?.email ?? barber?.email ?? "-",
        phone: profile?.phone ?? barber?.whatsapp ?? "-",
        barberId: barber?.id ?? null,
        specialty: barber?.specialty ?? null,
        commissionPercent: barber?.default_commission_percent ?? null,
        allowOnlineBooking: barber?.allow_online_booking ?? null,
      };
    }),
  };
}
