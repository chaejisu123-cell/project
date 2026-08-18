import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-border bg-canvas px-3 text-sm text-ink",
        "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
