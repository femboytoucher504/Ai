import { storage } from "@vendetta/plugin";
import { Forms } from "@vendetta/ui/components";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput } = Forms;

export default function Settings() {
  const [openAiKey, setOpenAiKey] = React.useState(storage.openAiKey || "");
  const [geminiKey, setGeminiKey] = React.useState(storage.geminiKey || "");
  const [provider, setProvider] = React.useState(storage.provider || "gemini");

  return React.createElement(
    FormSection,
    { title: "AI Plugin Configuration" },
    React.createElement(FormInput, {
      label: "Google Gemini API Key",
      value: geminiKey,
      placeholder: "AIza...",
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
      label: "Active Provider (Type 'gemini' or 'openai')",
      value: provider,
      placeholder: "gemini",
      onChange: (val) => {
        setProvider(val.toLowerCase());
        storage.provider = val.toLowerCase();
      }
    })
  );
}
