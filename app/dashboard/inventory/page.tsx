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

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [ready, setReady] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("Coatings");
  const [stock, setStock] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(0);
  const [unitCost, setUnitCost] = useState(0);

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

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Inventory
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Inventory Tracking</h1>
        <p className="mt-2 text-zinc-400">
          Monitor stock levels, reorder alerts, and material value.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Items" value={`${stats.totalItems}`} tone="cyan" />
        <StatCard title="Low Stock Alerts" value={`${stats.lowStock}`} tone="lime" />
        <StatCard title="Units On Hand" value={`${stats.totalUnits}`} />
        <StatCard
          title="Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          tone="cyan"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold text-white">Current Stock</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Update counts as materials are used or restocked.
          </p>

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-zinc-400">
                No inventory items yet. Add your first material on the right.
              </div>
            ) : (
              items.map((item) => {
                const isLow = item.stock <= item.reorderLevel;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          {item.category}
                        </p>
                        <StockBadge isLow={isLow} />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric label="Unit Cost" value={`$${item.unitCost}`} />
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
                          label="Value"
                          value={`$${(item.stock * item.unitCost).toLocaleString()}`}
                          tone="cyan"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-300 hover:bg-red-400/20"
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
          className="rounded-2xl border border-white/10 bg-zinc-900 p-6"
        >
          <h2 className="text-xl font-semibold text-white">Add Inventory Item</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Create a new material and start tracking stock.
          </p>

          <div className="mt-6 space-y-4">
            <Field label="Item Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="Polyaspartic Topcoat"
              />
            </Field>

            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
              >
                <option>Coatings</option>
                <option>Primers</option>
                <option>Topcoats</option>
                <option>Flakes</option>
                <option>Pigments</option>
                <option>Tools</option>
                <option>Supplies</option>
              </select>
            </Field>

            <Field label="Stock">
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </Field>

            <Field label="Reorder Level">
              <input
                type="number"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </Field>

            <Field label="Unit Cost">
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </Field>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black hover:bg-cyan-300"
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
  tone?: "default" | "cyan" | "lime";
}) {
  const toneClass =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "lime"
      ? "text-lime-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <div className="text-sm text-zinc-400">{title}</div>
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
  tone?: "default" | "cyan";
}) {
  const toneClass = tone === "cyan" ? "text-cyan-300" : "text-white";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className={`mt-2 text-sm font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function EditableMetric({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
      />
    </div>
  );
}

function StockBadge({ isLow }: { isLow: boolean }) {
  return (
    <div
      className={
        isLow
          ? "mt-3 inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs text-red-300"
          : "mt-3 inline-flex rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs text-lime-300"
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