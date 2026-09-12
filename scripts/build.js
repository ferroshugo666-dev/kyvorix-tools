// Build script: minifies the site in public/ into dist/ for deployment.
// Source of truth stays in public/ (readable, easy to edit); dist/ is a
// generated artifact (gitignored) that Wrangler actually deploys.
"use strict";

const fs = require("fs");
const path = require("path");
const { minify: minifyHtml } = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const { minify: minifyJs } = require("terser");

const SRC = path.join(__dirname, "..", "public");
const DIST = path.join(__dirname, "..", "dist");

const HTML_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: false, // keep explicit attrs like type="button"
  removeEmptyAttributes: false,
  minifyCSS: true,
  minifyJS: true,
  // Never touch attribute values or text content quoting in ways that
  // could change behaviour; keep this conservative.
  caseSensitive: true,
  keepClosingSlash: true,
};

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function build() {
  if (fs.existsSync(DIST)) {
    await fs.promises.rm(DIST, { recursive: true, force: true });
  }
  await fs.promises.mkdir(DIST, { recursive: true });

  const files = await walk(SRC);
  let htmlCount = 0, cssCount = 0, jsCount = 0, copyCount = 0;
  let originalBytes = 0, finalBytes = 0;

  for (const file of files) {
    const rel = path.relative(SRC, file);
    const outPath = path.join(DIST, rel);
    await fs.promises.mkdir(path.dirname(outPath), { recursive: true });

    const ext = path.extname(file).toLowerCase();
    const raw = await fs.promises.readFile(file, "utf8").catch(() => null);

    if (ext === ".html" && raw !== null) {
      originalBytes += Buffer.byteLength(raw);
      let out;
      try {
        out = await minifyHtml(raw, HTML_OPTS);
      } catch (err) {
        console.error(`Falha a minificar ${rel}, a copiar sem alteracoes:`, err.message);
        out = raw;
      }
      await fs.promises.writeFile(outPath, out, "utf8");
      finalBytes += Buffer.byteLength(out);
      htmlCount++;
    } else if (ext === ".css" && raw !== null) {
      originalBytes += Buffer.byteLength(raw);
      const result = new CleanCSS({ level: 2 }).minify(raw);
      if (result.errors && result.errors.length) {
        console.error(`Erros CSS em ${rel}, a copiar sem alteracoes:`, result.errors);
        await fs.promises.writeFile(outPath, raw, "utf8");
        finalBytes += Buffer.byteLength(raw);
      } else {
        await fs.promises.writeFile(outPath, result.styles, "utf8");
        finalBytes += Buffer.byteLength(result.styles);
      }
      cssCount++;
    } else if (ext === ".js" && raw !== null && !file.endsWith(".min.js")) {
      originalBytes += Buffer.byteLength(raw);
      try {
        const result = await minifyJs(raw, { format: { comments: false } });
        await fs.promises.writeFile(outPath, result.code, "utf8");
        finalBytes += Buffer.byteLength(result.code);
      } catch (err) {
        console.error(`Falha a minificar ${rel}, a copiar sem alteracoes:`, err.message);
        await fs.promises.writeFile(outPath, raw, "utf8");
        finalBytes += Buffer.byteLength(raw);
      }
      jsCount++;
    } else {
      // Binary or already-minified files: copy as-is.
      await fs.promises.copyFile(file, outPath);
      copyCount++;
    }
  }

  const saved = originalBytes - finalBytes;
  const pct = originalBytes ? ((saved / originalBytes) * 100).toFixed(1) : "0.0";
  console.log(`HTML: ${htmlCount}  CSS: ${cssCount}  JS: ${jsCount}  copiados: ${copyCount}`);
  console.log(`Tamanho minificavel: ${originalBytes} -> ${finalBytes} bytes (-${pct}%)`);
  console.log(`Build concluido em ${DIST}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
