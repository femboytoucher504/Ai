var plugin=(function(commands,toasts,plugin$1,common){'use strict';async function askAI(promptText, mode = "ask") {
  const provider = plugin$1.storage.provider || "gemini";
  const geminiKey = plugin$1.storage.geminiKey;
  const openAiKey = plugin$1.storage.openAiKey;

  let systemPrompt = "You are a helpful AI assistant inside Discord.";
  if (mode === "summarize") systemPrompt = "Summarize the following text concisely:";
  if (mode === "translate") systemPrompt = "Translate the following text clearly:";

  if (provider === "gemini") {
    if (!geminiKey) throw new Error("Missing Gemini API Key! Tap the wrench icon to add it.");
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
    if (!openAiKey) throw new Error("Missing OpenAI API Key! Tap the wrench icon to add it.");
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
}function Settings() {
  const [geminiKey, setGeminiKey] = common.React.useState(plugin$1.storage.geminiKey || "");
  const [openAiKey, setOpenAiKey] = common.React.useState(plugin$1.storage.openAiKey || "");
  const [provider, setProvider] = common.React.useState(plugin$1.storage.provider || "gemini");

  // Load components only when settings menu is actually opened
  const ScrollView = common.ReactNative.ScrollView;
  const Text = common.ReactNative.Text;
  const TextInput = common.ReactNative.TextInput;

  const labelStyle = { color: "#F2F3F5", fontWeight: "bold", marginBottom: 8, marginTop: 16, fontSize: 16 };
  const inputStyle = { backgroundColor: "#1E1F22", color: "#DBDEE1", padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: "#000000" };

  return common.React.createElement(
    ScrollView,
    { style: { padding: 16, backgroundColor: "#313338", height: "100%" } },

    common.React.createElement(Text, { style: labelStyle }, "Google Gemini API Key"),
    common.React.createElement(TextInput, {
      style: inputStyle,
      placeholder: "AIzaSy...",
      placeholderTextColor: "#80848E",
      value: geminiKey,
      onChangeText: (text) => { setGeminiKey(text); plugin$1.storage.geminiKey = text; }
    }),

    common.React.createElement(Text, { style: labelStyle }, "OpenAI API Key (Optional)"),
    common.React.createElement(TextInput, {
      style: inputStyle,
      placeholder: "sk-...",
      placeholderTextColor: "#80848E",
      value: openAiKey,
      onChangeText: (text) => { setOpenAiKey(text); plugin$1.storage.openAiKey = text; }
    }),

    common.React.createElement(Text, { style: labelStyle }, "Active AI (Type 'gemini' or 'openai')"),
    common.React.createElement(TextInput, {
      style: inputStyle,
      placeholder: "gemini",
      placeholderTextColor: "#80848E",
      value: provider,
      onChangeText: (text) => { setProvider(text.toLowerCase()); plugin$1.storage.provider = text.toLowerCase(); }
    })
  );
}let unregister = null;

const plugin = {
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
};return plugin;})(vendetta.commands,vendetta.ui.toasts,vendetta.plugin,vendetta.metro.common);
plugin;