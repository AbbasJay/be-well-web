import Link from "next/link";
import { useAuth } from "../app/contexts/AuthContext";
import { 
  Home, 
  Store,
  Info,
  Phone
} from "lucide-react";

interface SideNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ isOpen }) => {
  const { isLoggedIn } = useAuth();

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Businesses", href: "/businesses", icon: Store },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  if (!isLoggedIn) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 z-30 ${
        isOpen ? "w-64" : "w-0"
      } overflow-hidden`}
      style={{ marginTop: "76px" }}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 py-4">
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
      </div>
    </nav>
  );
};

export default SideNav;
