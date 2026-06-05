import { ensureOwnerWorkspace } from "@/lib/onboarding";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { signUpSchema } from "@/lib/validations/schemas";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

async function findUserByEmail(email: string) {
  const admin = getSupabaseAdmin();

  if (!admin) {
    return null;
  }

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
  const admin = getSupabaseAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Supabase nao configurado." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const values = parsed.data;
  const email = values.email.trim().toLowerCase();
  const userMetadata = {
    name: values.name,
    barbershop_name: values.barbershopName,
    whatsapp: values.whatsapp,
  };

  try {
    const existingUser = await findUserByEmail(email);
    let user: User | null = null;

    if (existingUser?.email_confirmed_at) {
      return NextResponse.json(
        { error: "Este e-mail ja esta cadastrado. Entre com sua senha ou use recuperar senha." },
        { status: 409 },
      );
    }

    if (existingUser) {
      const { data, error } = await admin.auth.admin.updateUserById(existingUser.id, {
        password: values.password,
        email_confirm: true,
        user_metadata: {
          ...(existingUser.user_metadata ?? {}),
          ...userMetadata,
        },
      });

      if (error) {
        throw error;
      }

      user = data.user;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: values.password,
        email_confirm: true,
        user_metadata: userMetadata,
      });

      if (error) {
        throw error;
      }

      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: "Nao foi possivel criar o usuario." }, { status: 500 });
    }

    const workspace = await ensureOwnerWorkspace({ admin, user });

    return NextResponse.json({
      ok: true,
      email,
      barbershopId: workspace.barbershopId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel criar a conta." },
      { status: 500 },
    );
  }
}
