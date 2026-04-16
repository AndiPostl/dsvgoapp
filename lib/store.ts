import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import {
  TOM_MEASURE_OPTIONS,
  type Controller,
  type ControllerInput,
  type ControllerUpdate,
  type ProcessingActivity,
  type ProcessingActivityInput,
  type ProcessingActivityUpdate,
  type TomMeasureId,
} from "./types";

const TOM_MEASURE_SET = new Set<string>(TOM_MEASURE_OPTIONS);

export function normalizeTomMeasures(raw: unknown): TomMeasureId[] {
  if (!Array.isArray(raw)) return [];
  const out: TomMeasureId[] = [];
  for (const x of raw) {
    if (typeof x === "string" && TOM_MEASURE_SET.has(x)) {
      out.push(x as TomMeasureId);
    }
  }
  return [...new Set(out)].sort((a, b) => a.localeCompare(b, "de"));
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "verzeichnis.json");
const LEGACY_ACTIVITIES_FILE = path.join(DATA_DIR, "processing-activities.json");

export type DataStore = {
  controllers: Controller[];
  activities: ProcessingActivity[];
};

function isController(x: unknown): x is Controller {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.createdAt === "string" &&
    typeof o.updatedAt === "string" &&
    typeof o.controllerContact === "string" &&
    typeof o.jointControllersContact === "string" &&
    typeof o.representativeContact === "string" &&
    typeof o.dpoContact === "string"
  );
}

function parseActivity(a: unknown): ProcessingActivity | null {
  if (typeof a !== "object" || a === null) return null;
  const o = a as Record<string, unknown>;
  const strings: (keyof Pick<
    ProcessingActivity,
    | "processingPurposes"
    | "dataSubjectCategories"
    | "personalDataCategories"
    | "recipientCategories"
    | "thirdCountryTransfers"
    | "erasureDeadlines"
  >)[] = [
    "processingPurposes",
    "dataSubjectCategories",
    "personalDataCategories",
    "recipientCategories",
    "thirdCountryTransfers",
    "erasureDeadlines",
  ];
  for (const k of strings) {
    if (typeof o[k] !== "string") return null;
  }
  if (
    typeof o.id !== "string" ||
    typeof o.controllerId !== "string" ||
    typeof o.createdAt !== "string" ||
    typeof o.updatedAt !== "string"
  ) {
    return null;
  }
  let tomMeasures: TomMeasureId[];
  if (Array.isArray(o.tomMeasures)) {
    tomMeasures = normalizeTomMeasures(o.tomMeasures);
  } else if (typeof o.tomDescription === "string") {
    tomMeasures = [];
  } else {
    tomMeasures = [];
  }
  return {
    id: o.id as string,
    controllerId: o.controllerId as string,
    createdAt: o.createdAt as string,
    updatedAt: o.updatedAt as string,
    processingPurposes: o.processingPurposes as string,
    dataSubjectCategories: o.dataSubjectCategories as string,
    personalDataCategories: o.personalDataCategories as string,
    recipientCategories: o.recipientCategories as string,
    thirdCountryTransfers: o.thirdCountryTransfers as string,
    erasureDeadlines: o.erasureDeadlines as string,
    tomMeasures,
  };
}

function activitiesNeedTomJsonMigration(activities: unknown[]): boolean {
  return activities.some((a) => {
    if (typeof a !== "object" || a === null) return false;
    return "tomDescription" in (a as Record<string, unknown>);
  });
}

/** Altes Format: flaches Array ohne controllerId (vor 1:n-Umstellung) */
function isLegacyFlatActivity(x: unknown): x is LegacyFlatActivity {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.controllerContact === "string" &&
    typeof o.processingPurposes === "string" &&
    o.controllerId === undefined
  );
}

type LegacyFlatActivity = {
  id: string;
  createdAt: string;
  updatedAt: string;
  controllerContact: string;
  jointControllersContact: string;
  representativeContact: string;
  dpoContact: string;
  processingPurposes: string;
  dataSubjectCategories: string;
  personalDataCategories: string;
  recipientCategories: string;
  thirdCountryTransfers: string;
  erasureDeadlines: string;
  tomDescription?: string;
};

