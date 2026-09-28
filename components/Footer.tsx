import Link from "next/link";

type FooterProps = {
  backHref?: string;
  backLabel?: string;
};

export default function Footer({ backHref, backLabel = "Portal に戻る" }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>&copy; 2026 S.Fukui. All rights reserved.</p>
        {backHref && (
          <p>
            <Link href={backHref} className="footer-back-link">
              &larr; {backLabel}
            </Link>
          </p>
        )}
      </div>
    </footer>
  );
}
