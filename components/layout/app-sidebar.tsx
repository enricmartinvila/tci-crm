"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CalendarClock,
  ExternalLink,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { href: "/import", label: "Import", icon: Upload },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-md shadow-red-950/40"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
            )}
          >
            <Icon
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                active ? "text-white" : "text-[#9aa6c4]"
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({ email }: { email?: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarBody = (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="border-b border-sidebar-border px-4 py-5">
        <BrandWordmark />
        {email ? (
          <p className="mt-3 truncate text-sm text-[#9aa6c4]">{email}</p>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-[#6b7799]">
          Pipeline
        </p>
        <NavLinks onNavigate={() => setOpen(false)} />
      </div>
      <div className="space-y-2 border-t border-sidebar-border p-3">
        <a
          href="https://www.youtube.com/@TheCartelInsider"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#9aa6c4] transition-colors hover:bg-sidebar-accent hover:text-white"
        >
          <ExternalLink className="size-4 text-primary" />
          @TheCartelInsider
        </a>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-[#9aa6c4] hover:text-white"
          onClick={signOut}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-sidebar-border md:block">
        {sidebarBody}
      </aside>
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#050a16]/90 px-4 py-3.5 backdrop-blur-md md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="outline" size="icon" />}
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-80 border-white/10 p-0">
            {sidebarBody}
          </SheetContent>
        </Sheet>
        <BrandWordmark subtitle="CRM" />
      </div>
    </>
  );
}