function migrateLegacyArray(rows: unknown[]): DataStore {
  const controllers: Controller[] = [];
  const activities: ProcessingActivity[] = [];
  for (const row of rows) {
    if (!isLegacyFlatActivity(row)) continue;
    const cid = crypto.randomUUID();
    const t = row.updatedAt || row.createdAt;
    controllers.push({
      id: cid,
      createdAt: row.createdAt,
      updatedAt: t,
      controllerContact: row.controllerContact,
      jointControllersContact: row.jointControllersContact,
      representativeContact: row.representativeContact,
      dpoContact: row.dpoContact,
    });
    activities.push({
      id: row.id,
      controllerId: cid,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      processingPurposes: row.processingPurposes,
      dataSubjectCategories: row.dataSubjectCategories,
      personalDataCategories: row.personalDataCategories,
      recipientCategories: row.recipientCategories,
      thirdCountryTransfers: row.thirdCountryTransfers,
      erasureDeadlines: row.erasureDeadlines,
      tomMeasures: normalizeTomMeasures([]),
    });
  }
  return { controllers, activities };
}

function parseDataStore(parsed: unknown): DataStore | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const o = parsed as Record<string, unknown>;
  if (!Array.isArray(o.controllers) || !Array.isArray(o.activities)) {
    return null;
  }
  const controllers: Controller[] = [];
  const activities: ProcessingActivity[] = [];
  for (const c of o.controllers) {
    if (isController(c)) controllers.push(c);
  }
  for (const a of o.activities) {
    const p = parseActivity(a);
    if (p) activities.push(p);
  }
  return { controllers, activities };
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readRawFile(): Promise<
  { raw: string; sourcePath: string } | undefined
> {
  try {
    return { raw: await readFile(DATA_FILE, "utf8"), sourcePath: DATA_FILE };
  } catch {
    try {
      return {
        raw: await readFile(LEGACY_ACTIVITIES_FILE, "utf8"),
        sourcePath: LEGACY_ACTIVITIES_FILE,
      };
    } catch {
      return undefined;
    }
  }
}

export async function readDatastore(): Promise<DataStore> {
  await ensureDataDir();

  const file = await readRawFile();

  if (file === undefined) {
    const empty: DataStore = { controllers: [], activities: [] };
    await writeDatastore(empty);
    return empty;
  }

  const { raw, sourcePath } = file;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Ungültige JSON-Datei (data/verzeichnis.json)");
  }

  if (Array.isArray(parsed)) {
    const migrated = migrateLegacyArray(parsed);
    await writeDatastore(migrated);
    if (sourcePath === LEGACY_ACTIVITIES_FILE) {
      try {
        await rename(LEGACY_ACTIVITIES_FILE, `${LEGACY_ACTIVITIES_FILE}.migrated`);
      } catch {
        /* optional */
      }
    }
    return migrated;
  }

  const store = parseDataStore(parsed);
  if (store) {
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      const rec = parsed as Record<string, unknown>;
      if (
        Array.isArray(rec.activities) &&
        activitiesNeedTomJsonMigration(rec.activities)
      ) {
        await writeDatastore(store);
      }
    }
    return store;
  }

  throw new Error(
    "Unerwartetes Format: data/verzeichnis.json (controllers/activities erwartet)",
  );
}

export async function writeDatastore(data: DataStore): Promise<void> {
  await ensureDataDir();
  await writeFile(
    DATA_FILE,
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8",
  );
}

export async function listControllers(): Promise<Controller[]> {
  const { controllers } = await readDatastore();
  return [...controllers].sort((a, b) =>
    a.controllerContact.localeCompare(b.controllerContact, "de"),
  );
}

export type ControllerSummary = {
  controller: Controller;
  activityCount: number;
};

export async function listControllerSummaries(): Promise<ControllerSummary[]> {
  const data = await readDatastore();
  const counts = new Map<string, number>();
  for (const a of data.activities) {
    counts.set(a.controllerId, (counts.get(a.controllerId) ?? 0) + 1);
  }
  return [...data.controllers]
    .sort((a, b) =>
      a.controllerContact.localeCompare(b.controllerContact, "de"),
    )
    .map((c) => ({
      controller: c,
      activityCount: counts.get(c.id) ?? 0,
    }));
}

export async function getController(id: string): Promise<Controller | undefined> {
  const { controllers } = await readDatastore();
  return controllers.find((c) => c.id === id);
}

const REQUIRED_CONTROLLER: (keyof ControllerInput)[] = ["controllerContact"];

