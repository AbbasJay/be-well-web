import { useSession } from "next-auth/react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-40 flex items-center p-4">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">BeWell</h1>
      </div>
    </header>
  );
};

export default Header;
