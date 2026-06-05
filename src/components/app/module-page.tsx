import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { modules } from "@/lib/app-data";
import { Plus } from "lucide-react";

type ModuleKey = keyof typeof modules;

export function ModulePage({ moduleKey, rows = [] }: { moduleKey: ModuleKey; rows?: string[][] }) {
  const moduleConfig = modules[moduleKey];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="mb-3 bg-primary/15 text-primary hover:bg-primary/15">Modulo privado</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{moduleConfig.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{moduleConfig.description}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          {moduleConfig.primaryAction}
        </Button>
      </div>

      <Card className="border-border/80 bg-card/80">
        <CardHeader>
          <CardTitle>Operacao</CardTitle>
          <CardDescription>Pronto para conectar formularios e consultas Supabase com barbershop_id.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {moduleConfig.table.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row, index) => (
                  <TableRow key={`${moduleKey}-${index}`}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={`${moduleKey}-${index}-${cellIndex}`}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={moduleConfig.table.length} className="h-32 text-center text-muted-foreground">
                    {moduleConfig.empty}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
