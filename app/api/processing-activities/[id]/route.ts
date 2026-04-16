import { NextResponse } from "next/server";
import {
  deleteActivity,
  getActivity,
  updateActivity,
  validateActivityUpdate,
} from "@/lib/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json(activity);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const body: unknown = await request.json();
    const patch = validateActivityUpdate(body);
    if (!patch) {
      return NextResponse.json(
        { error: "Keine gültigen Felder zum Aktualisieren." },
        { status: 400 },
      );
    }
    const updated = await updateActivity(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const ok = await deleteActivity(id);
  if (!ok) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
