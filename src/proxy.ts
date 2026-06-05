import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const privatePrefixes = [
  "/dashboard",
  "/agenda",
  "/clientes",
  "/barbeiros",
  "/servicos",
  "/comandas",
  "/financeiro",
  "/comissoes",
  "/estoque",
  "/marketing",
  "/configuracoes",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isPrivate = privatePrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPrivate && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/cadastro") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
