import { NextResponse } from "next/server";
import {
  deleteController,
  getController,
  updateController,
  validateControllerUpdate,
} from "@/lib/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const c = await getController(id);
  if (!c) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json(c);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const body: unknown = await request.json();
    const patch = validateControllerUpdate(body);
    if (!patch) {
      return NextResponse.json(
        { error: "Keine gültigen Felder zum Aktualisieren." },
        { status: 400 },
      );
    }
    const updated = await updateController(id, patch);
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
  const ok = await deleteController(id);
  if (!ok) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
