var plugin = (function () {
  'use strict';

  function getVendetta() {
    return typeof window !== 'undefined' && window.vendetta
      ? window.vendetta
      : (typeof globalThis !== 'undefined' && globalThis.vendetta)
      ? globalThis.vendetta
      : {};
  }

  function getModule(path) {
    var parts = path.split('.');
    var curr = getVendetta();
    for (var i = 0; i < parts.length; i++) {
      if (!curr) return null;
      curr = curr[parts[i]];
    }
    return curr;
  }

  function getStorage() {
    var p = getModule('plugin');
    return (p && p.storage) ? p.storage : {};
  }

  function getRegisterCommand() {
    var c = getModule('commands');
    return (c && c.registerCommand) ? c.registerCommand : null;
  }

  function getShowToast() {
    var t = getModule('ui.toasts');
    return (t && t.showToast) ? t.showToast : null;
  }

  function getReact() {
    var m = getModule('metro.common');
    return (m && m.React) ? m.React : (typeof React !== 'undefined' ? React : null);
  }

  function getForms() {
    var c = getModule('ui.components');
    return (c && c.Forms) ? c.Forms : null;
  }

  function askAI(promptText, mode) {
    if (!mode) mode = "ask";
    var storage = getStorage();
    var provider = storage.provider || "gemini";
    var geminiKey = storage.geminiKey;
    var openAiKey = storage.openAiKey;

    var systemPrompt = "You are a helpful AI assistant inside Discord.";
    if (mode === "summarize") systemPrompt = "Summarize the following text concisely:";
    if (mode === "translate") systemPrompt = "Translate the following text clearly:";

    if (provider === "gemini") {
      if (!geminiKey) return Promise.reject(new Error("Missing Gemini API Key in Settings!"));
      var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey;
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + "\n\n" + promptText }] }]
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.error) throw new Error(data.error.message || "Gemini error");
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
          return data.candidates[0].content.parts[0].text;
        }
        throw new Error("Invalid response from Gemini API");
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
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.error) throw new Error(data.error.message || "OpenAI error");
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
        throw new Error("Invalid response from OpenAI API");
      });
    }
  }

  function Settings() {
    var React = getReact();
    var Forms = getForms();
    var storage = getStorage();

    if (!React) return null;

    var geminiState = React.useState(storage.geminiKey || "");
    var geminiKey = geminiState[0];
    var setGeminiKey = geminiState[1];

    var openAiState = React.useState(storage.openAiKey || "");
    var openAiKey = openAiState[0];
    var setOpenAiKey = openAiState[1];

    var providerState = React.useState(storage.provider || "gemini");
    var provider = providerState[0];
    var setProvider = providerState[1];

    var FormSection = (Forms && Forms.FormSection) ? Forms.FormSection : function(p) { return p.children; };
    var FormInput = (Forms && Forms.FormInput) ? Forms.FormInput : function() { return null; };

    return React.createElement(
      FormSection,
      { title: "AI Plugin Configuration" },
      React.createElement(FormInput, {
        label: "Google Gemini API Key",
        value: geminiKey,
        placeholder: "AIzaSy...",
        onChange: function(val) {
          setGeminiKey(val);
          storage.geminiKey = val;
        }
      }),
      React.createElement(FormInput, {
        label: "OpenAI API Key (Optional)",
        value: openAiKey,
        placeholder: "sk-...",
        onChange: function(val) {
          setOpenAiKey(val);
          storage.openAiKey = val;
        }
      }),
      React.createElement(FormInput, {
        label: "Active Provider (gemini or openai)",
        value: provider,
        placeholder: "gemini",
        onChange: function(val) {
          var p = val ? val.toLowerCase() : "gemini";
          setProvider(p);
          storage.provider = p;
        }
      })
    );
  }

  var unregister = null;

  return {
    onLoad: function() {
      try {
        var registerCommand = getRegisterCommand();
        var showToast = getShowToast();

        if (typeof registerCommand === "function") {
          unregister = registerCommand({
            name: "ai",
            displayName: "ai",
            description: "Run AI prompt, summary, or translation",
            displayDescription: "Run AI prompt, summary, or translation",
            options: [
              { name: "text", description: "Text or prompt", type: 3, required: true },
              { name: "action", description: "Mode (ask, summarize, translate)", type: 3, required: false, choices: [ { name: "Ask", value: "ask" }, { name: "Summarize", value: "summarize" }, { name: "Translate", value: "translate" } ] }
            ],
            execute: function(args) {
              var textArg = "";
              var actionArg = "ask";
              if (args && args.length) {
                for (var i = 0; i < args.length; i++) {
                  if (args[i].name === "text") textArg = args[i].value;
                  if (args[i].name === "action") actionArg = args[i].value;
                }
              }
              return askAI(textArg, actionArg)
                .then(function(result) {
                  return { content: "**[AI " + actionArg.toUpperCase() + "]:**\n" + result };
                })
                .catch(function(err) {
                  return { content: "❌ Error: " + err.message };
                });
            }
          });
        }
        if (typeof showToast === "function") showToast("AI Assistant Loaded!", "success");
      } catch (e) {
        var showToastErr = getShowToast();
        if (typeof showToastErr === "function") showToastErr("Load Error: " + e.message, "error");
      }
    },
    onUnload: function() {
      if (typeof unregister === "function") unregister();
    },
    settings: Settings
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = plugin;
}
plugin;
