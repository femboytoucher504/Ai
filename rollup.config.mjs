import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "index.js",
  external: (id) => id.startsWith("@vendetta"),
  output: {
    file: "dist/index.js",
    format: "iife",
    name: "plugin",
    exports: "default",
    globals: (id) => {
      if (id.startsWith("@vendetta/")) {
        return "vendetta." + id.slice(10).replace(/\//g, ".");
      }
    },
    footer: "plugin;",
    compact: true
  },
  plugins: [resolve(), commonjs()]
};
