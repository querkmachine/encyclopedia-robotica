import slugify from "slugify";

const formatPageUrl = function (fileSlug) {
  let slug = slugify(fileSlug, "_");
  slug = slug.charAt(0).toUpperCase() + slug.slice(1);
  return `/wiki/${slug}/`;
};

export { formatPageUrl };
