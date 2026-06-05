"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/browser";
import { signInSchema, signUpSchema } from "@/lib/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type Mode = "login" | "signup";
type Values = z.infer<typeof signUpSchema>;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const schema = mode === "login" ? signInSchema : signUpSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) as unknown as Resolver<Values> });

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            barbershop_name: values.barbershopName,
            whatsapp: values.whatsapp,
          },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      toast.success("Cadastro criado. Verifique seu e-mail para confirmar o acesso.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel concluir a acao.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/90">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Entrar" : "Criar conta"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Acesse o painel da sua barbearia."
            : "Crie seu usuario owner e informe a barbearia inicial."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {mode === "signup" ? (
            <>
              <Field label="Seu nome" error={errors.name?.message}>
                <Input {...register("name")} placeholder="Eduardo Perini" />
              </Field>
              <Field label="Nome da barbearia" error={errors.barbershopName?.message}>
                <Input {...register("barbershopName")} placeholder="Perini Barber" />
              </Field>
              <Field label="WhatsApp" error={errors.whatsapp?.message}>
                <Input {...register("whatsapp")} placeholder="(11) 99999-9999" />
              </Field>
            </>
          ) : null}
          <Field label="E-mail" error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="voce@barbearia.com.br" />
          </Field>
          <Field label="Senha" error={errors.password?.message}>
            <Input {...register("password")} type="password" placeholder="******" />
          </Field>
          <Button className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href={mode === "login" ? "/cadastro" : "/login"} className="hover:text-primary">
              {mode === "login" ? "Criar conta" : "Ja tenho conta"}
            </Link>
            {mode === "login" ? <button type="button" className="hover:text-primary">Esqueci minha senha</button> : null}
          </div>
        </form>
      </CardContent>
    </Card>
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
