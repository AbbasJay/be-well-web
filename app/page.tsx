import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";

interface User {
  name: string;
  email: string;
}

export default async function Home() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  let user: User | null = null;
  if (token) {
    user = await getUserFromToken(token);
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </main>
  );
}
