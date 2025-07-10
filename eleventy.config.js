import Nunjucks from "nunjucks";
import { EleventyHtmlBasePlugin, IdAttributePlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import metadata from "./src/_data/metadata.js";

export default async function (eleventyConfig) {
  eleventyConfig.setInputDirectory("src");
  eleventyConfig.setOutputDirectory("docs");
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(IdAttributePlugin, { checkDuplicates: false });
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy({"src/js/**/*.js": "js"});
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/inc");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  let nunjucksEnvironment = new Nunjucks.Environment(
		new Nunjucks.FileSystemLoader("src/_includes")
	);

	eleventyConfig.setLibrary("njk", nunjucksEnvironment);
}

export const config = {
  pathPrefix: metadata.pathPrefix,
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};