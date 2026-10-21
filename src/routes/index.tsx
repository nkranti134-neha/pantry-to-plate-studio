import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateRecipe } from "@/lib/recipe.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pantry Chef — Recipes from what you have" },
      { name: "description", content: "Type your ingredients, pick a cuisine and diet, and get a quick recipe in seconds." },
      { property: "og:title", content: "Pantry Chef — Recipes from what you have" },
      { property: "og:description", content: "Turn your ingredients into a short, tasty recipe instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const CUISINES = ["Any", "Indian", "Italian", "Mexican", "Chinese", "Thai", "Mediterranean"];
const DIETS = [
  { v: "Any", l: "Any" },
  { v: "Veg", l: "Veg" },
  { v: "Non-Veg", l: "Non-veg" },
  { v: "Jain", l: "Jain" },
  { v: "Vegan", l: "Vegan" },
];

function Index() {
  const gen = useServerFn(generateRecipe);
  const [items, setItems] = useState<string[]>(["tomato", "onion", "paneer"]);
  const [draft, setDraft] = useState("");
  const [cuisine, setCuisine] = useState("Indian");
  const [diet, setDiet] = useState("Veg");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) setItems((p) => Array.from(new Set([...p, ...parts])).slice(0, 20));
    setDraft("");
  };

  const submit = async () => {
    if (!items.length) return setError("Add at least one ingredient.");
    setLoading(true);
    setError(null);
    try {
      const r = await gen({ data: { ingredients: items, cuisine, diet } });
      if (r.ok) setRecipe(r.text);
      else setError(r.error);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const [title, ...body] = (recipe ?? "").split("\n");

  return (
    <main className="min-h-screen px-5 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12">
          <p className="eyebrow">Pantry Chef</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] mt-3">
            Cook with what<br />you <em className="text-primary">already have.</em>
          </h1>
        </header>

        <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
          <section className="card-paper space-y-7">
            <div>
              <label className="label">Ingredients</label>
              <div className="flex gap-2">
                <input
                  className="field"
                  placeholder="e.g. rice, garlic"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
                />
                <button className="btn-ghost" onClick={add}>Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((i) => (
                  <button key={i} className="chip" onClick={() => setItems((p) => p.filter((x) => x !== i))} aria-label={`Remove ${i}`}>
                    {i} <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Cuisine</label>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((c) => (
                  <button key={c} className="pill" data-active={cuisine === c} onClick={() => setCuisine(c)}>{c}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Diet</label>
              <div className="flex flex-wrap gap-2">
                {DIETS.map((d) => (
                  <button key={d.v} className="pill" data-active={diet === d.v} onClick={() => setDiet(d.v)}>{d.l}</button>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full" onClick={submit} disabled={loading}>
              {loading ? "Cooking up an idea…" : "Generate recipe"}
            </button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </section>

          <section className="recipe-card">
            {recipe ? (
              <article>
                <p className="eyebrow">{cuisine} · {diet}</p>
                <h2 className="font-display text-3xl md:text-4xl mt-2 mb-5">{(title ?? "").replace(/[#*]/g, "").trim()}</h2>
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                  {body.join("\n").replace(/\*\*/g, "").replace(/^#+\s*/gm, "").trim()}
                </div>
              </article>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                <span className="font-display text-6xl text-primary/40">~</span>
                <p className="mt-4 max-w-xs">Your recipe will appear here. Add ingredients, pick a style, and hit generate.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
