import { AppShell } from "@/components/app/app-shell";
import { ModulePage } from "@/components/app/module-page";
import { getModuleRows } from "@/lib/supabase/queries";

export default async function ClientesPage() {
  const rows = await getModuleRows("clientes");
  return <AppShell><ModulePage moduleKey="clientes" rows={rows} /></AppShell>;
}
