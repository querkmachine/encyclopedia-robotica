import slugify from "slugify";

/**
 * Create an array of all tags within a collection.
 *
 * @param {array} collection - Eleventy page collection.
 * @returns {array} - An array of tags found, as strings.
 */
const getAllTags = function (collection) {
  let tagSet = new Set();
  collection.getAll().forEach((item) => {
    (item.data.tags || []).forEach((tag) => tagSet.add(tag));
  });
  tagSet = filterCommonTags([...tagSet]);
  return tagSet.sort();
};

/**
 * Filter out common tags, such as those that apply to all pages.
 *
 * @param {array} tags - An array of tags, as strings.
 * @returns {array} - The array of tags, with common and repeated tags removed.
 */
const filterCommonTags = function (tags) {
  const filteredTags = ["all"];
  return (tags || []).filter((tag) => filteredTags.indexOf(tag) === -1);
};

/**
 * Create URL for a tag page from the tag name.
 *
 * @param {string} tagName - The tag name.
 * @returns {string} - URL for the given tag.
 */
const formatTagUrl = function (tagName) {
  const slug = slugify(tagName, "_");
  return `/category/${slug}/`;
};

export { getAllTags, formatTagUrl };
