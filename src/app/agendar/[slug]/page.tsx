import { Brand } from "@/components/app/brand";
import { PublicBookingForm } from "@/components/booking/public-booking-form";
import { Toaster } from "@/components/ui/sonner";
import { getPublicBookingData } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { barbershop, barbers, services } = await getPublicBookingData(slug);

  if (!barbershop && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    notFound();
  }

  const fallbackShop = {
    id: "preview",
    name: "Perini Barber",
    slug,
    logo_url: null,
    phone: "11999999999",
    whatsapp: "11999999999",
    email: "contato@perinibarber.com.br",
    active: true,
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <Brand />
          <span className="text-sm text-muted-foreground">Agendamento online</span>
        </header>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-md border border-border bg-card p-6">
            <p className="text-sm text-primary">Link publico</p>
            <h1 className="mt-3 text-3xl font-semibold">{barbershop?.name ?? fallbackShop.name}</h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Escolha servico, barbeiro, data e horario. A versao conectada grava o agendamento
              no Supabase sem conflito para o mesmo barbeiro.
            </p>
          </section>
          <PublicBookingForm
            barbershop={barbershop ?? fallbackShop}
            barbers={barbers.length ? barbers : [{ id: "preview-barber", name: "Equipe Perini", specialty: "Corte e barba", photo_url: null, allow_online_booking: true }]}
            services={services.length ? services : [{ id: "preview-service", name: "Corte masculino", description: "Corte completo", price: 79, duration_minutes: 45 }]}
          />
        </div>
      </div>
      <Toaster richColors />
    </main>
  );
}
