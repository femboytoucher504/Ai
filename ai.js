import { storage } from "@vendetta/plugin";

export async function askAI(promptText, mode = "ask") {
  const apiKey = storage.apiKey;
  const provider = storage.provider || "openai";
  const customModel = storage.model || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("Missing API Key! Please set it in Plugin Settings.");
  }

  let systemPrompt = "You are a helpful AI assistant integrated into Discord.";
  if (mode === "summarize") {
    systemPrompt = "Summarize the following text concisely:";
  } else if (mode === "translate") {
    systemPrompt = "Translate the following text clearly:";
  }

  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${promptText}` }] }]
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
  } else {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: customModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: promptText }
        ]
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  }
}
