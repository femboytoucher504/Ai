import { registerCommand } from "@vendetta/commands";
import { showToast } from "@vendetta/ui/toasts";
import { askAI } from "./ai";
import Settings from "./Settings";

let unregister = null;

export default {
  onLoad: () => {
    try {
      unregister = registerCommand({
        name: "ai",
        displayName: "ai",
        description: "Run AI prompt, summary, or translation",
        displayDescription: "Run AI prompt, summary, or translation",
        options: [
          { name: "text", description: "Text or prompt", type: 3, required: true },
          { name: "action", description: "Mode (ask, summarize, translate)", type: 3, required: false, choices: [ { name: "Ask", value: "ask" }, { name: "Summarize", value: "summarize" }, { name: "Translate", value: "translate" } ] }
        ],
        execute: (args) => {
          let textArg = "";
          let actionArg = "ask";
          if (args && args.length) {
            for (let i = 0; i < args.length; i++) {
              if (args[i].name === "text") textArg = args[i].value;
              if (args[i].name === "action") actionArg = args[i].value;
            }
          }
          return askAI(textArg, actionArg)
            .then((result) => {
              return { content: "**[AI " + actionArg.toUpperCase() + "]:**\n" + result };
            })
            .catch((err) => {
              return { content: "❌ Error: " + err.message };
            });
        }
      });
      if (typeof showToast === "function") showToast("AI Assistant Loaded!", "success");
    } catch (e) {
      if (typeof showToast === "function") showToast("Load Error: " + e.message, "error");
    }
  },
  onUnload: () => {
    if (typeof unregister === "function") unregister();
  },
  settings: Settings
};
