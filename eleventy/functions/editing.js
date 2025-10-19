import path from "../paths.js";

import { parseISO, format } from "date-fns";

/**
 * Formats and prepends the page filepath with the git repo to create a direct
 * link to the file in source control.
 *
 * @param {String} filepath - The local filepath
 * @returns {String} - The absolute URL to the file in source control
 */
const gitEditUrl = function (filepath) {
  return path.gitEditingPath + filepath.slice(2);
};

/**
 * Formats and prepends the page filepath with the git repo to create a direct
 * link to the file's history in source control.
 *
 * @param {String} filepath - The local filepath
 * @returns {String} - The absolute URL to the file's history in source control
 */
const gitHistoryUrl = function (filepath) {
  return path.gitHistoryPath + filepath.slice(2);
};

/**
 * Formats a date object into a date and time
 *
 * @param {Date} date - JavaScript date object
 * @returns {String} - Formatted version of the date and time
 */
const gitEditDate = function (date) {
  return format(date, "d MMMM y; kk:mm:ss z");
};

export { gitEditUrl, gitHistoryUrl, gitEditDate };
