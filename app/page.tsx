import { SiteChrome } from "@/app/components/SiteChrome";
import { listControllerSummaries } from "@/lib/store";
import Link from "next/link";

function preview(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t || "—";
  return `${t.slice(0, max)}…`;
}

export default async function Home() {
  let rows: Awaited<ReturnType<typeof listControllerSummaries>> = [];
  let loadError: string | null = null;
  try {
    rows = await listControllerSummaries();
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  return (
    <SiteChrome>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Verantwortliche
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Je Verantwortliche(r) mehrere Verarbeitungstätigkeiten (1:n).
              Daten lokal in{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
                data/verzeichnis.json
              </code>
              .
            </p>
          </div>
          <Link
            href="/verantwortliche/neu"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Neuer Verantwortlicher
          </Link>
        </div>

        {loadError && (
          <p
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
            role="alert"
          >
            Daten konnten nicht geladen werden: {loadError}
          </p>
        )}

        {rows.length === 0 && !loadError ? (
          <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
            Noch keine Verantwortlichen. Legen Sie zuerst einen Verantwortlichen
            an, dann Verarbeitungstätigkeiten darunter.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-950">
            {rows.map(({ controller: c, activityCount }) => (
              <li key={c.id}>
                <Link
                  href={`/verantwortliche/${c.id}`}
                  className="block px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {preview(c.controllerContact, 80)}
                    </span>
                    <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      {activityCount} Tätigkeit
                      {activityCount === 1 ? "" : "en"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteChrome>
  );
}
