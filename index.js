import { askAI } from "./ai";

let unregister = null;

const plugin = {
  onLoad: () => {
    try {
      const vendetta = window.vendetta || globalThis.vendetta;
      if (!vendetta || !vendetta.commands) return;

      unregister = vendetta.commands.registerCommand({
        name: "ai",
        displayName: "ai",
        description: "Run AI prompt, summary, or translation",
        displayDescription: "Run AI prompt, summary, or translation",
        options: [
          { name: "text", description: "Text or prompt", type: 3, required: true },
          { name: "action", description: "Mode (ask, summarize, translate)", type: 3, required: false, choices: [ { name: "Ask", value: "ask" }, { name: "Summarize", value: "summarize" }, { name: "Translate", value: "translate" } ] }
        ],
        execute: async (args) => {
          const textArg = args.find((a) => a.name === "text")?.value;
          const actionArg = args.find((a) => a.name === "action")?.value || "ask";
          try {
            const result = await askAI(textArg, actionArg);
            return { content: `**[AI ${actionArg.toUpperCase()}]:**\n${result}` };
          } catch (err) {
            return { content: `❌ Error: ${err.message}` };
          }
        }
      });
    } catch (e) {
      console.error("[AI-Plugin] Registration error:", e);
    }
  },
  onUnload: () => {
    if (typeof unregister === "function") unregister();
  }
};

export default plugin;
