var plugin=(function(plugin$1){'use strict';async function askAI(promptText, mode = "ask") {
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
}let unregister = null;

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
};return plugin;})(vendetta.plugin);
plugin;