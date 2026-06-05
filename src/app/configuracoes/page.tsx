import { AppShell } from "@/components/app/app-shell";
import { SettingsClient } from "@/components/settings/settings-client";
import { getSettingsData } from "@/lib/supabase/queries";

export default async function ConfiguracoesPage() {
  const data = await getSettingsData();

  return (
    <AppShell>
      {data ? (
        <SettingsClient data={data} />
      ) : (
        <div className="rounded-lg border border-border bg-card/80 p-6 text-sm text-muted-foreground">
          Nao foi possivel carregar as configuracoes da barbearia.
        </div>
      )}
    </AppShell>
  );
}
