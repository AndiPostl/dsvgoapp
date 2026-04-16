import { ActivityForm } from "@/app/components/ActivityForm";
import { SiteChrome } from "@/app/components/SiteChrome";
import { getActivity, getController } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function BearbeitenTaetigkeitPage({ params }: PageProps) {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) notFound();

  const controller = await getController(activity.controllerId);

  return (
    <SiteChrome>
      <div className="space-y-6">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href={`/verantwortliche/${activity.controllerId}`}
            className="font-medium text-zinc-800 underline underline-offset-2 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            ← Zurück zum Verantwortlichen
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Verarbeitungstätigkeit bearbeiten
        </h1>
        {controller && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Verantwortliche(r):{" "}
            <span className="text-zinc-800 dark:text-zinc-200">
              {controller.controllerContact.replace(/\s+/g, " ").trim().slice(0, 120)}
              {controller.controllerContact.length > 120 ? "…" : ""}
            </span>
          </p>
        )}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Tätigkeit-ID:{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
            {activity.id}
          </code>
        </p>
        <ActivityForm mode="edit" initial={activity} />
      </div>
    </SiteChrome>
  );
}
