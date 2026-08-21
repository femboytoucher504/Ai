import { storage } from "@vendetta/plugin";
import { Forms } from "@vendetta/ui/components";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput, FormRadioRow } = Forms;

export default function Settings() {
  const [apiKey, setApiKey] = React.useState(storage.apiKey || "");
  const [provider, setProvider] = React.useState(storage.provider || "openai");
  const [model, setModel] = React.useState(storage.model || "gpt-4o-mini");

  return React.createElement(
    FormSection,
    { title: "AI Plugin Configuration" },
    React.createElement(FormInput, {
      label: "API Key",
      value: apiKey,
      placeholder: "sk-... or Gemini Key",
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
    React.createElement(FormRadioRow, {
      label: "OpenAI API",
      selected: provider === "openai",
      onPress: () => {
        setProvider("openai");
        storage.provider = "openai";
      }
    }),
    React.createElement(FormRadioRow, {
      label: "Google Gemini API",
      selected: provider === "gemini",
      onPress: () => {
        setProvider("gemini");
        storage.provider = "gemini";
      }
    })
  );
}
