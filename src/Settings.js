import { storage } from "@vendetta/plugin";
import { Forms } from "@vendetta/ui/components";
import { React } from "@vendetta/metro/common";

export default function Settings() {
  var geminiKey = storage.geminiKey || "";
  var openAiKey = storage.openAiKey || "";
  var provider = storage.provider || "gemini";

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
        storage.geminiKey = val;
      }
    }),
    React.createElement(FormInput, {
      label: "OpenAI API Key (Optional)",
      value: openAiKey,
      placeholder: "sk-...",
      onChange: function(val) {
        storage.openAiKey = val;
      }
    }),
    React.createElement(FormInput, {
      label: "Active Provider (gemini or openai)",
      value: provider,
      placeholder: "gemini",
      onChange: function(val) {
        storage.provider = val ? val.toLowerCase() : "gemini";
      }
    })
  );
}
