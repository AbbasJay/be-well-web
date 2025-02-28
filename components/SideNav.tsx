import Link from "next/link";
import { Home, Store, Info, Phone, LogOut, Calendar } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface SideNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ isOpen }) => {
  const { data: session } = useSession();

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Businesses", href: "/businesses", icon: Store },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
    { name: "Calendar", href: "/calendar", icon: Calendar },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth" });
  };

  if (!session) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 h-[calc(100vh-72px)] bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
        isOpen ? "w-64" : "w-0"
      } overflow-hidden flex flex-col justify-between`}
      style={{ marginTop: "72px" }}
    >
      <div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Icon className="w-6 h-6 mr-3" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center p-4 text-red-600 hover:bg-gray-100"
      >
        <LogOut className="w-6 h-6 mr-3" />
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default SideNav;
