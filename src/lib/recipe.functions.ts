import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  ingredients: z.array(z.string().min(1).max(60)).min(1).max(20),
  cuisine: z.string().min(1).max(40),
  diet: z.string().min(1).max(40),
});

export const generateRecipe = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { generateChatCompletion, GatewayError } = await import("@lovable.dev/ai-gateway");
    const prompt = `Generate a recipe using these ingredients: ${data.ingredients.join(", ")}
The recipe should not be more than 100 words.
Cuisine: ${data.cuisine}
Diet: ${data.diet}
Format: first line is the recipe title only (no symbols), then a short ingredients list, then numbered steps.`;
    try {
      const res = await generateChatCompletion({
        model: "google/gemini-3.8-flash",
        messages: [{ role: "user", content: prompt }],
      });
      const content = res.choices?.[0]?.message?.content;
      const text = typeof content === "string" ? content : "";
      if (!text) return { ok: false as const, error: "No recipe came back. Try again." };
      return { ok: true as const, text };
    } catch (e) {
      if (e instanceof GatewayError) {
        console.error("AI error", e.code, e.ids);
        if (e.httpStatus === 429) return { ok: false as const, error: "Too many requests — wait a moment and try again." };
        if (e.httpStatus === 402) return { ok: false as const, error: "AI credits have run out." };
      } else console.error(e);
      return { ok: false as const, error: "Couldn't create a recipe right now." };
    }
  });
