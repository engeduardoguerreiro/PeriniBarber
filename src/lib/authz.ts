import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function requireBarbershopRole(allowedRoles: UserRole[]) {
  const supabase = await createClient();
  const admin = getSupabaseAdmin();

  if (!supabase || !admin) {
    return { error: "Supabase nao configurado.", status: 500 as const };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Usuario nao autenticado.", status: 401 as const };
  }

  const { data: membership } = await admin
    .from("barbershop_users")
    .select("id,barbershop_id,role,active")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!membership || !allowedRoles.includes(membership.role as UserRole)) {
    return { error: "Voce nao tem permissao para esta acao.", status: 403 as const };
  }

  return {
    user,
    admin,
    membership: {
      id: membership.id as string,
      barbershopId: membership.barbershop_id as string,
      role: membership.role as UserRole,
    },
  };
}
