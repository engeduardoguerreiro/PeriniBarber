import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link href="/" className="flex items-center">
        <span className="relative flex h-11 w-11 overflow-hidden rounded-md">
          <Image src="/perini-barber-logo-transparent.png" alt="Perini Barber" fill className="object-contain" priority />
        </span>
      </Link>
    );
  }

  return (
    <Link href="/" className="flex items-center">
      <span className="relative flex h-12 w-44 overflow-hidden rounded-md md:h-14 md:w-52">
        <Image src="/perini-barber-logo-transparent.png" alt="Perini Barber" fill className="object-contain" priority />
      </span>
    </Link>
  );
}
