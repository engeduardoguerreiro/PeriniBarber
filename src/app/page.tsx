import { Brand } from "@/components/app/brand";
import { BarbershopMarquee } from "@/components/landing/barbershop-marquee";
import { PremiumMouseEffects } from "@/components/landing/premium-mouse-effects";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { landingFeatures, plans } from "@/lib/app-data";
import {
  BadgeDollarSign,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  Crown,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const stats = [
  { label: "Assinatura", value: "R$ 29,90" },
  { label: "Implantação", value: "Online" },
  { label: "Acesso", value: "24h" },
];

const modules = [
  { title: "Agenda online", text: "Horários organizados, status do atendimento e link público.", icon: CalendarCheck },
  { title: "Clientes e barbeiros", text: "Cadastros rápidos com WhatsApp, preferências e histórico.", icon: UsersRound },
  { title: "Comandas e caixa", text: "Serviços, pagamentos, descontos, financeiro e comissões.", icon: CreditCard },
  { title: "WhatsApp pronto", text: "Mensagens para confirmação, lembrete, aniversário e promoções.", icon: MessageCircle },
];

export default function Home() {
  const singlePlan = plans[0];

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <PremiumMouseEffects />
      <section className="relative min-h-[86vh] border-b border-border">
        <Image
          src="/perini-barber-logo-transparent.png"
          alt="Perini Barber"
          fill
          priority
          className="object-cover opacity-16"
        />
        <div className="absolute inset-0 premium-grid" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0f0f0f_0%,rgb(15_15_15/.94)_34%,rgb(15_15_15/.72)_64%,rgb(15_15_15/.88)_100%)]" />
        <div className="absolute left-0 right-0 top-0 h-1 barber-stripe opacity-90" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Brand />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#modulos" className="hover:text-primary">Módulos</a>
            <a href="#preco" className="hover:text-primary">Preço</a>
            <a href="#faq" className="hover:text-primary">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>Entrar</Link>
            <Link href="/cadastro" className={buttonVariants({ className: "soft-gold-shadow" })}>
              Testar agora
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-10 md:grid-cols-[0.98fr_0.9fr] md:px-8 md:pb-16 md:pt-14">
          <div className="flex flex-col justify-center">
            <Badge className="mb-4 w-fit border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-primary hover:bg-primary/10">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Site premium para vender gestão de barbearias
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-tight text-white md:text-6xl">
              Transforme sua barbearia em um negócio de alto nível
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Automatize agendamentos, organize sua equipe, acompanhe o financeiro e fidelize
              clientes com uma plataforma simples, moderna e feita para barbearias.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/cadastro" className={buttonVariants({ size: "lg", className: "gold-sheen soft-gold-shadow" })}>
                Assinar por R$ 29,90
              </Link>
              <Link href="/agendar/perini-barber" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Ver agendamento online
              </Link>
            </div>
            <div className="mt-7 grid max-w-lg grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="premium-card rounded-md p-3.5">
                  <strong className="block text-base text-white">{stat.value}</strong>
                  <span className="mt-1 block text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center float-premium">
            <DashboardPreview />
          </div>
        </div>

        <BarbershopMarquee />
      </section>

      <section className="border-b border-border bg-[#111]/95">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-3 md:px-8">
          {[
            ["Agenda sem conflito", CalendarCheck],
            ["Dados isolados por barbearia", ShieldCheck],
            ["Visual de sistema premium", Crown],
          ].map(([label, Icon]) => (
            <div key={label as string} className="premium-card flex items-center gap-3 rounded-md p-4">
              <span className="rounded-md bg-primary/15 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <strong>{label as string}</strong>
            </div>
          ))}
        </div>
      </section>

      <section id="modulos" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-4 bg-primary/15 text-primary hover:bg-primary/15">Tudo no mesmo painel</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Gestão completa sem complicar.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">
            O cliente vê uma solução simples. A barbearia ganha controle de agenda,
            operação e dinheiro com uma aparência profissional.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {modules.map((module) => (
            <Card key={module.title} className="premium-card rounded-md transition duration-300 hover:-translate-y-1 hover:border-primary/45">
              <CardHeader>
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <module.icon className="h-5 w-5" />
                </span>
                <CardTitle className="text-lg">{module.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{module.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[0.85fr_1.15fr] md:px-8">
          <div>
            <Badge className="mb-4 bg-primary/15 text-primary hover:bg-primary/15">Efeito premium</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Parece caro. Custa menos que um corte.</h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              A landing destaca preço, valor e confiança com animações sutis, bordas luminosas,
              contraste forte e chamadas diretas para conversão.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {landingFeatures.map((feature) => (
              <div key={feature} className="premium-card flex items-start gap-3 rounded-md p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preco" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="premium-card gold-sheen grid gap-8 rounded-md p-6 md:grid-cols-[1fr_0.8fr] md:p-10">
          <div>
            <Badge className="mb-5 bg-primary/15 text-primary hover:bg-primary/15">Oferta única</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">{singlePlan.name}</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
              Um plano direto para barbearias que querem agenda online e gestão sem pagar caro.
              Ideal para começar simples e evoluir com o sistema.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {singlePlan.features.map((feature) => (
                <span key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="relative z-10 rounded-md border border-primary/25 bg-black/35 p-6">
            <span className="text-sm text-muted-foreground">Assinatura mensal</span>
            <strong className="mt-3 block text-6xl font-semibold tracking-tight text-primary">{singlePlan.price}</strong>
            <span className="mt-2 block text-sm text-muted-foreground">por mês, sem plano confuso</span>
            <Link href="/cadastro" className={buttonVariants({ size: "lg", className: "mt-8 w-full soft-gold-shadow" })}>
              Quero assinar agora
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="premium-card rounded-md">
            <CardHeader><CardTitle>Funciona no celular?</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              Sim. O layout é responsivo e pensado para uso rápido na rotina da barbearia.
            </CardContent>
          </Card>
          <Card className="premium-card rounded-md">
            <CardHeader><CardTitle>Tem agenda pública?</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              Sim. Cada barbearia pode divulgar um link de agendamento para clientes.
            </CardContent>
          </Card>
          <Card className="premium-card rounded-md">
            <CardHeader><CardTitle>Posso controlar caixa?</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              Sim. A base inclui comandas, formas de pagamento, financeiro e comissões.
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function DashboardPreview() {
  return (
    <div className="premium-card relative mx-auto w-full max-w-[620px] rounded-md p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground">Painel Perini Barber</span>
          <h3 className="mt-1 text-lg font-semibold">Hoje na barbearia</h3>
        </div>
        <span className="rounded-md bg-primary/15 px-3 py-1 text-xs text-primary">Ao vivo</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["R$ 840", "Faturamento"],
          ["18", "Agendamentos"],
          ["R$ 226", "Comissões"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-md border border-border bg-white/[0.045] p-3">
            <strong className="block text-xl">{value}</strong>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2 rounded-md border border-border bg-black/25 p-3">
        {[
          ["09:00", "Corte masculino", "Confirmado"],
          ["10:30", "Corte + barba", "Em atendimento"],
          ["14:00", "Barba completa", "Agendado"],
        ].map(([time, service, status]) => (
          <div key={`${time}-${service}`} className="flex items-center gap-3 rounded-md bg-white/[0.035] p-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Clock3 className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm">{service}</strong>
              <span className="text-xs text-muted-foreground">{time}</span>
            </div>
            <span className="rounded-md border border-primary/20 px-2 py-1 text-xs text-primary">{status}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="barber-stripe h-full w-3/4" />
      </div>
      <BadgeDollarSign className="absolute -right-3 -top-3 h-12 w-12 rounded-md border border-primary/20 bg-black/60 p-3 text-primary shadow-2xl" />
    </div>
  );
}
