import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Welcome to BeWell</h1>
      <div className="space-y-2">
        <p>Welcome back, {session.user?.name}!</p>
        <p className="text-gray-600">
          Manage your wellness businesses and classes all in one place.
        </p>
      </div>
    </main>
  );
}
