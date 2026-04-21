"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "artipoxi_inventory";

type InventoryCategory =
  | "Coatings"
  | "Primers"
  | "Topcoats"
  | "Flakes"
  | "Pigments"
  | "Tools"
  | "Supplies";

type InventoryItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  stock: number;
  reorderLevel: number;
  unitCost: number;
};

const CATEGORY_OPTIONS: InventoryCategory[] = [
  "Coatings",
  "Primers",
  "Topcoats",
  "Flakes",
  "Pigments",
  "Tools",
  "Supplies",
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [ready, setReady] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("Coatings");
  const [stock, setStock] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(0);
  const [unitCost, setUnitCost] = useState(0);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | InventoryCategory>("All");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        const starterItems: InventoryItem[] = [
          {
            id: "polyaspartic-topcoat",
            name: "Polyaspartic Topcoat",
            category: "Topcoats",
            stock: 12,
            reorderLevel: 4,
            unitCost: 85,
          },
          {
            id: "midnight-flake",
            name: "Midnight Flake Blend",
            category: "Flakes",
            stock: 3,
            reorderLevel: 5,
            unitCost: 42,
          },
          {
            id: "epoxy-primer-kit",
            name: "Epoxy Primer Kit",
            category: "Primers",
            stock: 8,
            reorderLevel: 3,
            unitCost: 68,
          },
        ];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(starterItems));
        setItems(starterItems);
        setReady(true);
        return;
      }

      const parsed = JSON.parse(raw) as InventoryItem[];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const lowStock = items.filter((item) => item.stock <= item.reorderLevel).length;
    const totalUnits = items.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = items.reduce(
      (sum, item) => sum + item.stock * item.unitCost,
      0
    );

    return {
      totalItems,
      lowStock,
      totalUnits,
      totalValue,
    };
  }, [items]);

  const visibleItems = useMemo(() => {
    let next = [...items];

    const term = search.trim().toLowerCase();
    if (term) {
      next = next.filter((item) =>
        [item.name, item.category, item.stock.toString(), item.unitCost.toString()]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    if (categoryFilter !== "All") {
      next = next.filter((item) => item.category === categoryFilter);
    }

    if (lowStockOnly) {
      next = next.filter((item) => item.stock <= item.reorderLevel);
    }

    return next.sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search, categoryFilter, lowStockOnly]);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) return;

    const baseId = slugify(cleanName);
    let finalId = baseId;
    let counter = 2;

    while (items.some((item) => item.id === finalId)) {
      finalId = `${baseId}-${counter}`;
      counter += 1;
    }

    const newItem: InventoryItem = {
      id: finalId,
      name: cleanName,
      category,
      stock,
      reorderLevel,
      unitCost,
    };

    setItems((current) => [newItem, ...current]);

    setName("");
    setCategory("Coatings");
    setStock(0);
    setReorderLevel(0);
    setUnitCost(0);
  }

  function updateStock(id: string, value: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, stock: value } : item
      )
    );
  }

  function updateReorderLevel(id: string, value: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, reorderLevel: value } : item
      )
    );
  }

  function updateUnitCost(id: string, value: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unitCost: value } : item
      )
    );
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur-md md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300 md:text-sm">
          Inventory
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-none text-white md:text-5xl">
          Inventory Tracking
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-300">
          Monitor stock levels, reorder alerts, and material value across your business.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Items" value={`${stats.totalItems}`} tone="cyan" />
        <StatCard title="Low Stock Alerts" value={`${stats.lowStock}`} tone="red" />
        <StatCard title="Units On Hand" value={`${stats.totalUnits}`} />
        <StatCard
          title="Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          tone="cyan"
        />
      </div>

      <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur-md md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <input
            type="text"
            placeholder="Search inventory"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xl rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          />

          <div className="grid gap-3 sm:grid-cols-3 xl:flex xl:flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as "All" | InventoryCategory)
              }
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            >
              <option value="All">All Categories</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setLowStockOnly((prev) => !prev)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                lowStockOnly
                  ? "border-red-400/30 bg-red-400/12 text-red-300"
                  : "border-white/10 bg-black/40 text-zinc-300"
              }`}
            >
              {lowStockOnly ? "Showing Low Stock" : "Low Stock Only"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("All");
                setLowStockOnly(false);
              }}
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-cyan-400/20"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur-md md:p-6">
          <h2 className="text-xl font-semibold text-white md:text-2xl">
            Current Stock
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Update counts as materials are used or restocked.
          </p>

          <div className="mt-6 space-y-4">
            {visibleItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-zinc-400">
                No inventory items match your filters.
              </div>
            ) : (
              visibleItems.map((item) => {
                const isLow = item.stock <= item.reorderLevel;

                return (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-white/10 bg-black/30 p-4 backdrop-blur-sm md:p-5"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-xl font-semibold text-white">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-400">
                            {item.category}
                          </p>
                          <StockBadge isLow={isLow} />
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                            Item Value
                          </div>
                          <div className="mt-2 text-lg font-semibold text-cyan-300">
                            ${(item.stock * item.unitCost).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <EditableMetric
                          label="Unit Cost"
                          value={item.unitCost}
                          prefix="$"
                          onChange={(value) => updateUnitCost(item.id, value)}
                        />
                        <EditableMetric
                          label="Stock"
                          value={item.stock}
                          onChange={(value) => updateStock(item.id, value)}
                        />
                        <EditableMetric
                          label="Reorder At"
                          value={item.reorderLevel}
                          onChange={(value) => updateReorderLevel(item.id, value)}
                        />
                        <Metric
                          label="Status"
                          value={isLow ? "Low Stock" : "Healthy"}
                          tone={isLow ? "red" : "cyan"}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-400/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <form
          onSubmit={handleAddItem}
          className="rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur-md md:p-6"
        >
          <h2 className="text-xl font-semibold text-white md:text-2xl">
            Add Inventory Item
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Create a new material and start tracking stock.
          </p>

          <div className="mt-6 space-y-4">
            <Field label="Item Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="Polyaspartic Topcoat"
              />
            </Field>

            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Stock">
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </Field>

              <Field label="Reorder Level">
                <input
                  type="number"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </Field>

              <Field label="Unit Cost">
                <input
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black transition hover:bg-cyan-300"
          >
            Save Item
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: string;
  tone?: "default" | "cyan" | "red";
}) {
  const toneClass =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "red"
      ? "text-red-300"
      : "text-white";

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/25 p-5 backdrop-blur-md">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
        {title}
      </div>
      <div className={`mt-3 text-3xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "cyan" | "red";
}) {
  const toneClass =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "red"
      ? "text-red-300"
      : "text-white";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </div>
      <div className={`mt-2 text-sm font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function EditableMetric({
  label,
  value,
  onChange,
  prefix = "",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {prefix ? <span className="text-sm text-zinc-400">{prefix}</span> : null}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
        />
      </div>
    </div>
  );
}

function StockBadge({ isLow }: { isLow: boolean }) {
  return (
    <div
      className={
        isLow
          ? "mt-3 inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-medium text-red-300"
          : "mt-3 inline-flex rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300"
      }
    >
      {isLow ? "Low Stock" : "Healthy"}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm text-zinc-400">{label}</div>
      {children}
    </label>
  );
}
