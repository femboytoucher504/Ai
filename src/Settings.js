import { storage } from "@vendetta/plugin";
import { Forms } from "@vendetta/ui/components";
import { React } from "@vendetta/metro/common";

export default function Settings() {
  const FormSection = Forms?.FormSection || (({ children }) => children);
  const FormInput = Forms?.FormInput || (() => null);

  const [geminiKey, setGeminiKey] = React.useState(storage.geminiKey || "");
  const [openAiKey, setOpenAiKey] = React.useState(storage.openAiKey || "");
  const [provider, setProvider] = React.useState(storage.provider || "gemini");

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
        const p = val ? val.toLowerCase() : "gemini";
        setProvider(p);
        storage.provider = p;
      }
    })
  );
}
