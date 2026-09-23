"use client";

import { useMemo, useState } from "react";
import CaseCard from "./CaseCard";
import DragScrollRow from "./DragScrollRow";

interface LibraryCase {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categorySlug: string;
  categoryName: string;
  year: number;
  tags: string[];
  coverImage?: string;
}

interface LibraryBrowserProps {
  servicios: LibraryCase[];
  productos: { slug: string; name: string }[];
}

const ALL = "todos";

export default function LibraryBrowser({ servicios, productos }: LibraryBrowserProps) {
  const [category, setCategory] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [tag, setTag] = useState(ALL);

  const years = useMemo(
    () => Array.from(new Set(servicios.map((c) => c.year))).sort((a, b) => b - a),
    [servicios]
  );

  const tags = useMemo(
    () => Array.from(new Set(servicios.flatMap((c) => c.tags))).sort(),
    [servicios]
  );

  const filtered = useMemo(() => {
    return servicios.filter((c) => {
      if (category !== ALL && c.categorySlug !== category) return false;
      if (year !== ALL && String(c.year) !== year) return false;
      if (tag !== ALL && !c.tags.includes(tag)) return false;
      return true;
    });
  }, [servicios, category, year, tag]);

  const filtersActive = category !== ALL || year !== ALL || tag !== ALL;

  function resetFilters() {
    setCategory(ALL);
    setYear(ALL);
    setTag(ALL);
  }

  const groupedByCategory = useMemo(() => {
    return productos
      .map((cat) => ({
        ...cat,
        servicios: filtered.filter((c) => c.categorySlug === cat.slug),
      }))
      .filter((group) => !filtersActive || group.servicios.length > 0);
  }, [productos, filtered, filtersActive]);

  const selectClass =
    "bg-surface border border-border rounded-sm px-3 py-2 text-sm text-paper focus:outline-none focus:border-accent";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClass}
          aria-label="Filtrar por categoría"
        >
          <option value={ALL}>Nuestros servicios</option>
          {productos.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={selectClass}
          aria-label="Filtrar por año"
        >
          <option value={ALL}>Años</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className={selectClass}
          aria-label="Filtrar por etiqueta"
        >
          <option value={ALL}>Etiquetas</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {filtersActive && (
          <button
            onClick={resetFilters}
            className="font-heading text-sm text-accent hover:opacity-80"
          >
            Limpiar filtros (Todos)
          </button>
        )}
      </div>

      {filtersActive ? (
        <div aria-live="polite">
          <p className="text-muted text-sm mb-6">
            {filtered.length} caso{filtered.length === 1 ? "" : "s"} encontrado
            {filtered.length === 1 ? "" : "s"}.
          </p>
          {filtered.length === 0 ? (
            <p className="font-heading text-paper/80 border border-border rounded-sm px-6 py-10 text-center">
              NO ENCONTRAMOS CASOS CON ESTOS FILTROS.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((c, i) => (
                <CaseCard
                  key={c.slug}
                  number={String(i + 1).padStart(2, "0")}
                  title={c.title}
                  category={c.categoryName}
                  excerpt={c.excerpt}
                  slug={c.slug}
                  coverImage={c.coverImage}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        groupedByCategory.map((group) => (
          <section key={group.slug} id={group.slug} className="scroll-mt-28 py-10 border-b border-border">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-heading font-bold text-paper text-2xl">{group.name}</h2>
              <span className="text-muted text-sm">{group.servicios.length} casos</span>
            </div>
            {group.servicios.length === 0 ? (
              <p className="text-muted text-sm">Todavía no hay casos publicados en esta categoría.</p>
            ) : (
              <DragScrollRow>
                {group.servicios.map((c, i) => (
                  <div key={c.slug} className="w-72 shrink-0 h-[22rem]">
                    <CaseCard
                      number={String(i + 1).padStart(2, "0")}
                      title={c.title}
                      category={group.name}
                      excerpt={c.excerpt}
                      slug={c.slug}
                      coverImage={c.coverImage}
                    />
                  </div>
                ))}
              </DragScrollRow>
            )}
          </section>
        ))
      )}
    </div>
  );
}
