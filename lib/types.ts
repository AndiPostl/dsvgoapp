/** Verantwortliche(r) gemäß Art. 30 Abs. 1 lit. a DSGVO */

export type Controller = {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** lit. a — Hauptkontakt Verantwortliche(r) */
  controllerContact: string;
  /** lit. a — gemeinsam Verantwortliche (optional) */
  jointControllersContact: string;
  /** lit. a — Vertreter (optional) */
  representativeContact: string;
  /** lit. a — Datenschutzbeauftragte(r) (optional) */
  dpoContact: string;
};

export type ControllerInput = Omit<Controller, "id" | "createdAt" | "updatedAt">;

export type ControllerUpdate = Partial<ControllerInput>;

/** Feste Auswahl lit. g — TOM (Art. 32 Abs. 1), mehrfach wählbar */

export const TOM_MEASURE_OPTIONS = [
  "Zugangskontrolle",
  "Datenträgerkontrolle",
  "Speicherkontrolle",
  "Benutzerkontrolle",
  "Zugriffskontrolle",
  "Übertragungskontrolle",
  "Eingabekontrolle",
  "Transportkontrolle",
  "Wiederherstellung",
  "Zuverlässigkeit",
] as const;

export type TomMeasureId = (typeof TOM_MEASURE_OPTIONS)[number];

/** Verarbeitungstätigkeit gemäß Art. 30 Abs. 1 lit. b–g, zugehörig zu genau einem Verantwortlichen */

export type ProcessingActivity = {
  id: string;
  controllerId: string;
  createdAt: string;
  updatedAt: string;
  /** lit. b */
  processingPurposes: string;
  /** lit. c */
  dataSubjectCategories: string;
  /** lit. c */
  personalDataCategories: string;
  /** lit. d */
  recipientCategories: string;
  /** lit. e */
  thirdCountryTransfers: string;
  /** lit. f */
  erasureDeadlines: string;
  /** lit. g — ausgewählte TOM (optional, wenn möglich) */
  tomMeasures: TomMeasureId[];
};

export type ProcessingActivityInput = Omit<
  ProcessingActivity,
  "id" | "createdAt" | "updatedAt"
>;

export type ProcessingActivityUpdate = Partial<
  Omit<ProcessingActivityInput, "controllerId">
>;
