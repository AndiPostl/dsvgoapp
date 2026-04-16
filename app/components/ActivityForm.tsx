"use client";

import {
  TOM_MEASURE_OPTIONS,
  type ProcessingActivity,
  type TomMeasureId,
} from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const defaultEmpty: Omit<
  ProcessingActivity,
  "id" | "createdAt" | "updatedAt" | "controllerId"
> = {
  processingPurposes: "",
  dataSubjectCategories: "",
  personalDataCategories: "",
  recipientCategories: "",
  thirdCountryTransfers: "",
  erasureDeadlines: "",
  tomMeasures: [],
};

type Props =
  | { mode: "create"; controllerId: string }
  | { mode: "edit"; initial: ProcessingActivity };

function fieldLabel() {
  return "block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1";
}

function textareaProps() {
  return "w-full min-h-[88px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";
}

export function ActivityForm(props: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(() =>
    props.mode === "edit"
      ? {
          processingPurposes: props.initial.processingPurposes,
          dataSubjectCategories: props.initial.dataSubjectCategories,
          personalDataCategories: props.initial.personalDataCategories,
          recipientCategories: props.initial.recipientCategories,
          thirdCountryTransfers: props.initial.thirdCountryTransfers,
          erasureDeadlines: props.initial.erasureDeadlines,
          tomMeasures: [...props.initial.tomMeasures],
        }
      : { ...defaultEmpty },
  );

  const backHref =
    props.mode === "edit"
      ? `/verantwortliche/${props.initial.controllerId}`
      : `/verantwortliche/${props.controllerId}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (props.mode === "create") {
        const res = await fetch("/api/processing-activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            controllerId: props.controllerId,
            ...form,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        router.push(backHref);
        router.refresh();
        return;
      }
      const res = await fetch(`/api/processing-activities/${props.initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (props.mode !== "edit") return;
    if (
      !window.confirm(
        "Diese Verarbeitungstätigkeit unwiderruflich löschen?",
      )
    ) {
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/processing-activities/${props.initial.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Löschen fehlgeschlagen");
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTomMeasure(id: TomMeasureId) {
    setForm((f) => {
      const has = f.tomMeasures.includes(id);
      const tomMeasures = has
        ? f.tomMeasures.filter((x) => x !== id)
        : [...f.tomMeasures, id].sort((a, b) => a.localeCompare(b, "de"));
      return { ...f, tomMeasures };
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
          role="alert"
        >
          {error}
        </p>
      )}

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Angaben zu lit. a (Verantwortliche) bearbeiten Sie auf der Seite des
        jeweiligen Verantwortlichen.
      </p>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          lit. b — Zwecke der Verarbeitung
        </h2>
        <div className="mt-3">
          <label className={fieldLabel()} htmlFor="processingPurposes">
            Zwecke <span className="text-red-600">*</span>
          </label>
          <textarea
            id="processingPurposes"
            required
            className={textareaProps()}
            value={form.processingPurposes}
            onChange={(e) => set("processingPurposes", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          lit. c — Kategorien betroffener Personen und Daten
        </h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className={fieldLabel()} htmlFor="dataSubjectCategories">
              Kategorien betroffener Personen{" "}
              <span className="text-red-600">*</span>
            </label>
            <textarea
              id="dataSubjectCategories"
              required
              className={textareaProps()}
              value={form.dataSubjectCategories}
              onChange={(e) => set("dataSubjectCategories", e.target.value)}
            />
          </div>
          <div>
            <label className={fieldLabel()} htmlFor="personalDataCategories">
              Kategorien personenbezogener Daten{" "}
              <span className="text-red-600">*</span>
            </label>
            <textarea
              id="personalDataCategories"
              required
              className={textareaProps()}
              value={form.personalDataCategories}
              onChange={(e) => set("personalDataCategories", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          lit. d — Empfänger
        </h2>
        <div className="mt-3">
          <label className={fieldLabel()} htmlFor="recipientCategories">
            Kategorien von Empfängern (inkl. Drittland/IO, soweit zutreffend){" "}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            id="recipientCategories"
            required
            className={textareaProps()}
            value={form.recipientCategories}
            onChange={(e) => set("recipientCategories", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          lit. e — Drittlandübermittlungen
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Gegebenenfalls Übermittlungen, Zielstaat/Organisation; bei relevanten
          Fällen dokumentierte Garantien (vgl. Art. 49 Abs. 1 Unterabs. 2).
        </p>
        <div className="mt-3">
          <label className={fieldLabel()} htmlFor="thirdCountryTransfers">
            Angaben (optional, falls zutreffend)
          </label>
          <textarea
            id="thirdCountryTransfers"
            className={textareaProps()}
            value={form.thirdCountryTransfers}
            onChange={(e) => set("thirdCountryTransfers", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          lit. f — Löschfristen
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Wenn möglich: vorgesehene Fristen für die Löschung der
          Datenkategorien.
        </p>
        <div className="mt-3">
          <label className={fieldLabel()} htmlFor="erasureDeadlines">
            Löschfristen (optional)
          </label>
          <textarea
            id="erasureDeadlines"
            className={textareaProps()}
            value={form.erasureDeadlines}
            onChange={(e) => set("erasureDeadlines", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          lit. g — Technische und organisatorische Maßnahmen
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Wenn möglich: zutreffende Maßnahmen gemäß Art. 32 Abs. 1 auswählen
          (optional).
        </p>
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">TOM-Auswahl</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {TOM_MEASURE_OPTIONS.map((label) => {
              const id = `tom-${label.replace(/\s+/g, "-")}`;
              const checked = form.tomMeasures.includes(label);
              return (
                <label
                  key={label}
                  htmlFor={id}
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900/50"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTomMeasure(label)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-500 dark:bg-zinc-900"
                  />
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {saving ? "Speichern…" : "Speichern"}
        </button>
        <Link
          href={backHref}
          className="text-sm font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Abbrechen
        </Link>
        {props.mode === "edit" && (
          <button
            type="button"
            disabled={saving}
            onClick={handleDelete}
            className="ml-auto text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            Tätigkeit löschen
          </button>
        )}
      </div>
    </form>
  );
}
