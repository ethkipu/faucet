import { redirect } from "next/navigation";

export default function NotFound() {
  // Redirigir inmediatamente a /scroll-sepolia
  redirect("/");

  return null;
}
