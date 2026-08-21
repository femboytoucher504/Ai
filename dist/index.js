var plugin=(function(commands,toasts,plugin,components,common){'use strict';async function askAI(promptText, mode = "ask") {
  const apiKey = plugin.storage.apiKey;
  const provider = plugin.storage.provider || "openai";
  const customModel = plugin.storage.model || "gpt-4o-mini";

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
}const { FormSection, FormInput, FormRadioRow } = components.Forms;

function Settings() {
  const [apiKey, setApiKey] = common.React.useState(plugin.storage.apiKey || "");
  const [provider, setProvider] = common.React.useState(plugin.storage.provider || "openai");
  const [model, setModel] = common.React.useState(plugin.storage.model || "gpt-4o-mini");

  return common.React.createElement(
    FormSection,
    { title: "AI Plugin Configuration" },
    common.React.createElement(FormInput, {
      label: "API Key",
      value: apiKey,
      placeholder: "sk-... or Gemini Key",
      onChange: (val) => {
        setApiKey(val);
        plugin.storage.apiKey = val;
      }
    }),
    common.React.createElement(FormInput, {
      label: "OpenAI Model Name",
      value: model,
      placeholder: "gpt-4o-mini",
      onChange: (val) => {
        setModel(val);
        plugin.storage.model = val;
      }
    }),
    common.React.createElement(FormRadioRow, {
      label: "OpenAI API",
      selected: provider === "openai",
      onPress: () => {
        setProvider("openai");
        plugin.storage.provider = "openai";
      }
    }),
    common.React.createElement(FormRadioRow, {
      label: "Google Gemini API",
      selected: provider === "gemini",
      onPress: () => {
        setProvider("gemini");
        plugin.storage.provider = "gemini";
      }
    })
  );
}let unregisterCommands = [];

var index = {
  onLoad: () => {
    const cmd = commands.registerCommand({
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

        toasts.showToast("Querying AI...", "info");

        try {
          const result = await askAI(textArg, actionArg);
          return { content: `**[AI ${actionArg.toUpperCase()}]:**\n${result}` };
        } catch (err) {
          toasts.showToast(`Error: ${err.message}`, "error");
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
};return index;})(vendetta.commands,vendetta.ui.toasts,vendetta.plugin,vendetta.ui.components,vendetta.metro.common);
plugin;