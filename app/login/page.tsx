"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions/crm";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <div className="absolute top-4 right-4 z-20 w-40">
        <ThemeToggle />
      </div>

      <div className="tci-animate-in relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size={96} className="mb-5" />
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            The Cartel Insider
          </h1>
          <p className="mt-2 text-base text-muted-foreground">Sponsor CRM</p>
        </div>

        <div className="tci-panel p-6 sm:p-8">
          <p className="mb-5 text-base text-muted-foreground">
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
              />
            </Field>
            <Field label="Contraseña">
              <Input
                name="password"
                type="password"
                required
                autoComplete="current-password"
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

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <a
            href="https://www.youtube.com/@TheCartelInsider"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            youtube.com/@TheCartelInsider
          </a>
        </p>
      </div>
    </div>
  );
}
