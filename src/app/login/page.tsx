import { Brand } from "@/components/app/brand";
import { AuthForm } from "@/components/auth/auth-form";
import { Toaster } from "@/components/ui/sonner";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="mb-6"><Brand /></div>
      <AuthForm mode="login" />
      <Toaster richColors />
    </main>
  );
}
