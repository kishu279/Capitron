import React from "react";

interface SidebarOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: SidebarOption[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  options: SidebarOption[];
  title?: string;
  isActive?: String;
}

export default function Sidebar({
  isOpen,
  onClose,
  options,
  title = "Menu",
  isActive,
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleOptionClick = (option: SidebarOption) => {
    if (option.children && option.children.length > 0) {
      toggleExpanded(option.id);
    } else if (option.onClick) {
      option.onClick();
    } else if (option.href) {
      window.location.href = option.href;
    }
  };

  const renderOption = (option: SidebarOption, depth = 0) => {
    const hasChildren = option.children && option.children.length > 0;
    const isExpanded = expandedItems.has(option.id);
    const isActiveItem = isActive === option.id;
    const paddingClass =
      depth === 0 ? "pl-4" : `pl-${Math.min(12, 4 + depth * 4)}`;

    return (
      <div key={option.id} className="w-full">
        <button
          onClick={() => handleOptionClick(option)}
          className={`
            w-full flex items-center justify-between ${paddingClass} pr-4 py-3
            text-left transition-colors duration-200 border-b border-gray-50
            ${depth > 0 ? "text-sm" : "text-base"}
            ${
              isActiveItem
                ? "bg-blue-50 text-blue-700 border-r-4 border-r-blue-500"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
        >
          <div className="flex items-center space-x-3">
            {option.icon && (
              <span
                className={`flex-shrink-0 w-5 h-5 ${
                  isActiveItem ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {option.icon}
              </span>
            )}
            <span
              className={`font-medium ${isActiveItem ? "font-semibold" : ""}`}
            >
              {option.label}
            </span>
            {option.badge && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  isActiveItem
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {option.badge}
              </span>
            )}
          </div>

          {hasChildren && (
            <svg
              className={`
                w-4 h-4 transition-transform duration-200
                ${isExpanded ? "rotate-90" : ""}
                ${isActiveItem ? "text-blue-500" : "text-gray-400"}
              `}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="bg-gray-25 px-12 ">
            {option.children?.map((child) => renderOption(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <nav className="py-2">
            {options.map((option) => renderOption(option))}
          </nav>
        </div>

        {/* Footer (optional) */}
        {/* <div className="p-4 border-t border-gray-200 ">
          <div className="text-xs text-gray-500 text-center">
            © 2025 Capitron
          </div>
        </div> */}
      </div>
    </>
  );
}
