import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.js",
  external: (id) => id.startsWith("@vendetta"),
  output: {
    file: "index.js",
    format: "iife",
    name: "plugin",
    globals: (id) => {
      if (id.startsWith("@vendetta/")) {
        return "vendetta." + id.slice(10).replace(/\//g, ".");
      }
      if (id === "@vendetta") return "vendetta";
    },
    footer: "plugin;",
    compact: true
  },
  plugins: [resolve(), commonjs()]
};
