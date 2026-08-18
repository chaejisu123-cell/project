export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-canvas px-4 py-10 text-center text-sm text-ink-muted">
      {text}
    </div>
  );
}
