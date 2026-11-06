import { redirect } from "next/navigation";

// Authentication is intentionally removed - the app opens directly on the
// DPR preparation workflow.
export default function LoginRedirect() {
  redirect("/dashboard");
}
