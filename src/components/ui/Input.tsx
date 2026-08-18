import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-border bg-canvas px-3 text-sm text-ink placeholder:text-ink-muted",
        "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
        "disabled:bg-surface disabled:text-ink-muted",
        className,
      )}
      {...props}
    />
  );
});