function validateControllerInput(
  input: ControllerInput | ControllerUpdate,
  partial: boolean,
): string | null {
  const keys: (keyof ControllerInput)[] = [
    "controllerContact",
    "jointControllersContact",
    "representativeContact",
    "dpoContact",
  ];
  for (const k of keys) {
    if (partial && input[k] === undefined) continue;
    const v = input[k];
    if (typeof v !== "string") return `${String(k)} muss ein Text sein`;
    if (!partial && REQUIRED_CONTROLLER.includes(k as keyof ControllerInput) && v.trim() === "") {
      return `Pflichtfeld: ${String(k)}`;
    }
  }
  return null;
}

export function validateControllerCreate(
  input: unknown,
): ControllerInput | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  const base: ControllerInput = {
    controllerContact: String(o.controllerContact ?? ""),
    jointControllersContact: String(o.jointControllersContact ?? ""),
    representativeContact: String(o.representativeContact ?? ""),
    dpoContact: String(o.dpoContact ?? ""),
  };
  if (validateControllerInput(base, false)) return null;
  return base;
}

export function validateControllerUpdate(
  input: unknown,
): ControllerUpdate | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  const patch: ControllerUpdate = {};
  const keys: (keyof ControllerInput)[] = [
    "controllerContact",
    "jointControllersContact",
    "representativeContact",
    "dpoContact",
  ];
  for (const k of keys) {
    if (k in o) patch[k] = String(o[k] ?? "");
  }
  if (Object.keys(patch).length === 0) return null;
  return patch;
}

export async function createController(
  input: ControllerInput,
): Promise<Controller> {
  const err = validateControllerInput(input, false);
  if (err) throw new Error(err);
  const now = new Date().toISOString();
  const c: Controller = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  const data = await readDatastore();
  data.controllers.push(c);
  await writeDatastore(data);
  return c;
}

export async function updateController(
  id: string,
  patch: ControllerUpdate,
): Promise<Controller | undefined> {
  const data = await readDatastore();
  const idx = data.controllers.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  const merged: ControllerInput = {
    controllerContact: data.controllers[idx].controllerContact,
    jointControllersContact: data.controllers[idx].jointControllersContact,
    representativeContact: data.controllers[idx].representativeContact,
    dpoContact: data.controllers[idx].dpoContact,
    ...patch,
  };
  const verr = validateControllerInput(merged, false);
  if (verr) throw new Error(verr);
  const updated: Controller = {
    ...merged,
    id: data.controllers[idx].id,
    createdAt: data.controllers[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  data.controllers[idx] = updated;
  await writeDatastore(data);
  return updated;
}

export async function deleteController(id: string): Promise<boolean> {
  const data = await readDatastore();
  const before = data.controllers.length;
  data.controllers = data.controllers.filter((c) => c.id !== id);
  if (data.controllers.length === before) return false;
  data.activities = data.activities.filter((a) => a.controllerId !== id);
  await writeDatastore(data);
  return true;
}

const REQUIRED_ACTIVITY: (keyof Omit<
  ProcessingActivityInput,
  "controllerId"
>)[] = [
  "processingPurposes",
  "dataSubjectCategories",
  "personalDataCategories",
  "recipientCategories",
];

type ActivityStringKey = keyof Omit<
  ProcessingActivityInput,
  "controllerId" | "tomMeasures"
>;

function validateActivityFields(
  input: Omit<ProcessingActivityInput, "controllerId"> | ProcessingActivityUpdate,
  partial: boolean,
): string | null {
  const stringKeys: ActivityStringKey[] = [
    "processingPurposes",
    "dataSubjectCategories",
    "personalDataCategories",
    "recipientCategories",
    "thirdCountryTransfers",
    "erasureDeadlines",
  ];
  for (const k of stringKeys) {
    if (partial && input[k] === undefined) continue;
    const v = input[k];
    if (typeof v !== "string") return `${String(k)} muss ein Text sein`;
    if (
      !partial &&
      REQUIRED_ACTIVITY.includes(k) &&
      (v as string).trim() === ""
    ) {
      return `Pflichtfeld: ${String(k)}`;
    }
  }
  if (!partial) {
    if (!Array.isArray(input.tomMeasures)) {
      return "tomMeasures muss ein Array sein";
    }
  } else if (
    input.tomMeasures !== undefined &&
    !Array.isArray(input.tomMeasures)
  ) {
    return "tomMeasures muss ein Array sein";
  }
  return null;
}

export function validateActivityCreate(
  input: unknown,
): ProcessingActivityInput | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  const controllerId = o.controllerId;
  if (typeof controllerId !== "string" || controllerId.trim() === "") {
    return null;
  }
  const rest: Omit<ProcessingActivityInput, "controllerId"> = {
    processingPurposes: String(o.processingPurposes ?? ""),
    dataSubjectCategories: String(o.dataSubjectCategories ?? ""),
    personalDataCategories: String(o.personalDataCategories ?? ""),
    recipientCategories: String(o.recipientCategories ?? ""),
    thirdCountryTransfers: String(o.thirdCountryTransfers ?? ""),
    erasureDeadlines: String(o.erasureDeadlines ?? ""),
    tomMeasures: normalizeTomMeasures(o.tomMeasures),
  };
  if (validateActivityFields(rest, false)) return null;
  return { controllerId, ...rest };
}

export function validateActivityUpdate(
  input: unknown,
): ProcessingActivityUpdate | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  const patch: ProcessingActivityUpdate = {};
  const stringKeys: ActivityStringKey[] = [
    "processingPurposes",
    "dataSubjectCategories",
    "personalDataCategories",
    "recipientCategories",
    "thirdCountryTransfers",
    "erasureDeadlines",
  ];
  for (const k of stringKeys) {
    if (k in o) patch[k] = String(o[k] ?? "");
  }
  if ("tomMeasures" in o) {
    patch.tomMeasures = normalizeTomMeasures(o.tomMeasures);
  }
  if (Object.keys(patch).length === 0) return null;
  return patch;
}

