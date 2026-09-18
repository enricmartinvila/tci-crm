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
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppSidebar email={user.email} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
