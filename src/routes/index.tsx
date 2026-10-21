import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
const PANTRY = ["rice", "potato", "garlic", "spinach", "egg", "chicken", "lentils", "bell pepper", "mushroom", "cheese", "chickpeas", "coconut milk", "pasta", "corn", "yogurt", "lemon", "ginger", "noodles"];
const LOADING = ["Raiding the pantry…", "Heating the pan…", "Tasting for salt…", "Plating it up…"];

type Saved = { text: string; cuisine: string; diet: string };

const pick = <T,>(arr: T[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

function Index() {
  const gen = useServerFn(generateRecipe);
  const [items, setItems] = useState<string[]>(["tomato", "onion", "paneer"]);
  const [draft, setDraft] = useState("");
  const [cuisine, setCuisine] = useState("Indian");
  const [diet, setDiet] = useState("Veg");
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [recipe, setRecipe] = useState<Saved | null>(null);
  const [history, setHistory] = useState<Saved[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setTick((t) => t + 1), 1100);
    return () => clearInterval(id);
  }, [loading]);

  const addMany = (parts: string[]) =>
    setItems((p) => Array.from(new Set([...p, ...parts])).slice(0, 20));

  const add = () => {
    const parts = draft.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (parts.length) addMany(parts);
    setDraft("");
  };

  const run = async (ing: string[], c: string, d: string) => {
    if (!ing.length) return setError("Add at least one ingredient.");
    setLoading(true);
    setTick(0);
    setError(null);
    try {
      const r = await gen({ data: { ingredients: ing, cuisine: c, diet: d } });
      if (r.ok) {
        const s = { text: r.text, cuisine: c, diet: d };
        setRecipe(s);
        setHistory((h) => [s, ...h].slice(0, 5));
      } else setError(r.error);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const surprise = () => {
    const ing = pick(PANTRY, 3);
    const c = pick(CUISINES.slice(1), 1)[0] ?? "Any";
    setItems(ing);
    setCuisine(c);
    run(ing, c, diet);
  };

  const copy = async () => {
    if (!recipe) return;
    await navigator.clipboard.writeText(recipe.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = (recipe?.text ?? "").split("\n");
  const title = (lines[0] ?? "").replace(/[#*]/g, "").trim();
  const body = lines.slice(1).join("\n").replace(/\*\*/g, "").replace(/^#+\s*/gm, "").trim();
  const suggestions = PANTRY.filter((p) => !items.includes(p)).slice(0, 8);

  return (
    <main className="min-h-screen px-5 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Pantry Chef</p>
            <h1 className="font-display text-5xl md:text-7xl leading-[0.95] mt-3">
              Cook with what<br />you <em className="text-primary">already have.</em>
            </h1>
          </div>
          <button className="btn-surprise" onClick={surprise} disabled={loading}>
            🎲 Surprise me
          </button>
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
              <p className="mt-4 text-xs text-muted-foreground">Quick add</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button key={s} className="chip-ghost" onClick={() => addMany([s])}>+ {s}</button>
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

            <button className="btn-primary w-full" onClick={() => run(items, cuisine, diet)} disabled={loading}>
              {loading ? LOADING[tick % LOADING.length] : "Generate recipe"}
            </button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </section>

          <section className="recipe-card">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <span className="text-6xl animate-bounce">🍳</span>
                <p className="mt-5 font-display text-2xl">{LOADING[tick % LOADING.length]}</p>
              </div>
            ) : recipe ? (
              <article key={recipe.text} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">{recipe.cuisine} · {recipe.diet}</p>
                  <div className="flex gap-2">
                    <button className="btn-ghost py-1.5" onClick={copy}>{copied ? "Copied!" : "Copy"}</button>
                    <button className="btn-ghost py-1.5" onClick={() => run(items, cuisine, diet)}>Another one</button>
                  </div>
                </div>
                <h2 className="font-display text-3xl md:text-4xl mt-3 mb-5">{title}</h2>
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">{body}</div>
              </article>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                <span className="text-6xl">🥘</span>
                <p className="mt-4 max-w-xs">Your recipe will appear here. Add ingredients and hit generate — or roll the dice with <strong>Surprise me</strong>.</p>
              </div>
            )}
          </section>
        </div>

        {history.length > 1 && (
          <section className="mt-12">
            <p className="eyebrow mb-4">Recently cooked</p>
            <div className="flex flex-wrap gap-3">
              {history.slice(1).map((h, i) => (
                <button key={i} className="pill text-left" onClick={() => setRecipe(h)}>
                  {(h.text.split("\n")[0] ?? "").replace(/[#*]/g, "").trim()}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
