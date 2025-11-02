import slugify from "slugify";

const formatPageUrl = function (fileSlug) {
  let slug = slugify(fileSlug, "_");
  slug = slug.charAt(0).toUpperCase() + slug.slice(1);
  return `/wiki/${slug}/`;
};

const sortCollectionByPageName = function (collection) {
  const r = collection.sort((a, b) =>
    a.data.title < b.data.title ? -1 : a.data.title > b.data.title ? 1 : 0,
  );
  console.log({ r });
  return r;
};

export { formatPageUrl, sortCollectionByPageName };
