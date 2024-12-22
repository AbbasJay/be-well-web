import { useAuth } from "../app/contexts/AuthContext";

interface HeaderProps {
  toggleNav: () => void;
  isNavOpen: boolean;
}

const Header = ({ toggleNav }: HeaderProps) => {
  const { isLoggedIn } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-40 flex items-center p-4">
      <div className="flex items-center">
        {isLoggedIn && (
          <button onClick={toggleNav} className="p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-gray-800"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>
        )}
        <h1 className="text-2xl font-bold">BeWell</h1>
      </div>
    </header>
  );
};

export default Header;
