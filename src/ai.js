import { storage } from "@vendetta/plugin";

export function askAI(promptText, mode) {
  if (!mode) mode = "ask";
  const provider = storage.provider || "gemini";
  const geminiKey = storage.geminiKey;
  const openAiKey = storage.openAiKey;

  let systemPrompt = "You are a helpful AI assistant inside Discord.";
  if (mode === "summarize") systemPrompt = "Summarize the following text concisely:";
  if (mode === "translate") systemPrompt = "Translate the following text clearly:";

  if (provider === "gemini") {
    if (!geminiKey) return Promise.reject(new Error("Missing Gemini API Key! Configure it in Settings."));
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + promptText }] }]
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) throw new Error(data.error.message || "Gemini error");
      return data.candidates[0].content.parts[0].text;
    });
  } else {
    if (!openAiKey) return Promise.reject(new Error("Missing OpenAI API Key! Configure it in Settings."));
    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + openAiKey },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: promptText }]
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) throw new Error(data.error.message || "OpenAI error");
      return data.choices[0].message.content;
    });
  }
}
