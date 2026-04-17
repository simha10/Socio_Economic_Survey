"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InfiniteScrollSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  maxHeight?: string;
  loading?: boolean; // Add loading prop
}

export default function InfiniteScrollSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  maxHeight = "200px",
  loading = false, // Default to false
}: InfiniteScrollSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleOptions, setVisibleOptions] = useState(20);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Reset visible options when search changes
  useEffect(() => {
    setVisibleOptions(20);
  }, [searchTerm]);

  // Handle scroll to load more options
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more when scrolled to bottom (within 10px)
    if (
      scrollHeight - scrollTop - clientHeight < 10 &&
      visibleOptions < filteredOptions.length
    ) {
      setVisibleOptions((prev) => Math.min(prev + 10, filteredOptions.length));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        {/* Selected value display */}
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-left text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-between",
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? "text-white" : "text-slate-400"}>
            {selectedOption?.label || placeholder}
          </span>
          <svg
            className={cn(
              "w-5 h-5 text-slate-400 transition-transform",
              isOpen && "rotate-180",
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-slate-700">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <div
              className="max-h-60 overflow-y-auto"
              style={{ maxHeight }}
              onScroll={handleScroll}
            >
              {loading ? (
                <div className="px-4 py-3 text-slate-400 text-center flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-cyan-500 rounded-full animate-spin"></div>
                  <span>Loading options...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-slate-400 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.slice(0, visibleOptions).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors",
                      value === option.value
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-white",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {option.label}
                  </button>
                ))
              )}

              {/* Loading indicator */}
              {visibleOptions < filteredOptions.length && (
                <div className="px-4 py-2 text-slate-400 text-center text-sm">
                  Scroll to load more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
