import paths from "./eleventy/paths.js";

import { compileStylesheets } from "./eleventy/build/sass.js";
import { markdownConfig } from "./eleventy/build/markdown.js";

import { formatPageUrl } from "./eleventy/functions/pages.js";
import { getAllTags, formatTagUrl } from "./eleventy/functions/tags.js";
import {
  gitEditUrl,
  gitHistoryUrl,
  gitEditDate,
} from "./eleventy/functions/editing.js";

/**
 *  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 */

export default function (eleventyConfig) {
  // Markdown configuration
  eleventyConfig.setLibrary("md", markdownConfig);

  // Gather categories from all pages and build a collection from them
  eleventyConfig.addCollection("allTags", getAllTags);

  // Copy assets
  eleventyConfig.addPassthroughCopy({
    [paths.srcAssets]: "assets",
  });

  // Watch and compile Sass files
  eleventyConfig.addWatchTarget(paths.srcSass + "/**/*.scss");
  eleventyConfig.on("beforeBuild", compileStylesheets);

  eleventyConfig.addNunjucksGlobal("gitEditUrl", gitEditUrl);
  eleventyConfig.addNunjucksGlobal("gitHistoryUrl", gitHistoryUrl);
  eleventyConfig.addNunjucksGlobal("gitEditDate", gitEditDate);

  eleventyConfig.addFilter("tagUrl", formatTagUrl);
  eleventyConfig.addFilter("pageUrl", formatPageUrl);

  return {
    markdownTemplateEngine: "njk",
    dir: {
      input: paths.src,
      output: paths.output,
      includes: "_includes",
      layouts: "_layouts",
    },
  };
}
