import { storage } from "@vendetta/plugin";
import { Forms, React } from "@vendetta/ui/components";

const { FormSection, FormInput, FormRadioRow } = Forms;

export default () => {
  const [apiKey, setApiKey] = React.useState(storage.apiKey || "");
  const [provider, setProvider] = React.useState(storage.provider || "openai");
  const [model, setModel] = React.useState(storage.model || "gpt-4o-mini");

  return (
    <FormSection title="AI Plugin Configuration">
      <FormInput
        label="API Key"
        value={apiKey}
        placeholder="sk-... or Gemini Key"
        onChange={(val) => {
          setApiKey(val);
          storage.apiKey = val;
        }}
      />
      <FormInput
        label="OpenAI Model Name"
        value={model}
        placeholder="gpt-4o-mini"
        onChange={(val) => {
          setModel(val);
          storage.model = val;
        }}
      />
      <FormRadioRow
        label="OpenAI API"
        selected={provider === "openai"}
        onPress={() => {
          setProvider("openai");
          storage.provider = "openai";
        }}
      />
      <FormRadioRow
        label="Google Gemini API"
        selected={provider === "gemini"}
        onPress={() => {
          setProvider("gemini");
          storage.provider = "gemini";
        }}
      />
    </FormSection>
  );
};
