"use client";

import { Badge } from "@/components/ui/badge";
import { Scissors } from "lucide-react";
import { motion } from "motion/react";

const barbershops = [
  "Barberix Prime",
  "Navalha Aurora",
  "Corteon Club",
  "Barba Vértice",
  "Fio Nobre Lab",
  "Dom Razorium",
  "Studio Cromo",
  "Bigode Atlas",
  "Lâmina Vanguarda",
  "Barberhaus 29",
  "Corte Quântico",
  "Navax Studio",
  "Fino Traço Barber",
  "Estilo Voltra",
];

const repeatedBarbershops = [...barbershops, ...barbershops];

export function BarbershopMarquee() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative z-10 mt-14 overflow-hidden border-y border-primary/10 bg-black/25 py-9 backdrop-blur-md"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#0f0f0f] to-transparent md:w-56" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-[#0f0f0f] to-transparent md:w-56" />
      <div className="pointer-events-none absolute inset-0 premium-grid opacity-35" />

      <div className="relative mx-auto mb-7 flex max-w-7xl justify-center px-4">
        <Badge className="border border-primary/20 bg-primary/10 px-4 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.45em] text-primary hover:bg-primary/10">
          Utilizado por barbearias em todo o Brasil
        </Badge>
      </div>

      <div className="marquee-track group flex w-max gap-11">
        {repeatedBarbershops.map((name, index) => (
          <motion.div
            key={`${name}-${index}`}
            whileHover={{ y: -4, scale: 1.035 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex min-w-max items-center gap-3 text-xl font-semibold text-white/22 transition duration-300 hover:text-primary md:text-2xl"
          >
            <Scissors className="h-5 w-5 text-primary/42" />
            <span>{name}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
