"use client";

import type { Controller } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const empty: Omit<Controller, "id" | "createdAt" | "updatedAt"> = {
  controllerContact: "",
  jointControllersContact: "",
  representativeContact: "",
  dpoContact: "",
};

function fieldLabel() {
  return "block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1";
}

function textareaProps() {
  return "w-full min-h-[88px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";
}

type Props =
  | { mode: "create" }
  | { mode: "edit"; initial: Controller };

export function ControllerForm(props: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(
    () =>
      props.mode === "edit"
        ? {
            controllerContact: props.initial.controllerContact,
            jointControllersContact: props.initial.jointControllersContact,
            representativeContact: props.initial.representativeContact,
            dpoContact: props.initial.dpoContact,
          }
        : { ...empty },
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (props.mode === "create") {
        const res = await fetch("/api/controllers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = (await res.json()) as { id?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        router.push(`/verantwortliche/${data.id}`);
        router.refresh();
        return;
      }
      const res = await fetch(`/api/controllers/${props.initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
      router.push(`/verantwortliche/${props.initial.id}`);
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
        "Diesen Verantwortlichen und alle zugehörigen Verarbeitungstätigkeiten unwiderruflich löschen?",
      )
    ) {
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/controllers/${props.initial.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Löschen fehlgeschlagen");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const cancelHref =
    props.mode === "edit" ? `/verantwortliche/${props.initial.id}` : "/";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
          role="alert"
        >
          {error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Art. 30 Abs. 1 lit. a — Verantwortliche und Kontakte
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pro Verantwortliche(r) ein Datensatz; mehrere Verarbeitungstätigkeiten
          ordnen Sie darunter an.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className={fieldLabel()} htmlFor="controllerContact">
              Verantwortliche(r) <span className="text-red-600">*</span>
            </label>
            <textarea
              id="controllerContact"
              required
              className={textareaProps()}
              value={form.controllerContact}
              onChange={(e) => set("controllerContact", e.target.value)}
            />
          </div>
          <div>
            <label className={fieldLabel()} htmlFor="jointControllersContact">
              Gemeinsam Verantwortliche (optional)
            </label>
            <textarea
              id="jointControllersContact"
              className={textareaProps()}
              value={form.jointControllersContact}
              onChange={(e) => set("jointControllersContact", e.target.value)}
            />
          </div>
          <div>
            <label className={fieldLabel()} htmlFor="representativeContact">
              Vertreter (optional)
            </label>
            <textarea
              id="representativeContact"
              className={textareaProps()}
              value={form.representativeContact}
              onChange={(e) => set("representativeContact", e.target.value)}
            />
          </div>
          <div>
            <label className={fieldLabel()} htmlFor="dpoContact">
              Datenschutzbeauftragte(r) (optional)
            </label>
            <textarea
              id="dpoContact"
              className={textareaProps()}
              value={form.dpoContact}
              onChange={(e) => set("dpoContact", e.target.value)}
            />
          </div>
        </div>
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
          href={cancelHref}
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
            Verantwortlichen löschen
          </button>
        )}
      </div>
    </form>
  );
}
