import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.js",
  external: (id) => id.startsWith("@vendetta"),
  output: {
    file: "index.js",
    format: "iife",
    name: "plugin",
    footer: "plugin;",
    compact: true
  },
  plugins: [resolve(), commonjs()]
};
