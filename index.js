import { registerCommand } from "@vendetta/commands";
import { showToast } from "@vendetta/ui/toasts";
import { askAI } from "./ai";
import Settings from "./Settings";

let unregisterCommands = [];

export default {
  onLoad: () => {
    const cmd = registerCommand({
      name: "ai",
      displayName: "ai",
      description: "Run AI prompt, summary, or translation",
      displayDescription: "Run AI prompt, summary, or translation",
      options: [
        {
          name: "text",
          description: "Text or prompt",
          type: 3,
          required: true
        },
        {
          name: "action",
          description: "Mode (ask, summarize, translate)",
          type: 3,
          required: false,
          choices: [
            { name: "Ask", value: "ask" },
            { name: "Summarize", value: "summarize" },
            { name: "Translate", value: "translate" }
          ]
        }
      ],
      execute: async (args) => {
        const textArg = args.find((a) => a.name === "text")?.value;
        const actionArg = args.find((a) => a.name === "action")?.value || "ask";

        showToast("Querying AI...", "info");

        try {
          const result = await askAI(textArg, actionArg);
          return { content: `**[AI ${actionArg.toUpperCase()}]:**\n${result}` };
        } catch (err) {
          showToast(`Error: ${err.message}`, "error");
          return { content: `❌ Error: ${err.message}` };
        }
      }
    });

    unregisterCommands.push(cmd);
  },
  onUnload: () => {
    for (const unregister of unregisterCommands) {
      if (typeof unregister === "function") unregister();
    }
  },
  settings: Settings
};
