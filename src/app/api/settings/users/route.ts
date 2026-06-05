import { requireBarbershopRole } from "@/lib/authz";
import { teamUserSchema } from "@/lib/validations/schemas";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function cleanDigits(value?: string) {
  return value?.replace(/\D/g, "") ?? null;
}

async function findUserByEmail(admin: SupabaseClient, email: string) {
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });

    if (error) {
      throw error;
    }

    const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      return user;
    }

    if (data.users.length < 1000) {
      return null;
    }

    page += 1;
  }
}

export async function POST(request: Request) {
  const auth = await requireBarbershopRole(["owner", "admin"]);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = teamUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const values = parsed.data;
  const email = values.email.trim().toLowerCase();
  const phone = cleanDigits(values.whatsapp);

  try {
    const existingUser = await findUserByEmail(auth.admin, email);
    let user: User | null = null;

    if (existingUser) {
      const { data, error } = await auth.admin.auth.admin.updateUserById(existingUser.id, {
        password: values.password,
        email_confirm: true,
        user_metadata: {
          ...(existingUser.user_metadata ?? {}),
          name: values.name,
          whatsapp: values.whatsapp,
        },
      });

      if (error) {
        throw error;
      }

      user = data.user;
    } else {
      const { data, error } = await auth.admin.auth.admin.createUser({
        email,
        password: values.password,
        email_confirm: true,
        user_metadata: {
          name: values.name,
          whatsapp: values.whatsapp,
        },
      });

      if (error) {
        throw error;
      }

      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: "Nao foi possivel criar o usuario." }, { status: 500 });
    }

    const { error: profileError } = await auth.admin.from("profiles").upsert({
      id: user.id,
      name: values.name,
      email,
      phone,
    });

    if (profileError) {
      throw profileError;
    }

    const { error: membershipError } = await auth.admin.from("barbershop_users").upsert(
      {
        barbershop_id: auth.membership.barbershopId,
        user_id: user.id,
        role: values.role,
        active: true,
      },
      { onConflict: "barbershop_id,user_id" },
    );

    if (membershipError) {
      throw membershipError;
    }

    if (values.role === "barber") {
      const { data: existingBarber } = await auth.admin
        .from("barbers")
        .select("id")
        .eq("barbershop_id", auth.membership.barbershopId)
        .eq("user_id", user.id)
        .maybeSingle();

      const payload = {
        barbershop_id: auth.membership.barbershopId,
        user_id: user.id,
        name: values.name,
        email,
        whatsapp: phone,
        specialty: values.specialty || null,
        default_commission_percent: values.commissionPercent,
        allow_online_booking: values.allowOnlineBooking,
        active: true,
      };

      const { error: barberError } = existingBarber
        ? await auth.admin.from("barbers").update(payload).eq("id", existingBarber.id)
        : await auth.admin.from("barbers").insert(payload);

      if (barberError) {
        throw barberError;
      }
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel criar o usuario." },
      { status: 500 },
    );
  }
}
