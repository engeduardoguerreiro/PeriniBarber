import { z } from "zod";

const requiredText = z.string().trim().min(1, "Campo obrigatorio");
const whatsapp = z.string().trim().min(10, "Informe um WhatsApp valido");
const optionalText = z.string().trim().optional().or(z.literal(""));

export const signInSchema = z.object({
  email: z.email("E-mail invalido"),
  password: z.string().min(6, "Minimo de 6 caracteres"),
});

export const signUpSchema = signInSchema.extend({
  name: requiredText,
  barbershopName: requiredText,
  whatsapp,
});

export const barbershopSchema = z.object({
  name: requiredText,
  slug: z
    .string()
    .trim()
    .min(3, "Minimo de 3 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minusculas, numeros e hifens"),
  legalName: optionalText,
  cnpj: optionalText,
  phone: whatsapp.optional().or(z.literal("")),
  whatsapp: whatsapp.optional().or(z.literal("")),
  email: z.email("E-mail invalido").optional().or(z.literal("")),
  zipCode: optionalText,
  address: optionalText,
  addressNumber: optionalText,
  addressComplement: optionalText,
  neighborhood: optionalText,
  city: optionalText,
  state: optionalText,
  publicBookingEnabled: z.boolean().default(true),
});

export const teamUserSchema = z.object({
  name: requiredText,
  email: z.email("E-mail invalido"),
  password: z.string().min(6, "Minimo de 6 caracteres"),
  whatsapp: whatsapp.optional().or(z.literal("")),
  role: z.enum(["admin", "barber", "receptionist"]),
  specialty: optionalText,
  commissionPercent: z.coerce.number().min(0).max(100).default(40),
  allowOnlineBooking: z.boolean().default(true),
});

export const serviceSchema = z.object({
  name: requiredText,
  price: z.coerce.number().min(0, "Preco deve ser maior ou igual a zero"),
  durationMinutes: z.coerce.number().int().positive("Duracao deve ser maior que zero"),
  commissionPercent: z.coerce.number().min(0).max(100),
});

export const customerSchema = z.object({
  name: requiredText,
  whatsapp,
  email: z.email("E-mail invalido").optional().or(z.literal("")),
});

export const bookingSchema = z.object({
  serviceId: requiredText,
  barberId: requiredText,
  date: requiredText,
  time: requiredText,
  customerName: requiredText,
  customerWhatsapp: whatsapp,
  notes: z.string().optional(),
});

export const appointmentSchema = bookingSchema.extend({
  customerId: requiredText,
  origin: z.enum(["interno", "publico", "whatsapp"]).default("interno"),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type BookingValues = z.infer<typeof bookingSchema>;
export type BarbershopValues = z.infer<typeof barbershopSchema>;
export type TeamUserValues = z.infer<typeof teamUserSchema>;
