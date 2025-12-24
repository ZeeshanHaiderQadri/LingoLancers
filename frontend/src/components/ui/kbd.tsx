
import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <kbd className={cn(
        "px-2 py-1 text-xs font-sans font-semibold text-muted-foreground bg-black/50 border border-white/20 rounded-md",
        className
    )}>
      {children}
    </kbd>
  );
}
