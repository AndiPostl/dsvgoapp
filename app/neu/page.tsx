import { redirect } from "next/navigation";

/** Frühere Route — Verarbeitungstätigkeiten hängen an einem Verantwortlichen */
export default function LegacyNeuRedirect() {
  redirect("/");
}
