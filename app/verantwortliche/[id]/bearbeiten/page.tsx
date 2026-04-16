import { ControllerForm } from "@/app/components/ControllerForm";
import { SiteChrome } from "@/app/components/SiteChrome";
import { getController } from "@/lib/store";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function VerantwortlicherBearbeitenPage({
  params,
}: PageProps) {
  const { id } = await params;
  const controller = await getController(id);
  if (!controller) notFound();

  return (
    <SiteChrome>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Verantwortliche bearbeiten
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          ID:{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
            {controller.id}
          </code>
        </p>
        <ControllerForm mode="edit" initial={controller} />
      </div>
    </SiteChrome>
  );
}
