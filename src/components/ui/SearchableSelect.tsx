"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  state?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  error,
  className,
  required,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            onChange(filteredOptions[highlightedIndex].value);
            setIsOpen(false);
            setSearchQuery("");
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery("");
          break;
      }
    },
    [isOpen, filteredOptions, highlightedIndex, onChange]
  );

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlighted = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Find selected label
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative" onKeyDown={handleKeyDown}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            "w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-white rounded-xl px-4 py-3 text-left flex items-center justify-between",
            "transition-all duration-200 ease-out",
            "focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20",
            "hover:border-[var(--text-muted)]",
            error && "border-red-500 hover:border-red-400",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <span className={cn(!selectedLabel && "text-[var(--text-muted)]")}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[var(--text-muted)] transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown */}
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 w-full mt-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden",
            "transition-all duration-200 origin-top",
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          )}
          role="listbox"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-[var(--card-border)] sticky top-0 bg-[var(--card-bg)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--background)] text-white rounded-lg pl-10 pr-4 py-2.5 text-sm border border-[var(--input-border)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                aria-label="Search options"
              />
            </div>
          </div>

          {/* Options List */}
          <ul className="max-h-60 overflow-y-auto py-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  data-index={index}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  role="option"
                  aria-selected={value === option.value}
                  className={cn(
                    "px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between",
                    "transition-colors duration-150",
                    index === highlightedIndex && "bg-[var(--accent-primary)]/10",
                    value === option.value
                      ? "text-[var(--accent-primary)] font-medium"
                      : "text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/10 hover:text-white"
                  )}
                >
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.state && (
                      <span className="text-xs text-[var(--text-muted)]">
                        {option.state}
                      </span>
                    )}
                  </div>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-[var(--accent-primary)]" />
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-sm text-[var(--text-muted)] text-center">
                No options found
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Error message with animation */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          error ? "max-h-10 opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-sm text-red-500">{error}</p>
      </div>
    </div>
  );
}
