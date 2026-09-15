import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <AppSidebar email={user.email} />
      <main className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <div className="tci-animate-in mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
