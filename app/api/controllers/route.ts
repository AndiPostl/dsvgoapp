import { NextResponse } from "next/server";
import {
  createController,
  listControllers,
  validateControllerCreate,
} from "@/lib/store";

export async function GET() {
  try {
    const data = await listControllers();
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = validateControllerCreate(body);
    if (!input) {
      return NextResponse.json(
        { error: "Ungültige oder unvollständige Daten (Pflichtfeld Verantwortliche(r))." },
        { status: 400 },
      );
    }
    const created = await createController(input);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
