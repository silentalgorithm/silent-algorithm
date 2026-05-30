/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */

import { EleventyHtmlBasePlugin, IdAttributePlugin } from "@11ty/eleventy";

import { DateTime } from "luxon";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import Nunjucks from "nunjucks";

import path from "node:path";

// import metadata from "./src/_data/metadata.js";

const serverOptions = {
  // Default values are shown:

  // Whether the live reload snippet is used
  liveReload: true,

  // Whether DOM diffing updates are applied where possible instead of page reloads
  domDiff: true,

  // The starting port number
  // Will increment up to (configurable) 10 times if a port is already in use.
  port: 8080,

  // Additional files to watch that will trigger server updates
  // Accepts an Array of file paths or globs (passed to `chokidar.watch`).
  // Works great with a separate bundler writing files to your output folder.
  // e.g. `watch: ["_site/**/*.css"]`
  watch: ["src/**/*.css", "src/**/*.js"],

  // Show local network IP addresses for device testing
  showAllHosts: true,

  // Use a local key/certificate to opt-in to local HTTP/2 with https
  https: {
    // key: "./localhost.key",
    // cert: "./localhost.cert",
  },

  // Change the default file encoding for reading/serving files
  encoding: "utf-8",

  // Show the dev server version number on the command line
  showVersion: true,

  // Added in Dev Server 2.0+
  // The default file name to show when a directory is requested.
  indexFileName: "index.html",

  // Added in Dev Server 2.0+
  // An object mapping a URLPattern pathname to a callback function
  // for on-request processing (read more below).
  onRequest: {},
};

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(IdAttributePlugin, { checkDuplicates: "false" });
  eleventyConfig.addPlugin(syntaxHighlight);

  let nunjucksEnvironment = new Nunjucks.Environment(
    new Nunjucks.FileSystemLoader("src/_includes"),
  );

  eleventyConfig.setLibrary("njk", nunjucksEnvironment);

  eleventyConfig.setInputDirectory("src");
  eleventyConfig.setIncludesDirectory("_includes");
  eleventyConfig.setDataDirectory("_data");
  eleventyConfig.setOutputDirectory("docs");

  // Copiar assets sin procesar
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy({
    "src/assets/": "assets",
  });

  // Filtro de fecha legible
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Fecha
  // Formato ISO 8601 requerido por el atributo datetime de <time>
  // y por article:published_time de Open Graph
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    if (dateObj) {
      return new Date(dateObj).toISOString().split("T")[0]; // "2024-03-15"
    }
  });

  // Filtro de tiempo de lectura de post
  eleventyConfig.addFilter("readingTime", (content) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min de lectura`;
  });

  // ? La funcion extendRemplace remplaza el texto indicado de cada coincidencia de la exprecion regular (regExp,textoOriginal,valorDeRemplazo)
  eleventyConfig.addNunjucksGlobal(
    "extendRemplace",
    (expression, originalText, replacementText) => {
      let re = new RegExp(expression);
      if (typeof originalText === "string") {
        return originalText.replace(re, replacementText);
      }
    },
  );

  // ? La funcion extendRemplace remplaza el texto indicado de cada coincidencia de la exprecion regular (regExp,textoOriginal,valorDeRemplazo)
  eleventyConfig.addNunjucksGlobal("debug", (value) => {
    console.log(`DEBUG: ${value}`);
  });

  // filtro global de el año copyright
  eleventyConfig.addFilter("currentYear", () => {
    return new Date().getFullYear();
  });

  // También útil: shortcode para usarlo sin filtro
  // eleventyConfig.addShortcode("year", () => {
  //   return String(new Date().getFullYear());
  // });

  // -- CONFIGURACION ADICIONAL ----------------------------------------------------------

  // RSS filters (manual since plugin v3 API changed)
  eleventyConfig.addFilter("dateToRfc3339", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO(),
  );
  eleventyConfig.addFilter("dateToRfc822", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toRFC2822(),
  );
  eleventyConfig.addFilter("getNewestCollectionItemDate", (collection) => {
    if (!collection || !collection.length) return new Date();
    return new Date(Math.max(...collection.map((item) => item.date)));
  });
  eleventyConfig.addFilter("htmlToAbsoluteUrls", (content, base) => {
    if (!content) return content;
    return content.replace(/(href|src)="\/([^"]*?)"/g, `$1="${base}/$2"`);
  });

  // ── MARKDOWN ─────────────────────────────────────
  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.linkInsideHeader({
      symbol: "#",
      placement: "after",
    }),
    slugify: (s) =>
      s
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-"),
  });
  eleventyConfig.setLibrary("md", md);

  // ── COLLECTIONS ──────────────────────────────────

  // All blog posts sorted newest first
  eleventyConfig.addCollection("blog", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/blog/**/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => b.date - a.date),
  );

  // Blog posts by category
  eleventyConfig.addCollection("categorias", (collectionApi) => {
    const posts = collectionApi
      .getFilteredByGlob("src/blog/**/*.md")
      .filter((p) => !p.data.draft);
    const cats = {};
    posts.forEach((p) => {
      const cat = p.data.categoria || "General";
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(p);
    });
    return cats;
  });

  // Featured posts
  eleventyConfig.addCollection("destacados", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/blog/**/*.md")
      .filter((p) => !p.data.draft && p.data.destacado)
      .sort((a, b) => b.date - a.date)
      .slice(0, 3),
  );

  // All servicios pages
  eleventyConfig.addCollection("servicios", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/servicios/**/*.md")
      .sort((a, b) => (a.data.orden || 99) - (b.data.orden || 99)),
  );

  // ── FILTERS ──────────────────────────────────────

  // Date formatting
  eleventyConfig.addFilter("fechaLarga", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" })
      .setLocale("es")
      .toFormat("d LLLL yyyy"),
  );
  eleventyConfig.addFilter("fechaCorta", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" })
      .setLocale("es")
      .toFormat("d MMM yyyy"),
  );
  eleventyConfig.addFilter("fechaISO", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO(),
  );

  // Reading time
  eleventyConfig.addFilter("tiempoLectura", (content) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const mins = Math.ceil(words / 200);
    return `${mins} min`;
  });

  // Truncate
  eleventyConfig.addFilter("truncar", (str, n = 160) =>
    str && str.length > n ? str.slice(0, n).trimEnd() + "…" : str,
  );

  // Slug
  eleventyConfig.addFilter("slug", (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-"),
  );

  // Absolute URL for OG
  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    if (!url) return base;
    return url.startsWith("http") ? url : `${base}${url}`;
  });

  // First n items
  eleventyConfig.addFilter("primeros", (arr, n) => arr.slice(0, n));

  // Exclude current post from related
  eleventyConfig.addFilter("excluir", (arr, page) =>
    arr.filter((p) => p.url !== page.url).slice(0, 3),
  );

  // Format price
  eleventyConfig.addFilter("precio", (n) =>
    Number(n).toLocaleString("es", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }),
  );

  // ── SHORTCODES ───────────────────────────────────

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  eleventyConfig.addPairedShortcode("callout", (content, tipo = "info") => {
    return `<div class="callout callout--${tipo}">${md.render(content)}</div>`;
  });

  eleventyConfig.addPairedShortcode("code", (content, lang = "text") => {
    return `<pre class="code-block"><code class="language-${lang}">${content.trim()}</code></pre>`;
  });

  // ── TRANSFORMS ───────────────────────────────────

  // Minify HTML in production
  if (process.env.NODE_ENV === "production") {
    eleventyConfig.addTransform("htmlmin", async (content, outputPath) => {
      if (!outputPath || !outputPath.endsWith(".html")) return content;
      const { minify } = await import("html-minifier-terser");
      return minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
      });
    });
  }

  // ── WATCH TARGETS ────────────────────────────────
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // configuracion del servidor
  eleventyConfig.setServerOptions(serverOptions);
}

export const config = {
  // pathPrefix: metadata.pathPrefix,
  templateFormats: ["njk", "md", "html"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
