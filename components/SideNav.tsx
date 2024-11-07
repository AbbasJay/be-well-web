import Link from "next/link";
import { useAuth } from "../app/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface SideNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideNav = ({ isOpen }: SideNavProps) => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();

  if (!isLoggedIn) {
    return null;
  }

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
    <>
      <nav
        className={`fixed pt-20 left-0 h-full bg-gray-100 p-4 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "250px" }} // Adjusted top to 84px (20 in Tailwind is 80px, close enough)
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="block hover:bg-gray-200 p-2 rounded">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/businesses"
                  className="block hover:bg-gray-200 p-2 rounded"
                >
                  My Businesses
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block hover:bg-gray-200 p-2 rounded"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block hover:bg-gray-200 p-2 rounded"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SideNav;
