import React from "react";
import Logo from "./Logo";
import AuthButtons from "../Buttons/AuthButtons";

export default function NavBar() {
  // check for the session
  return (
    <nav className="w-full border-gray-200">
      <div className="md:px-8 px-4 md:py-4 py-2">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <AuthButtons />
        </div>
      </div>
    </nav>
  );
}
