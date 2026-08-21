import { storage } from "@vendetta/plugin";
import { Forms } from "@vendetta/ui/components";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput, FormSwitchRow } = Forms;

export default function Settings() {
  const [apiKey, setApiKey] = React.useState(storage.apiKey || "");
  const [useGemini, setUseGemini] = React.useState(storage.provider === "gemini");
  const [model, setModel] = React.useState(storage.model || "gpt-4o-mini");

  return React.createElement(
    FormSection,
    { title: "AI Plugin Configuration" },
    React.createElement(FormInput, {
      label: "API Key",
      value: apiKey,
      placeholder: "OpenAI or Gemini API Key",
      onChange: (val) => {
        setApiKey(val);
        storage.apiKey = val;
      }
    }),
    React.createElement(FormInput, {
      label: "OpenAI Model Name",
      value: model,
      placeholder: "gpt-4o-mini",
      onChange: (val) => {
        setModel(val);
        storage.model = val;
      }
    }),
    React.createElement(FormSwitchRow, {
      label: "Use Google Gemini instead of OpenAI",
      value: useGemini,
      onValueChange: (val) => {
        setUseGemini(val);
        storage.provider = val ? "gemini" : "openai";
      }
    })
  );
}
