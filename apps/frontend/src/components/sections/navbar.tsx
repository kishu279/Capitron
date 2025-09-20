import React from "react";
import Logo from "./Logo";
import AuthButtons from "../Buttons/AuthButtons";

export default function NavBar() {
  // check for the session
  return (
    <nav className="w-full border-gray-200">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <AuthButtons />
        </div>
      </div>
    </nav>
  );
}
