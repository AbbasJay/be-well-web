import { redirect } from "next/navigation";

export default function Home() {
  // Check if user is logged in (you'll need to implement this logic)
  const isLoggedIn = false; // Replace with actual auth check

  if (!isLoggedIn) {
    redirect("/auth");
  }

  return <main>{/* Your main app content */}</main>;
}
