import paths from "../paths.js";

import { mkdir, writeFile } from "node:fs/promises";
import { glob } from "glob";
import * as sass from "sass";
import postcss from "postcss";
import postcssPresetEnv from "postcss-preset-env";
import postcssCssNano from "cssnano";

const compileStylesheets = async function () {
  const files = await glob(`${paths.srcSass}/**/*.scss`, {
    ignore: `${paths.srcSass}/**/_*.scss`,
  });
  for await (const file of files) {
    const filenameParts = file.split("/");
    const filename = filenameParts[filenameParts.length - 1].replace(
      ".scss",
      ".css",
    );
    const fileDirectory =
      filenameParts[filenameParts.length - 2] !== "_sass"
        ? paths.outputSass + "/" + filenameParts[filenameParts.length - 2]
        : paths.outputSass;

    let css = compileSassFile(file);
    css = await transformCss(css);

    await mkdir(fileDirectory, {
      recursive: true,
    });
    await writeFile(`${fileDirectory}/${filename}`, css);
  }
};

const compileSassFile = function (file) {
  const result = sass.compile(file, {
    sourceMap: false,
    outputStyle: "expanded",
  });
  return result.css.toString();
};

const transformCss = async function (css) {
  return postcss([postcssPresetEnv, postcssCssNano])
    .process(css, { from: undefined })
    .then(async (result) => result.css);
};

export { compileStylesheets };
