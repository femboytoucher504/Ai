import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "index.js",
  external: (id) => id.startsWith("@vendetta"),
  output: {
    file: "dist/index.js",
    format: "cjs",
    exports: "default",
    compact: true
  },
  plugins: [resolve(), commonjs()]
};
