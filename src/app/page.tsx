import { redirect } from "next/navigation";

export default function Home() {
  // The app opens on industry selection: a DPR starts with what the business is.
  redirect("/project-creation");
}
