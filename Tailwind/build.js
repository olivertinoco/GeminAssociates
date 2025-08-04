// build.js
const { build } = await import("bun");

await build({
  entrypoints: ["./src/scripts/home/datos.js", "./src/scripts/home/index.js"],
  outdir: "./wwwroot/js/home",
  minify: true,
  target: "browser",
  splitting: false,
  bundle: true,
});

console.log("JS minificado generado en wwwroot/js/app.js");
