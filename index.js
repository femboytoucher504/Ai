var revengePlugin = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });
  function vendetta() {
    return typeof window !== "undefined" && window.vendetta || {};
  }
  function askAI(promptText, mode = "ask") {
    const storage = vendetta().plugin?.storage || {};
    const provider = storage.provider || "gemini";
    const geminiKey = storage.geminiKey;
    const openAiKey = storage.openAiKey;
    let systemPrompt = "You are a helpful AI assistant inside Discord.";
    if (mode === "summarize") systemPrompt = "Summarize the following text concisely:";
    if (mode === "translate") systemPrompt = "Translate the following text clearly:";
    if (provider === "gemini") {
      if (!geminiKey) return Promise.reject(new Error("Missing Gemini API Key in Settings!"));
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey;
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + "\n\n" + promptText }] }] })
      }).then((res) => res.json()).then((data) => {
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
      }).then((res) => res.json()).then((data) => {
        if (data.error) throw new Error(data.error.message || "OpenAI error");
        return data.choices[0].message.content;
      });
    }
  }
  var unregister = null;
  function Settings() {
    const v = vendetta();
    const React = v.metro?.common?.React;
    const Forms = v.ui?.components?.Forms;
    const storage = v.plugin?.storage || {};
    if (!React) return null;
    const [geminiKey, setGeminiKey] = React.useState(storage.geminiKey || "");
    const [openAiKey, setOpenAiKey] = React.useState(storage.openAiKey || "");
    const [provider, setProvider] = React.useState(storage.provider || "gemini");
    const FormSection = Forms?.FormSection || (({ children }) => children);
    const FormInput = Forms?.FormInput || (() => null);
    return React.createElement(
      FormSection,
      { title: "AI Plugin Configuration" },
      React.createElement(FormInput, {
        label: "Google Gemini API Key",
        value: geminiKey,
        placeholder: "AIzaSy...",
        onChange: (val) => {
          setGeminiKey(val);
          storage.geminiKey = val;
        }
      }),
      React.createElement(FormInput, {
        label: "OpenAI API Key (Optional)",
        value: openAiKey,
        placeholder: "sk-...",
        onChange: (val) => {
          setOpenAiKey(val);
          storage.openAiKey = val;
        }
      }),
      React.createElement(FormInput, {
        label: "Active Provider (gemini or openai)",
        value: provider,
        placeholder: "gemini",
        onChange: (val) => {
          const p = (val || "gemini").toLowerCase();
          setProvider(p);
          storage.provider = p;
        }
      })
    );
  }
  var index_default = {
    onLoad() {
      const v = vendetta();
      const registerCommand = v.commands?.registerCommand;
      const showToast = v.ui?.toasts?.showToast;
      if (typeof registerCommand === "function") {
        unregister = registerCommand({
          name: "ai",
          displayName: "ai",
          description: "Run AI prompt, summary, or translation",
          displayDescription: "Run AI prompt, summary, or translation",
          options: [
            { name: "text", description: "Text or prompt", type: 3, required: true },
            {
              name: "action",
              description: "Mode (ask, summarize, translate)",
              type: 3,
              required: false,
              choices: [{ name: "Ask", value: "ask" }, { name: "Summarize", value: "summarize" }, { name: "Translate", value: "translate" }]
            }
          ],
          execute: (args) => {
            const textArg = args.find((a) => a.name === "text")?.value || "";
            const actionArg = args.find((a) => a.name === "action")?.value || "ask";
            return askAI(textArg, actionArg).then((result) => ({ content: "**[AI " + actionArg.toUpperCase() + "]:**\n" + result })).catch((err) => ({ content: "\u274C Error: " + err.message }));
          }
        });
      }
      if (typeof showToast === "function") showToast("AI Assistant Loaded!", "success");
    },
    onUnload() {
      if (typeof unregister === "function") unregister();
    },
    settings: Settings
  };
  return __toCommonJS(index_exports);
})();
if(typeof module!=='undefined'&&module.exports)module.exports=revengePlugin;
