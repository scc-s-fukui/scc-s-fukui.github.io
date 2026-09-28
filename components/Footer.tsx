import Link from "next/link";

type FooterProps = {
  backHref?: string;
  backLabel?: string;
};

export default function Footer({ backHref, backLabel = "Portal に戻る" }: FooterProps) {
  return (
    <footer className="border-t border-line px-6 py-6 text-sm text-muted">
      <div className="mx-auto max-w-content px-6">
        <p>&copy; 2026 S.Fukui. All rights reserved.</p>
        {backHref && (
          <p className="mt-2">
            <Link href={backHref} className="text-muted no-underline hover:text-accent">
              &larr; {backLabel}
            </Link>
          </p>
        )}
      </div>
    </footer>
  );
}
