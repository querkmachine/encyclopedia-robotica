/**
 * Create an array of all categories within a collection.
 *
 * @param {array} collection - Eleventy page collection.
 * @returns {array} - An array of categories found, as strings.
 */
const getAllCategories = function (collection) {
  let categories = new Set();
  collection.getAll().forEach((item) => {
    (item.data.categories || []).forEach((cat) => categories.add(cat));
  });
  categories = filterCommonCategories([...categories]);
  return categories.sort();
};

/**
 * Filter out common categories, such as those that apply to all pages.
 *
 * @param {array} tags - An array of categories, as strings.
 * @returns {array} - The array of categories, with common and repeated tags removed.
 */
const filterCommonCategories = function (categories) {
  const filteredCategories = ["all"];
  return (categories || []).filter(
    (cat) => filteredCategories.indexOf(cat) === -1,
  );
};

export { getAllCategories };
