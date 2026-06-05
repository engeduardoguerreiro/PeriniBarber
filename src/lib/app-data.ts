import {
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Megaphone,
  Package,
  Scissors,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";

export const appName = "Perini Barber";

export const privateRoutes = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/barbeiros", label: "Barbeiros", icon: UserRound },
  { href: "/servicos", label: "Servicos", icon: Scissors },
  { href: "/comandas", label: "Comandas", icon: ClipboardList },
  { href: "/financeiro", label: "Financeiro", icon: CreditCard },
  { href: "/comissoes", label: "Comissoes", icon: BadgeDollarSign },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings },
];

export const modules = {
  agenda: {
    title: "Agenda",
    description: "Visualize horarios por dia, semana e barbeiro, evitando conflito de atendimento.",
    primaryAction: "Novo agendamento",
    table: ["Cliente", "Barbeiro", "Servico", "Horario", "Status"],
    empty:
      "Conecte o Supabase e crie agendamentos para popular a agenda interna em tempo real.",
  },
  clientes: {
    title: "Clientes",
    description: "CRM com WhatsApp, barbeiro preferido, historico, ticket medio e status.",
    primaryAction: "Novo cliente",
    table: ["Nome", "WhatsApp", "Preferencia", "Ultimo atendimento", "Total gasto"],
    empty: "Nenhum cliente encontrado para a barbearia ativa.",
  },
  barbeiros: {
    title: "Barbeiros",
    description: "Gerencie equipe, horarios, comissao padrao e disponibilidade online.",
    primaryAction: "Novo barbeiro",
    table: ["Nome", "Especialidade", "Comissao", "Online", "Status"],
    empty: "Cadastre barbeiros para liberar a agenda e o link publico.",
  },
  servicos: {
    title: "Servicos",
    description: "Catalogo de servicos com preco, duracao, comissao e barbeiros habilitados.",
    primaryAction: "Novo servico",
    table: ["Servico", "Preco", "Duracao", "Comissao", "Status"],
    empty: "Nenhum servico cadastrado ainda.",
  },
  comandas: {
    title: "Comandas",
    description: "PDV para servicos, produtos, descontos, pagamentos e observacoes.",
    primaryAction: "Nova comanda",
    table: ["Cliente", "Barbeiro", "Total", "Pagamento", "Status"],
    empty: "Comandas abertas e pagas aparecerao aqui.",
  },
  financeiro: {
    title: "Financeiro",
    description: "Entradas, saidas, formas de pagamento, ticket medio e relatorios por periodo.",
    primaryAction: "Registrar lancamento",
    table: ["Data", "Tipo", "Categoria", "Valor", "Origem"],
    empty: "Sem movimentacoes financeiras no periodo selecionado.",
  },
  comissoes: {
    title: "Comissoes",
    description: "Calculo automatico de comissoes por barbeiro, periodo e status de pagamento.",
    primaryAction: "Marcar pagamento",
    table: ["Barbeiro", "Periodo", "Valor bruto", "Comissao", "Pendente"],
    empty: "Finalize comandas para gerar comissoes.",
  },
  estoque: {
    title: "Estoque",
    description: "Produtos, estoque minimo, custo, preco de venda e movimentacoes.",
    primaryAction: "Novo produto",
    table: ["Produto", "Categoria", "Atual", "Minimo", "Status"],
    empty: "Produtos e alertas de estoque baixo ficarao disponiveis aqui.",
  },
  marketing: {
    title: "Marketing",
    description: "Modelos prontos para WhatsApp sem integracao oficial nesta primeira versao.",
    primaryAction: "Novo modelo",
    table: ["Mensagem", "Tipo", "Canal", "Status", "Acao"],
    empty: "Crie templates para confirmacao, lembrete, aniversario e promocoes.",
  },
  configuracoes: {
    title: "Configuracoes",
    description: "Dados da barbearia, horarios, usuarios, permissoes, pagamentos e tema basico.",
    primaryAction: "Salvar alteracoes",
    table: ["Secao", "Responsavel", "Ultima alteracao", "Status", "Acao"],
    empty: "Configure a barbearia apos criar a conta owner.",
  },
} as const;

export const dashboardCards = [
  { label: "Faturamento do dia", value: "R$ 0,00", hint: "Lido de comandas pagas" },
  { label: "Faturamento do mes", value: "R$ 0,00", hint: "Periodo atual" },
  { label: "Agendamentos hoje", value: "0", hint: "Agenda interna e publica" },
  { label: "Clientes novos", value: "0", hint: "No mes atual" },
  { label: "Servicos realizados", value: "0", hint: "Hoje" },
  { label: "Comissoes pendentes", value: "R$ 0,00", hint: "A pagar" },
];

export const landingFeatures = [
  "Agenda online com bloqueio de conflitos",
  "Cadastro de barbeiros, clientes e serviços",
  "Comandas com pagamentos e comissões",
  "Financeiro com filtros por periodo",
  "Link público de agendamento por barbearia",
  "RLS para isolamento multiempresa",
];

export const plans = [
  {
    name: "Assinatura unica",
    price: "R$ 29,90",
    features: ["Agenda online", "Clientes e barbeiros", "Financeiro e comandas", "Link publico"],
  },
];
