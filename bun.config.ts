import { bunconfig } from "bun";

export default bunconfig({
  entrypoints: ["./mod.ts"],
  outdir: "./dist",
  target: "bun",
  format: "esm",
  splitting: false,
  sourcemap: "external",
  minify: false,
});