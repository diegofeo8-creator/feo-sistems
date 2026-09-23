"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/buscar?q=${encodeURIComponent(value.trim())}`);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        aria-label="Buscar casos"
        onClick={() => setOpen(true)}
        className="text-paper/80 hover:text-accent"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} role="search" aria-label="Buscar en los Servicios de casos" className="flex items-center gap-2">
      <label htmlFor="search-input" className="sr-only">
        Buscar casos
      </label>
      <input
        id="search-input"
        autoFocus
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => !value && setOpen(false)}
        placeholder="Buscar casos..."
        className="bg-surface border border-border rounded-sm px-3 py-1.5 text-sm text-paper w-40 md:w-56 focus:outline-none focus:border-accent"
      />
    </form>
  );
}
