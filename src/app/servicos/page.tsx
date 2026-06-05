import { AppShell } from "@/components/app/app-shell";
import { ModulePage } from "@/components/app/module-page";
import { getModuleRows } from "@/lib/supabase/queries";

export default async function ServicosPage() {
  const rows = await getModuleRows("servicos");
  return <AppShell><ModulePage moduleKey="servicos" rows={rows} /></AppShell>;
}
