import markdownIt from "markdown-it";

import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";

import { erFiguresPlugin } from "./plugins/figures.js";
import { erClassesPlugin } from "./plugins/classes.js";

/**
 * Process a string as Markdown, treating it as a block of content (i.e. it will
 * insert paragraph tags around the content.)
 *
 * @param {string} str - The string to parse as Markdown.
 * @returns {string} - The resulting HTML.
 */
const markdownFilter = function (str) {
  return markdownConfig.render(str);
};

/**
 * Process a string as Markdown, treating it as inline content (i.e. it will NOT
 * insert paragraph tags around the content.)
 *
 * @param {string} str - The string to parse as Markdown.
 * @returns {string} - The resulting HTML.
 */
const markdownFilterInline = function (str) {
  return markdownConfig.renderInline(str);
};

const markdownConfig = markdownIt({
  html: true,
  typographer: true,
  breaks: true,
})
  .use(markdownItFootnote)
  .use(markdownItAnchor, {
    tabIndex: false,
  })
  .use(erFiguresPlugin)
  .use(erClassesPlugin);

export { markdownConfig, markdownFilter, markdownFilterInline };
