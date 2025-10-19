import { formatPageUrl } from "../../eleventy/functions/pages.js";

export default function () {
  return {
    eleventyComputed: {
      // Output MediaWiki style links. However, unlike MediaWiki, the trailing
      // slash is required by Eleventy.
      permalink: (data) => {
        return formatPageUrl(data.page.fileSlug);
      },
    },
  };
}
