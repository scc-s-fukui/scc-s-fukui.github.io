"use client";

import { useRef, useState } from "react";

/** コピーボタンつきのコードブロック。クリップボードが使えない環境では本文を選択状態にして手動コピーを促す */
export default function CopyCode({ label, children }: { label: string; children: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [state, setState] = useState<"idle" | "copied" | "selected">("idle");

  const selectText = () => {
    const pre = preRef.current;
    if (!pre) return;
    const range = document.createRange();
    range.selectNodeContents(pre);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    setState("selected");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      selectText();
    }
  };

  return (
    <div className="art-copy">
      <div className="art-copy-bar">
        <span>{label}</span>
        <button type="button" onClick={copy}>
          {state === "copied" ? "コピーしました" : state === "selected" ? "選択しました。Ctrl+C でコピー" : "コピー"}
        </button>
      </div>
      <pre className="art-code" ref={preRef}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
