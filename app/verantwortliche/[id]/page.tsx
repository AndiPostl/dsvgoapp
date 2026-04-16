import { SiteChrome } from "@/app/components/SiteChrome";
import { getController, listActivities } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";

function preview(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t || "—";
  return `${t.slice(0, max)}…`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("de-DE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

type PageProps = { params: Promise<{ id: string }> };

export default async function VerantwortlicherDetailPage({ params }: PageProps) {
  const { id } = await params;
  const controller = await getController(id);
  if (!controller) notFound();

  const activities = await listActivities(id);

  return (
    <SiteChrome>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Verantwortliche(r)
            </h1>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {controller.controllerContact}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/verantwortliche/${id}/bearbeiten`}
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Stammdaten bearbeiten
            </Link>
            <Link
              href={`/verantwortliche/${id}/taetigkeit/neu`}
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Neue Verarbeitungstätigkeit
            </Link>
          </div>
        </div>

        {(controller.jointControllersContact ||
          controller.representativeContact ||
          controller.dpoContact) && (
          <section className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/40">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Weitere Kontakte (lit. a)
            </h2>
            <dl className="mt-3 space-y-3">
              {controller.jointControllersContact ? (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">
                    Gemeinsam Verantwortliche
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                    {controller.jointControllersContact}
                  </dd>
                </div>
              ) : null}
              {controller.representativeContact ? (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Vertreter</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                    {controller.representativeContact}
                  </dd>
                </div>
              ) : null}
              {controller.dpoContact ? (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">DSB</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                    {controller.dpoContact}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Verarbeitungstätigkeiten
          </h2>
          {activities.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
              Noch keine Tätigkeit erfasst.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-950">
              {activities.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/verarbeitung/${a.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {preview(a.processingPurposes, 72)}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(a.updatedAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </SiteChrome>
  );
}
