"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { publicWhatsappLink } from "@/lib/format";
import type { Barber, Barbershop, Service } from "@/lib/types";
import { bookingSchema } from "@/lib/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type Values = z.infer<typeof bookingSchema>;

export function PublicBookingForm({
  barbershop,
  barbers,
  services,
}: {
  barbershop: Barbershop;
  barbers: Barber[];
  services: Service[];
}) {
  const [confirmed, setConfirmed] = useState<Values | null>(null);
  const [saving, setSaving] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { date: "", time: "", notes: "" },
  });
  const serviceId = useWatch({ control: form.control, name: "serviceId" });
  const barberId = useWatch({ control: form.control, name: "barberId" });
  const selectedService = services.find((service) => service.id === serviceId);
  const selectedBarber = barbers.find((barber) => barber.id === barberId);

  async function onSubmit(values: Values) {
    setSaving(true);
    try {
      const response = await fetch("/api/public-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, barbershopId: barbershop.id }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error ?? "Nao foi possivel confirmar o agendamento.");
      }
      setConfirmed(values);
      toast.success("Agendamento confirmado com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel confirmar o agendamento.");
    } finally {
      setSaving(false);
    }
  }

  if (confirmed) {
    const message = `Ola, quero confirmar meu horario na ${barbershop.name}: ${selectedService?.name ?? "servico"} com ${selectedBarber?.name ?? "barbeiro"} em ${confirmed.date} as ${confirmed.time}.`;
    return (
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle>Agendamento recebido</CardTitle>
          <CardDescription>Confira os dados e chame a barbearia pelo WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <Summary label="Barbearia" value={barbershop.name} />
          <Summary label="Servico" value={selectedService?.name ?? "-"} />
          <Summary label="Barbeiro" value={selectedBarber?.name ?? "-"} />
          <Summary label="Data" value={confirmed.date} />
          <Summary label="Horario" value={confirmed.time} />
          <a
            href={publicWhatsappLink(barbershop.whatsapp ?? barbershop.phone ?? "", message)}
            target="_blank"
            className={buttonVariants({ className: "w-full" })}
          >
            Chamar no WhatsApp
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card">
      <CardHeader>
        <CardTitle>Escolha seu horario</CardTitle>
        <CardDescription>Fluxo publico mobile-first para clientes finais.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            name="serviceId"
            control={form.control}
            render={({ field }) => (
              <Field label="Servico" error={form.formState.errors.serviceId?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - R$ {Number(service.price).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name="barberId"
            control={form.control}
            render={({ field }) => (
              <Field label="Barbeiro" error={form.formState.errors.barberId?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data" error={form.formState.errors.date?.message}>
              <Input type="date" {...form.register("date")} />
            </Field>
            <Field label="Horario" error={form.formState.errors.time?.message}>
              <Input type="time" {...form.register("time")} />
            </Field>
          </div>
          <Field label="Nome" error={form.formState.errors.customerName?.message}>
            <Input {...form.register("customerName")} placeholder="Seu nome" />
          </Field>
          <Field label="WhatsApp" error={form.formState.errors.customerWhatsapp?.message}>
            <Input {...form.register("customerWhatsapp")} placeholder="(11) 99999-9999" />
          </Field>
          <Field label="Observacoes" error={form.formState.errors.notes?.message}>
            <Textarea {...form.register("notes")} placeholder="Preferencias ou observacoes" />
          </Field>
          <Button type="submit" disabled={saving}>
            {saving ? "Confirmando..." : "Confirmar agendamento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <strong className="text-right font-medium">{value}</strong>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
