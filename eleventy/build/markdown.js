import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";

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
 * Customise output of markdown-it-footnote. Abstracted out for tidiness.
 *
 * @param {import('markdown-it')} md - markdown-it instance.
 */
const customiseFootnoteHtml = (md) => {
  md.renderer.rules.footnote_ref = (tokens, idx, options, env, slf) => {
    const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
    const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
    let refid = id;
    if (tokens[idx].meta.subId > 0) refid += `:${tokens[idx].meta.subId}`;
    return `<sup class="er-ref"><a class="er-ui-link" href="#fn${id}" id="fnref${refid}">${caption}</a></sup>`;
  };

  md.renderer.rules.footnote_block_open = () =>
    `<hr class="er-rule">
    <h2 id="references" class="er-heading-xs">References</h2>
    <ol class="er-list er-list--numbered er-references">`;

  md.renderer.rules.footnote_open = (tokens, idx, options, env, slf) => {
    let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
    if (tokens[idx].meta.subId > 0) id += `:${tokens[idx].meta.subId}`;
    return `<li id="fn${id}">`;
  };

  md.renderer.rules.footnote_anchor = (tokens, idx, options, env, slf) => {
    let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
    if (tokens[idx].meta.subId > 0) id += `:${tokens[idx].meta.subId}`;
    /* ↩ with escape code to prevent display as Apple Emoji on iOS */
    return ` <a class="er-ui-link" href="#fnref${id}">\u21a9\uFE0E</a>`;
  };
};

/**
 * Custom markdown-it handler for figures (images with visible captions).
 *
 * @param {import('markdown-it')} md - markdown-it instance.
 */

const figureMarkdown = function (md) {
  const openingTag = "!!!figure";
  const closingTag = "!!!";
  const dividerTag = "---";

  md.block.ruler.before(
    "fence",
    "figure",
    (state, startLine, endLine, silent) => {
      const pos = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];

      // Check if line starts with `openingTag`
      if (pos + openingTag.length > max) return false;

      const marker = state.src.slice(pos, pos + openingTag.length);
      if (marker !== openingTag) return false;

      // Extract modifiers from the openingTag line
      const firstLine = state.src.slice(pos, max).trim();
      // Remove `openingTag and get remaining text
      const modifiers = firstLine.slice(openingTag.length).trim();

      // If we're in silent mode (just checking), return true
      if (silent) return true;

      // Find the ending !!! and optional divider
      let nextLine = startLine;
      let autoClose = false;
      let dividerLine = -1;

      // Search for `closingTag` and `dividerTag`
      while (nextLine < endLine) {
        nextLine++;
        if (nextLine >= endLine) break;

        const linePos = state.bMarks[nextLine] + state.tShift[nextLine];
        const lineMax = state.eMarks[nextLine];
        const lineText = state.src.slice(linePos, lineMax).trim();

        if (lineText === closingTag) {
          autoClose = true;
          break;
        }

        // Check for `dividerTag`
        if (dividerLine === -1 && lineText === dividerTag) {
          dividerLine = nextLine;
        }
      }

      if (!autoClose) return false;

      const oldParent = state.parentType;
      const oldLineMax = state.lineMax;
      state.parentType = "figure";

      // Create opening token
      let token = state.push("figure_open", "figure", 1);
      token.block = true;
      token.map = [startLine, nextLine + 1];
      token.info = modifiers; // Store modifiers in token info

      // Parse the content between markers
      const contentStart = startLine + 1;
      const contentEnd = dividerLine === -1 ? nextLine : dividerLine;

      state.lineMax = contentEnd;
      state.md.block.tokenize(state, contentStart, contentEnd);
      state.lineMax = oldLineMax;

      // If there's a divider, parse caption content
      if (dividerLine !== -1) {
        token = state.push("figcaption_open", "figcaption", 1);
        token.block = true;

        const captionStart = dividerLine + 1;
        const captionEnd = nextLine;

        state.lineMax = captionEnd;
        state.md.block.tokenize(state, captionStart, captionEnd);
        state.lineMax = oldLineMax;

        token = state.push("figcaption_close", "figcaption", -1);
        token.block = true;
      }

      // Create closing token
      token = state.push("figure_close", "figure", -1);
      token.block = true;

      state.parentType = oldParent;
      state.line = nextLine + 1;

      return true;
    },
  );

  // Add rendering rules
  md.renderer.rules.figure_open = (tokens, idx) => {
    const token = tokens[idx];
    const tokenInfos = token.info
      ? md.utils.escapeHtml(token.info).split(" ")
      : [];

    let classes = "er-figure";
    tokenInfos.forEach((c) => (classes += ` er-figure--${c}`));

    return `<figure class="${classes}">\n`;
  };
  md.renderer.rules.figure_close = () => "</figure>\n";
  md.renderer.rules.figcaption_open = () =>
    '<figcaption class="er-figure__caption">';
  md.renderer.rules.figcaption_close = () => "</figcaption>\n";
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

  // Customise markdown-it-footnote output
  customiseFootnoteHtml(md);

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
  .use(figureMarkdown)
  .use(markdownItFootnote)
  .use(markdownItAnchor, {
    tabIndex: false,
  })
  .use(markdownItClasses);

export { markdownConfig, markdownFilter, markdownFilterInline };
