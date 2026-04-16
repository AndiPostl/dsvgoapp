import { ControllerForm } from "@/app/components/ControllerForm";
import { SiteChrome } from "@/app/components/SiteChrome";

export default function NeuerVerantwortlicherPage() {
  return (
    <SiteChrome>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Neuer Verantwortlicher
        </h1>
        <ControllerForm mode="create" />
      </div>
    </SiteChrome>
  );
}
