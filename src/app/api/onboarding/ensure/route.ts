import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ensureOwnerWorkspace } from "@/lib/onboarding";
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

  try {
    const workspace = await ensureOwnerWorkspace({ admin, user });
    return NextResponse.json({ ok: true, barbershopId: workspace.barbershopId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel preparar a barbearia." },
      { status: 500 },
    );
  }
}
