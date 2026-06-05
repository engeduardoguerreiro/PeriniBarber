export type UserRole = "owner" | "admin" | "barber" | "receptionist";
export type AppointmentStatus =
  | "agendado"
  | "confirmado"
  | "em_atendimento"
  | "finalizado"
  | "cancelado"
  | "nao_compareceu";

export type Barbershop = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  active: boolean;
};

export type Barber = {
  id: string;
  name: string;
  specialty: string | null;
  photo_url: string | null;
  allow_online_booking: boolean;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
};

export type PublicBookingData = {
  barbershop: Barbershop | null;
  barbers: Barber[];
  services: Service[];
};
