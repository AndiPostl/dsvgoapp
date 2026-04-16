import { type NextRequest, NextResponse } from "next/server";
import {
  createActivity,
  listActivities,
  validateActivityCreate,
} from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const controllerId =
      request.nextUrl.searchParams.get("controllerId") ?? undefined;
    const id = controllerId?.trim() || undefined;
    const data = await listActivities(id);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = validateActivityCreate(body);
    if (!input) {
      return NextResponse.json(
        {
          error:
            "Ungültige oder unvollständige Daten (controllerId und Pflichtfelder b–d prüfen).",
        },
        { status: 400 },
      );
    }
    const created = await createActivity(input);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
