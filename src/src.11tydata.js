export default function () {
  return {
    // Set default layout for all pages
    layout: "default.njk",

    // Use the date this file was last modified in git, otherwise uses the file system date
    // https://www.11ty.dev/docs/dates/
    date: "git Last Modified",
  };
}
