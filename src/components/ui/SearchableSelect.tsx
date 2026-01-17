"use client";

import { useState, useEffect, useRef } from "react";
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
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Find selected label
    const selectedLabel = options.find((opt) => opt.value === value)?.label;

    return (
        <div className="w-full" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-white rounded-lg px-4 py-3 text-left flex items-center justify-between transition-all duration-300",
                        "focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--accent-primary-dim)]",
                        error && "border-red-500",
                        className
                    )}
                >
                    <span className={cn(!selectedLabel && "text-[var(--text-muted)]")}>
                        {selectedLabel || placeholder}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Search Input */}
                        <div className="p-2 border-b border-[var(--card-border)] sticky top-0 bg-[var(--card-bg)]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[var(--background)] text-white rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <li
                                        key={option.value}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearchQuery("");
                                        }}
                                        className={cn(
                                            "px-4 py-2 text-sm cursor-pointer hover:bg-[var(--accent-primary)]/20 hover:text-white transition-colors flex items-center justify-between",
                                            value === option.value
                                                ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium"
                                                : "text-[var(--text-secondary)]"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span>{option.label}</span>
                                            {option.state && (
                                                <span className="text-xs text-[var(--text-muted)]">{option.state}</span>
                                            )}
                                        </div>
                                        {value === option.value && <Check className="w-4 h-4" />}
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-3 text-sm text-[var(--text-muted)] text-center">
                                    No options found
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}
