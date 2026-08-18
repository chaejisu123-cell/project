"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function DeleteButton({
  label = "삭제",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      disabled={pending}
      className={className}
    >
      {pending ? "삭제 중..." : label}
    </Button>
  );
}
