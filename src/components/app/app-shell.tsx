import { Brand } from "@/components/app/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { privateRoutes } from "@/lib/app-data";
import { Menu, Plus } from "lucide-react";
import Link from "next/link";

function Navigation() {
  return (
    <nav className="grid gap-1">
      {privateRoutes.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-sidebar-border bg-sidebar px-4 py-5 lg:block">
        <Brand />
        <div className="mt-8">
          <Navigation />
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/92 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" className="lg:hidden" />}>
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-sidebar-border bg-sidebar p-5">
                <Brand />
                <div className="mt-8">
                  <Navigation />
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium text-muted-foreground">Gestao da barbearia</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/agendar/perini-barber" className={buttonVariants({ variant: "outline", className: "hidden sm:inline-flex" })}>Link publico</Link>
            <Button>
              <Plus className="h-4 w-4" />
              Criar
            </Button>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
