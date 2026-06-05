import { AppShell } from "@/components/app/app-shell";
import { ModulePage } from "@/components/app/module-page";
import { getModuleRows } from "@/lib/supabase/queries";

export default async function AgendaPage() {
  const rows = await getModuleRows("agenda");
  return <AppShell><ModulePage moduleKey="agenda" rows={rows} /></AppShell>;
}
