var plugin=(function(commands,toasts,plugin,components,common){'use strict';function askAI(promptText, mode) {
  if (!mode) mode = "ask";
  const provider = plugin.storage.provider || "gemini";
  const geminiKey = plugin.storage.geminiKey;
  const openAiKey = plugin.storage.openAiKey;

  let systemPrompt = "You are a helpful AI assistant inside Discord.";
  if (mode === "summarize") systemPrompt = "Summarize the following text concisely:";
  if (mode === "translate") systemPrompt = "Translate the following text clearly:";

  if (provider === "gemini") {
    if (!geminiKey) return Promise.reject(new Error("Missing Gemini API Key in Settings!"));
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + promptText }] }]
      })
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) throw new Error(data.error.message || "Gemini error");
      return data.candidates[0].content.parts[0].text;
    });
  } else {
    if (!openAiKey) return Promise.reject(new Error("Missing OpenAI API Key in Settings!"));
    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + openAiKey },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: promptText }]
      })
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) throw new Error(data.error.message || "OpenAI error");
      return data.choices[0].message.content;
    });
  }
}function Settings() {
  const FormSection = components.Forms?.FormSection || (({ children }) => children);
  const FormInput = components.Forms?.FormInput || (() => null);

  const [geminiKey, setGeminiKey] = common.React.useState(plugin.storage.geminiKey || "");
  const [openAiKey, setOpenAiKey] = common.React.useState(plugin.storage.openAiKey || "");
  const [provider, setProvider] = common.React.useState(plugin.storage.provider || "gemini");

  return common.React.createElement(
    FormSection,
    { title: "AI Plugin Configuration" },
    common.React.createElement(FormInput, {
      label: "Google Gemini API Key",
      value: geminiKey,
      placeholder: "AIzaSy...",
      onChange: (val) => {
        setGeminiKey(val);
        plugin.storage.geminiKey = val;
      }
    }),
    common.React.createElement(FormInput, {
      label: "OpenAI API Key (Optional)",
      value: openAiKey,
      placeholder: "sk-...",
      onChange: (val) => {
        setOpenAiKey(val);
        plugin.storage.openAiKey = val;
      }
    }),
    common.React.createElement(FormInput, {
      label: "Active Provider (gemini or openai)",
      value: provider,
      placeholder: "gemini",
      onChange: (val) => {
        const p = val ? val.toLowerCase() : "gemini";
        setProvider(p);
        plugin.storage.provider = p;
      }
    })
  );
}let unregister = null;

var index = {
  onLoad: () => {
    try {
      unregister = commands.registerCommand({
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
      if (typeof toasts.showToast === "function") toasts.showToast("AI Assistant Loaded!", "success");
    } catch (e) {
      if (typeof toasts.showToast === "function") toasts.showToast("Load Error: " + e.message, "error");
    }
  },
  onUnload: () => {
    if (typeof unregister === "function") unregister();
  },
  settings: Settings
};return index;})(vendetta.commands,vendetta.ui.toasts,vendetta.plugin,vendetta.ui.components,vendetta.metro.common);
plugin;