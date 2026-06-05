import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dashboardCards } from "@/lib/app-data";
import { getSessionContext } from "@/lib/supabase/queries";

export default async function DashboardPage() {
  const { user, membership } = await getSessionContext();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Badge className="mb-3 bg-primary/15 text-primary hover:bg-primary/15">
            {membership ? "Supabase conectado" : "Aguardando configuracao Supabase"}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user ? `Sessao ativa para ${user.email}.` : "Configure o .env.local para ativar dados reais e protecao."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {dashboardCards.map((card) => (
            <Card key={card.label} className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="text-2xl">{card.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{card.hint}</CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Proximos horarios</CardTitle>
              <CardDescription>Consulta preparada para appointments filtrados por barbershop_id.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Horario</TableHead><TableHead>Cliente</TableHead><TableHead>Barbeiro</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Sem horarios para exibir.</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Servicos mais vendidos</CardTitle>
              <CardDescription>Base para grafico simples de command_items.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <span>Corte masculino</span>
              <span>Barba</span>
              <span>Corte + barba</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
