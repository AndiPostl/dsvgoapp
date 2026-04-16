import { ActivityForm } from "@/app/components/ActivityForm";
import { SiteChrome } from "@/app/components/SiteChrome";
import { getController } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function NeueTaetigkeitPage({ params }: PageProps) {
  const { id } = await params;
  const controller = await getController(id);
  if (!controller) notFound();

  return (
    <SiteChrome>
      <div className="space-y-6">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href={`/verantwortliche/${id}`}
            className="font-medium text-zinc-800 underline underline-offset-2 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            ← Zurück zum Verantwortlichen
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Neue Verarbeitungstätigkeit
        </h1>
        <ActivityForm mode="create" controllerId={id} />
      </div>
    </SiteChrome>
  );
}
