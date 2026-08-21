import { storage } from "@vendetta/plugin";
import { React, ReactNative } from "@vendetta/metro/common";

export default function Settings() {
  const [geminiKey, setGeminiKey] = React.useState(storage.geminiKey || "");
  const [openAiKey, setOpenAiKey] = React.useState(storage.openAiKey || "");
  const [provider, setProvider] = React.useState(storage.provider || "gemini");

  // Load components only when settings menu is actually opened
  const ScrollView = ReactNative.ScrollView;
  const Text = ReactNative.Text;
  const TextInput = ReactNative.TextInput;

  const labelStyle = { color: "#F2F3F5", fontWeight: "bold", marginBottom: 8, marginTop: 16, fontSize: 16 };
  const inputStyle = { backgroundColor: "#1E1F22", color: "#DBDEE1", padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: "#000000" };

  return React.createElement(
    ScrollView,
    { style: { padding: 16, backgroundColor: "#313338", height: "100%" } },

    React.createElement(Text, { style: labelStyle }, "Google Gemini API Key"),
    React.createElement(TextInput, {
      style: inputStyle,
      placeholder: "AIzaSy...",
      placeholderTextColor: "#80848E",
      value: geminiKey,
      onChangeText: (text) => { setGeminiKey(text); storage.geminiKey = text; }
    }),

    React.createElement(Text, { style: labelStyle }, "OpenAI API Key (Optional)"),
    React.createElement(TextInput, {
      style: inputStyle,
      placeholder: "sk-...",
      placeholderTextColor: "#80848E",
      value: openAiKey,
      onChangeText: (text) => { setOpenAiKey(text); storage.openAiKey = text; }
    }),

    React.createElement(Text, { style: labelStyle }, "Active AI (Type 'gemini' or 'openai')"),
    React.createElement(TextInput, {
      style: inputStyle,
      placeholder: "gemini",
      placeholderTextColor: "#80848E",
      value: provider,
      onChangeText: (text) => { setProvider(text.toLowerCase()); storage.provider = text.toLowerCase(); }
    })
  );
}
