import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

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

/**
 * Get default renderer for given markdown-it rule.
 * Heavily derived from markdown-it-govuk.
 *
 * @author Paul Robert Lloyd
 * @param {import('markdown-it')} md - markdown-it instance.
 * @param {string} rule - markdown-it rule to modify.
 * @returns {function} - Renderer for the given rule.
 */
const getDefaultRenderer = function (md, rule) {
  return (
    md.renderer.rules[rule] ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    }
  );
};

/**
 * Helper function for simple addition of classes to markdown-it rules.
 * Heavily derived from markdown-it-govuk.
 *
 * @author Paul Robert Lloyd
 * @param {import('markdown-it')} md - markdown-it instance.
 * @param {string} rule - markdown-it rule to modify.
 * @param {string} classes - Class or classes to add to this rule.
 * @returns {function} - Modified renderer for the given rule.
 */

const addClassesToRule = function (md, rule, classes) {
  const defaultRenderer = getDefaultRenderer(md, rule);
  md.renderer.rules[rule] = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    if (token.attrGet("class")) {
      token.attrJoin("class", classes);
    } else {
      token.attrPush(["class", classes]);
    }

    return defaultRenderer(tokens, idx, options, env, self);
  };
};

/**
 * Small markdown-it plugin that adds classes to elements automatically.
 * Heavily derived from markdown-it-govuk.
 *
 * @param {require('markdown-it')} md - markdown-it instance
 */
const markdownItClasses = function (md) {
  // Blockquote
  addClassesToRule(md, "blockquote_open", "er-blockquote");

  // Code (block)
  const codeFenceRenderer = getDefaultRenderer(md, "fence");
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    if (tokens[idx].tag === "code") {
      tokens[idx].attrPush([
        "class",
        `er-code${tokens[idx].info ? ` er-code--${tokens[idx].info}` : ""}`,
      ]);
    }
    return codeFenceRenderer(tokens, idx, options, env, self);
  };

  // Code (inline)
  addClassesToRule(md, "code_inline", "er-inline-code");

  // Code (kbd)
  const kbdRenderer = getDefaultRenderer(md, "html_inline");
  md.renderer.rules.html_inline = (tokens, idx, options, env, self) => {
    if (tokens[idx].content === "<kbd>") {
      tokens[idx].content = `<kbd class="er-kbd">`;
    }
    return kbdRenderer(tokens, idx, options, env, self);
  };

  // Headings
  const headingRenderer = getDefaultRenderer(md, "heading_open");
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const modifiers = ["xl", "l", "m", "s", "xs"];
    const level = tokens[idx].tag.replace(/^h(:?\d{1}?)/, "$1");
    const headingLevel = Number(level);
    const modifier = modifiers[headingLevel - 1] || "xs";
    tokens[idx].attrPush(["class", `er-heading-${modifier}`]);
    return headingRenderer(tokens, idx, options, env, self);
  };

  // Horizontal rule
  addClassesToRule(md, "hr", "er-rule");

  // Images
  addClassesToRule(md, "image", "er-image");

  // Links
  addClassesToRule(md, "link_open", "er-link");

  // Lists
  addClassesToRule(md, "bullet_list_open", "er-list er-list--bulleted");
  addClassesToRule(md, "ordered_list_open", "er-list er-list--numbered");

  // Paragraphs
  addClassesToRule(md, "paragraph_open", "er-body");

  // Tables
  addClassesToRule(md, "table_open", "er-table");
  addClassesToRule(md, "thead_open", "er-table__head");
  addClassesToRule(md, "tbody_open", "er-table__body");
  addClassesToRule(md, "tr_open", "er-table__row");
  addClassesToRule(md, "th_open", "er-table__header");
  addClassesToRule(md, "td_open", "er-table__cell");

  // Custom text replacements
  const defaultTextRenderer = getDefaultRenderer(md, "text");
  md.renderer.rules.text = (tokens, idx, options, env, self) => {
    // Vulgar fractions
    tokens[idx].content = tokens[idx].content
      .replace(/(?<!\d)1\/2(?!\d)/g, "½")
      .replace(/(?<!\d)1\/3(?!\d)/g, "⅓")
      .replace(/(?<!\d)2\/3(?!\d)/g, "⅔")
      .replace(/(?<!\d)1\/4(?!\d)/g, "¼")
      .replace(/(?<!\d)3\/4(?!\d)/g, "¾");

    // Math symbols
    tokens[idx].content = tokens[idx].content
      .replace(/(?<= )<=(?= )/g, "≤")
      .replace(/(?<= )>=(?= )/g, "≥")
      .replace(/~=/g, "≈")
      .replace(/(?<=\d+)x(?=\d+)/g, "×");

    return defaultTextRenderer(tokens, idx, options, env, self);
  };
};

const markdownConfig = markdownIt({
  html: true,
  typographer: true,
  breaks: true,
})
  .use(markdownItAnchor, {
    tabIndex: false,
  })
  .use(markdownItClasses);

export { markdownConfig, markdownFilter, markdownFilterInline };
