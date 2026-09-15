import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  size = 44,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/tci-avatar.jpg"
      alt="The Cartel Insider"
      width={size}
      height={size}
      className={cn(
        "tci-mark rounded-full ring-2 ring-white/20 shadow-lg shadow-red-900/30",
        className
      )}
      priority
    />
  );
}

export function BrandWordmark({
  subtitle = "Sponsor CRM",
  className,
}: {
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark size={48} />
      <div className="min-w-0 leading-snug">
        <p className="text-base font-bold text-white">The Cartel Insider</p>
        <p className="truncate text-sm font-medium text-[#9aa6c4]">{subtitle}</p>
      </div>
    </div>
  );
}
