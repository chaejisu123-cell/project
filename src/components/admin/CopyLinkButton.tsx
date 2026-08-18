"use client";

import { useState } from "react";

export function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/site/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 접근이 막힌 환경이면 조용히 무시한다.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-sm font-medium text-ink-muted hover:text-ink"
    >
      {copied ? "복사됨" : "고객 링크 복사"}
    </button>
  );
}
