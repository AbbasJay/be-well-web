import Link from "next/link";

const SideNav = () => {
  return (
    <nav className="w-64 bg-gray-100 h-screen p-4">
      <ul className="space-y-2">
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
    </nav>
  );
};

export default SideNav;
