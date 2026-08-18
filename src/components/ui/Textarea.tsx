import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted",
        "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
        className,
      )}
      {...props}
    />
  );
});
