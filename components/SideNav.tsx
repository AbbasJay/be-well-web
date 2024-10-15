import Link from "next/link";
import { useAuth } from "../app/contexts/AuthContext";
import { useRouter } from "next/navigation";

const SideNav = () => {
  const { setIsLoggedIn } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
    });

    if (response.ok) {
      setIsLoggedIn(false);
      router.push("/auth");
    }
  };

  return (
    <nav className="w-64 bg-gray-100 h-screen p-4 flex flex-col">
      <ul className="space-y-2 flex-grow">
        <li>
          <Link href="/" className="block hover:bg-gray-200 p-2 rounded">
            Home
          </Link>
        </li>
        <li>
          <Link href="/about" className="block hover:bg-gray-200 p-2 rounded">
            About
          </Link>
        </li>
        <li>
          <Link href="/contact" className="block hover:bg-gray-200 p-2 rounded">
            Contact
          </Link>
        </li>
      </ul>
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white px-4 py-2 rounded mt-auto"
      >
        Logout
      </button>
    </nav>
  );
};

export default SideNav;
