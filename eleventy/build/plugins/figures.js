/**
 * Custom markdown-it handler for figures (images with visible captions).
 *
 * @param {import('markdown-it')} md - markdown-it instance.
 */

const erFiguresPlugin = function (md) {
  const openingTag = "!!!figure";
  const closingTag = "!!!";
  const dividerTag = "---";

  md.block.ruler.before(
    "fence",
    "figure",
    (state, startLine, endLine, silent) => {
      const pos = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];

      // If `pos` and `openingTag` would be longer than the line length, back out early
      if (pos + openingTag.length > max) return false;

      // Check if line starts with `openingTag`
      const marker = state.src.slice(pos, pos + openingTag.length);
      if (marker !== openingTag) return false;

      // Get the first line of the block
      const firstLine = state.src.slice(pos, max).trim();

      // Extract modifiers from the first line by removing `openingTag`, this is
      // split into an array later on
      const modifiers = firstLine.slice(openingTag.length).trim();

      // If we're in 'silent' (validation) mode, we don't need to output
      // anything, just tell the validator that it should close any currently
      // open blocks.
      if (silent) {
        return true;
      }

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

      // No
      if (!autoClose) return false;

      const oldParent = state.parentType;
      const oldLineMax = state.lineMax;
      state.parentType = "figure";

      // Create opening token
      let token = state.push("figure_open", "figure", 1);
      token.block = true;
      token.map = [startLine, nextLine + 1];
      token.info = modifiers; // Store modifiers in token info

      // Parse the media portion of the code
      const mediaStart = startLine + 1;
      const mediaEnd = dividerLine === -1 ? nextLine : dividerLine;

      state.lineMax = mediaEnd;
      state.md.block.tokenize(state, mediaStart, mediaEnd);
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

export { erFiguresPlugin };