export async function listActivities(
  controllerId?: string,
): Promise<ProcessingActivity[]> {
  const { activities } = await readDatastore();
  const list = controllerId
    ? activities.filter((a) => a.controllerId === controllerId)
    : activities;
  return [...list].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getActivity(
  id: string,
): Promise<ProcessingActivity | undefined> {
  const { activities } = await readDatastore();
  return activities.find((a) => a.id === id);
}

export async function createActivity(
  input: ProcessingActivityInput,
): Promise<ProcessingActivity> {
  const data = await readDatastore();
  const ctrl = data.controllers.find((c) => c.id === input.controllerId);
  if (!ctrl) throw new Error("Unbekannter Verantwortlicher (controllerId)");

  const err = validateActivityFields(input, false);
  if (err) throw new Error(err);

  const now = new Date().toISOString();
  const activity: ProcessingActivity = {
    id: crypto.randomUUID(),
    controllerId: input.controllerId,
    createdAt: now,
    updatedAt: now,
    processingPurposes: input.processingPurposes,
    dataSubjectCategories: input.dataSubjectCategories,
    personalDataCategories: input.personalDataCategories,
    recipientCategories: input.recipientCategories,
    thirdCountryTransfers: input.thirdCountryTransfers,
    erasureDeadlines: input.erasureDeadlines,
    tomMeasures: normalizeTomMeasures(input.tomMeasures),
  };
  data.activities.push(activity);
  await writeDatastore(data);
  return activity;
}

export async function updateActivity(
  id: string,
  patch: ProcessingActivityUpdate,
): Promise<ProcessingActivity | undefined> {
  const data = await readDatastore();
  const idx = data.activities.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;

  const cur = data.activities[idx];
  const merged: Omit<ProcessingActivityInput, "controllerId"> = {
    processingPurposes: cur.processingPurposes,
    dataSubjectCategories: cur.dataSubjectCategories,
    personalDataCategories: cur.personalDataCategories,
    recipientCategories: cur.recipientCategories,
    thirdCountryTransfers: cur.thirdCountryTransfers,
    erasureDeadlines: cur.erasureDeadlines,
    tomMeasures: cur.tomMeasures,
    ...patch,
  };
  merged.tomMeasures = normalizeTomMeasures(merged.tomMeasures);
  const verr = validateActivityFields(merged, false);
  if (verr) throw new Error(verr);

  const updated: ProcessingActivity = {
    ...merged,
    id: cur.id,
    controllerId: cur.controllerId,
    createdAt: cur.createdAt,
    updatedAt: new Date().toISOString(),
  };
  data.activities[idx] = updated;
  await writeDatastore(data);
  return updated;
}

export async function deleteActivity(id: string): Promise<boolean> {
  const data = await readDatastore();
  const next = data.activities.filter((a) => a.id !== id);
  if (next.length === data.activities.length) return false;
  data.activities = next;
  await writeDatastore(data);
  return true;
}
