import { AppShell } from "@/components/app/app-shell";
import { ModulePage } from "@/components/app/module-page";
import { getModuleRows } from "@/lib/supabase/queries";

export default async function BarbeirosPage() {
  const rows = await getModuleRows("barbeiros");
  return <AppShell><ModulePage moduleKey="barbeiros" rows={rows} /></AppShell>;
}
