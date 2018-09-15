import svelte from "rollup-plugin-svelte";
import buble from "rollup-plugin-buble";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const name = "modalr";
const prod = !process.env.ROLLUP_WATCH;

export default {
  input: "src/modalr.js",
  output: [
    { file: "dist/" + pkg.module, format: "es" },
    { file: "dist/" + pkg.main, format: "iife", name }
  ],
  plugins: [
    svelte({
      cascade: false,
      store: true,
      dev: !prod,
    }),
    resolve(),
    commonjs(),
    buble({
      exclude: "node_modules/**"
    }),
    prod && terser()
  ]
};
