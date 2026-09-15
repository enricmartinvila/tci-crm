"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions/crm";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/form-fields";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await loginAction(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgb(225 29 46 / 22%), transparent 40%), radial-gradient(circle at 80% 10%, rgb(20 40 120 / 45%), transparent 35%), linear-gradient(160deg, #040816, #0a1440 55%, #060b1a)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="tci-animate-in relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size={96} className="mb-5" />
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            The Cartel Insider
          </h1>
          <p className="mt-2 text-base text-[#9aa6c4]">Sponsor CRM</p>
        </div>

        <div className="tci-panel p-6 sm:p-8">
          <p className="mb-5 text-base text-[#9aa6c4]">
            Acceso privado al pipeline de sponsors.
          </p>
          <form action={onSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="bg-black/20"
              />
            </Field>
            <Field label="Contraseña">
              <Input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="bg-black/20"
              />
            </Field>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button
              type="submit"
              disabled={pending}
              className="mt-1 w-full font-semibold tracking-wide"
            >
              {pending ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#6b7799]">
          <a
            href="https://www.youtube.com/@TheCartelInsider"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            youtube.com/@TheCartelInsider
          </a>
        </p>
      </div>
    </div>
  );
}
