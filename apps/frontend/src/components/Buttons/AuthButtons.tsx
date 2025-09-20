import React from "react";

export default function AuthButtons() {
  return (
    <div className="flex items-center space-x-4">
      <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200">
        Login
      </button>
    </div>
  );
}
