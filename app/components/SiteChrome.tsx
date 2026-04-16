import Link from "next/link";
import type { ReactNode } from "react";

const EUR_LEX_GDPR =
  "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=celex%3A32016R0679";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Verzeichnis von Verarbeitungstätigkeiten
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Art. 30 DSGVO — Erfassungshilfe (keine Rechtsberatung)
            </p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              Übersicht
            </Link>
            <Link
              href="/verantwortliche/neu"
              className="font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              Neuer Verantwortlicher
            </Link>
            <a
              href={EUR_LEX_GDPR}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              EUR-Lex (DSGVO)
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-zinc-200 bg-zinc-50 py-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        <div className="mx-auto max-w-4xl px-4">
          <p>
            Diese Anwendung unterstützt die Dokumentation gemäß Art. 30 DSGVO.
            Rechtliche Bewertung, interne Zuständigkeiten und weitere
            Nachweise (z.&nbsp;B. zu Auftragsverarbeitung oder TOM) bleiben
            außerhalb dieser Software zu klären. Rechtsgrundlage:{" "}
            <a
              href={EUR_LEX_GDPR}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-800 underline underline-offset-2 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Verordnung (EU) 2016/679
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
