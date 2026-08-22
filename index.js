var plugin=(function(commands,toasts,plugin,components,common){'use strict';async function askAI(promptText, mode = "ask") {
  const provider = plugin.storage.provider || "gemini";
  const geminiKey = plugin.storage.geminiKey;
  const openAiKey = plugin.storage.openAiKey;

  let systemPrompt = "You are a helpful AI assistant inside Discord.";
  if (mode === "summarize") systemPrompt = "Summarize the following text concisely:";
  if (mode === "translate") systemPrompt = "Translate the following text clearly:";

  if (provider === "gemini") {
    if (!geminiKey) throw new Error("Missing Gemini API Key! Configure it in Settings.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${promptText}` }] }]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "Gemini error");
    return data.candidates[0].content.parts[0].text;
  } else {
    if (!openAiKey) throw new Error("Missing OpenAI API Key! Configure it in Settings.");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openAiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: promptText }]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "OpenAI error");
    return data.choices[0].message.content;
  }
}const { FormSection, FormInput } = components.Forms;

function Settings() {
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
        const p = val.toLowerCase();
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
      toasts.showToast("AI Assistant Loaded!", "success");
    } catch (e) {
      toasts.showToast(`Load Error: ${e.message}`, "error");
    }
  },
  onUnload: () => {
    if (typeof unregister === "function") unregister();
  },
  settings: Settings
};return index;})(commands,toasts,plugin,components,common);
plugin;