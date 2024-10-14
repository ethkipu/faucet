import { redirect } from "next/navigation";

export default function NotFound() {
  // Redirigir inmediatamente a /scroll-sepolia
  redirect("/scroll-sepolia");

  return null;
}
