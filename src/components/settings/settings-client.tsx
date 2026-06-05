"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserRole } from "@/lib/types";
import { Building2, MapPin, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type SettingsData = {
  currentRole: string;
  canManage: boolean;
  barbershop: {
    id: string;
    name: string;
    slug: string;
    legal_name?: string | null;
    cnpj?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    zip_code?: string | null;
    address?: string | null;
    address_number?: string | null;
    address_complement?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    active?: boolean | null;
  } | null;
  settings: {
    public_booking_enabled?: boolean | null;
  } | null;
  users: Array<{
    id: string;
    userId: string;
    role: UserRole;
    active: boolean;
    name: string;
    email: string;
    phone: string;
    barberId: string | null;
    specialty: string | null;
    commissionPercent: number | string | null;
    allowOnlineBooking: boolean | null;
  }>;
};

const roleLabels: Record<string, string> = {
  owner: "Dono",
  admin: "Administrador",
  barber: "Barbeiro",
  receptionist: "Recepcao",
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function SelectLike({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </select>
  );
}

export function SettingsClient({ data }: { data: SettingsData }) {
  const router = useRouter();
  const [savingShop, setSavingShop] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const barbershop = data.barbershop;

  const [shopForm, setShopForm] = useState({
    name: barbershop?.name ?? "",
    slug: barbershop?.slug ?? "",
    legalName: barbershop?.legal_name ?? "",
    cnpj: barbershop?.cnpj ?? "",
    phone: barbershop?.phone ?? "",
    whatsapp: barbershop?.whatsapp ?? "",
    email: barbershop?.email ?? "",
    zipCode: barbershop?.zip_code ?? "",
    address: barbershop?.address ?? "",
    addressNumber: barbershop?.address_number ?? "",
    addressComplement: barbershop?.address_complement ?? "",
    neighborhood: barbershop?.neighborhood ?? "",
    city: barbershop?.city ?? "",
    state: barbershop?.state ?? "",
    publicBookingEnabled: data.settings?.public_booking_enabled ?? true,
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    whatsapp: "",
    role: "barber",
    specialty: "",
    commissionPercent: 40,
    allowOnlineBooking: true,
  });

  const publicUrl = useMemo(() => `/agendar/${shopForm.slug || "sua-barbearia"}`, [shopForm.slug]);

  function updateShop(field: keyof typeof shopForm, value: string | boolean) {
    setShopForm((current) => ({ ...current, [field]: value }));
  }

  function updateUser(field: keyof typeof userForm, value: string | number | boolean) {
    setUserForm((current) => ({ ...current, [field]: value }));
  }

  async function fetchCep() {
    const cep = onlyDigits(shopForm.zipCode);

    if (cep.length !== 8) {
      toast.error("Informe um CEP com 8 digitos.");
      return;
    }

    setLoadingCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const payload = await response.json();

      if (payload.erro) {
        throw new Error("CEP nao encontrado.");
      }

      setShopForm((current) => ({
        ...current,
        zipCode: cep,
        address: payload.logradouro ?? current.address,
        neighborhood: payload.bairro ?? current.neighborhood,
        city: payload.localidade ?? current.city,
        state: payload.uf ?? current.state,
      }));
      toast.success("Endereco preenchido pelo CEP.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  }

  async function saveShop(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingShop(true);

    try {
      const response = await fetch("/api/settings/barbershop", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(shopForm),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Nao foi possivel salvar a barbearia.");
      }

      toast.success("Dados da barbearia salvos.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar.");
    } finally {
      setSavingShop(false);
    }
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingUser(true);

    try {
      const response = await fetch("/api/settings/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Nao foi possivel criar o usuario.");
      }

      toast.success("Usuario criado e liberado para acesso.");
      setUserForm({
        name: "",
        email: "",
        password: "",
        whatsapp: "",
        role: "barber",
        specialty: "",
        commissionPercent: 40,
        allowOnlineBooking: true,
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel criar o usuario.");
    } finally {
      setSavingUser(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="mb-3 bg-primary/15 text-primary hover:bg-primary/15">
            {roleLabels[data.currentRole] ?? data.currentRole}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Configuracoes</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Dados fiscais, endereco, agenda publica, usuarios e permissoes da barbearia.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
          Link publico: <span className="font-medium text-foreground">{publicUrl}</span>
        </div>
      </div>

      {!data.canManage ? (
        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle>Acesso limitado</CardTitle>
            <CardDescription>Seu usuario pode consultar configuracoes, mas apenas dono/admin pode editar.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <form onSubmit={saveShop}>
        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Cadastro da barbearia
            </CardTitle>
            <CardDescription>Esses dados aparecem no sistema, documentos internos e link publico.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome fantasia">
                <Input value={shopForm.name} onChange={(event) => updateShop("name", event.target.value)} disabled={!data.canManage} />
              </Field>
              <Field label="Razao social">
                <Input value={shopForm.legalName} onChange={(event) => updateShop("legalName", event.target.value)} disabled={!data.canManage} />
              </Field>
              <Field label="CNPJ">
                <Input value={shopForm.cnpj} onChange={(event) => updateShop("cnpj", event.target.value)} disabled={!data.canManage} placeholder="00.000.000/0000-00" />
              </Field>
              <Field label="Link publico">
                <Input value={shopForm.slug} onChange={(event) => updateShop("slug", event.target.value)} disabled={!data.canManage} />
              </Field>
              <Field label="WhatsApp principal">
                <Input value={shopForm.whatsapp} onChange={(event) => updateShop("whatsapp", event.target.value)} disabled={!data.canManage} />
              </Field>
              <Field label="Telefone">
                <Input value={shopForm.phone} onChange={(event) => updateShop("phone", event.target.value)} disabled={!data.canManage} />
              </Field>
              <Field label="E-mail comercial">
                <Input type="email" value={shopForm.email} onChange={(event) => updateShop("email", event.target.value)} disabled={!data.canManage} />
              </Field>
              <label className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={shopForm.publicBookingEnabled}
                  onChange={(event) => updateShop("publicBookingEnabled", event.target.checked)}
                  disabled={!data.canManage}
                />
                Agendamento publico ativo
              </label>
            </div>

            <div className="h-px bg-border" />

            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Endereco com busca automatica por CEP
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="CEP">
                  <div className="flex gap-2">
                    <Input value={shopForm.zipCode} onChange={(event) => updateShop("zipCode", event.target.value)} disabled={!data.canManage} />
                    <Button type="button" variant="outline" disabled={!data.canManage || loadingCep} onClick={fetchCep}>
                      {loadingCep ? "..." : "Buscar"}
                    </Button>
                  </div>
                </Field>
                <Field label="Endereco">
                  <Input value={shopForm.address} onChange={(event) => updateShop("address", event.target.value)} disabled={!data.canManage} />
                </Field>
                <Field label="Numero">
                  <Input value={shopForm.addressNumber} onChange={(event) => updateShop("addressNumber", event.target.value)} disabled={!data.canManage} />
                </Field>
                <Field label="Complemento">
                  <Input value={shopForm.addressComplement} onChange={(event) => updateShop("addressComplement", event.target.value)} disabled={!data.canManage} />
                </Field>
                <Field label="Bairro">
                  <Input value={shopForm.neighborhood} onChange={(event) => updateShop("neighborhood", event.target.value)} disabled={!data.canManage} />
                </Field>
                <Field label="Cidade">
                  <Input value={shopForm.city} onChange={(event) => updateShop("city", event.target.value)} disabled={!data.canManage} />
                </Field>
                <Field label="UF">
                  <Input value={shopForm.state} onChange={(event) => updateShop("state", event.target.value)} disabled={!data.canManage} maxLength={2} />
                </Field>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!data.canManage || savingShop}>
                {savingShop ? "Salvando..." : "Salvar cadastro"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={createUser}>
          <Card className="border-border/80 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Criar usuario
              </CardTitle>
              <CardDescription>Crie acessos para barbeiros, recepcao e administradores.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="Nome">
                <Input value={userForm.name} onChange={(event) => updateUser("name", event.target.value)} disabled={!data.canManage} />
              </Field>
              <Field label="E-mail de acesso">
                <Input type="email" value={userForm.email} onChange={(event) => updateUser("email", event.target.value)} disabled={!data.canManage} />
              </Field>
              <Field label="Senha inicial">
                <Input type="text" value={userForm.password} onChange={(event) => updateUser("password", event.target.value)} disabled={!data.canManage} placeholder="Minimo 6 caracteres" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="WhatsApp">
                  <Input value={userForm.whatsapp} onChange={(event) => updateUser("whatsapp", event.target.value)} disabled={!data.canManage} />
                </Field>
                <Field label="Permissao">
                  <SelectLike value={userForm.role} onChange={(value) => updateUser("role", value)} >
                    <option value="barber">Barbeiro</option>
                    <option value="receptionist">Recepcao</option>
                    <option value="admin">Administrador</option>
                  </SelectLike>
                </Field>
              </div>
              {userForm.role === "barber" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Especialidade">
                    <Input value={userForm.specialty} onChange={(event) => updateUser("specialty", event.target.value)} disabled={!data.canManage} />
                  </Field>
                  <Field label="Comissao padrao (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={userForm.commissionPercent}
                      onChange={(event) => updateUser("commissionPercent", Number(event.target.value))}
                      disabled={!data.canManage}
                    />
                  </Field>
                  <label className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={userForm.allowOnlineBooking}
                      onChange={(event) => updateUser("allowOnlineBooking", event.target.checked)}
                      disabled={!data.canManage}
                    />
                    Permitir agendamento online para este barbeiro
                  </label>
                </div>
              ) : null}
              <Button type="submit" disabled={!data.canManage || savingUser}>
                {savingUser ? "Criando..." : "Criar usuario"}
              </Button>
            </CardContent>
          </Card>
        </form>

        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-primary" />
              Usuarios e permissoes
            </CardTitle>
            <CardDescription>
              Barbeiros ficam restritos a propria agenda e lancamentos. Exclusoes financeiras ficam com dono/admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Permissao</TableHead>
                  <TableHead>Barbeiro</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{roleLabels[user.role] ?? user.role}</TableCell>
                    <TableCell>
                      {user.barberId ? (
                        <span className="text-muted-foreground">{user.specialty || "Agenda vinculada"}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.active ? "secondary" : "outline"}>{user.active ? "ativo" : "inativo"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Regras aplicadas
          </CardTitle>
          <CardDescription>Base de permissao preparada para a operacao.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-lg border border-border bg-background/40 p-3">Dono/Admin: configuracoes, equipe, cadastros e exclusoes.</div>
          <div className="rounded-lg border border-border bg-background/40 p-3">Barbeiro: propria agenda, atendimentos e lancamentos vinculados a ele.</div>
          <div className="rounded-lg border border-border bg-background/40 p-3">Recepcao: agenda e lancamentos, sem exclusao financeira sensivel.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
