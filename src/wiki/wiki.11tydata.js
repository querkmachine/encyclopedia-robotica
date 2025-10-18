import slugify from "slugify";

export default function () {
  return {
    eleventyComputed: {
      // Output MediaWiki style links. However, unlike MediaWiki, the trailing
      // slash is required by Eleventy.
      permalink: (data) => {
        let slug = slugify(data.page.fileSlug, "_");
        slug = slug.charAt(0).toUpperCase() + slug.slice(1);
        console.log(slug);
        return `/wiki/${slug}/`;
      },
    },
  };
}
