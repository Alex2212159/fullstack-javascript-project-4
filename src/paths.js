import path from "node:path";

const getName = (fullUrl, ext = "img") => {
  const myURL = new URL(fullUrl);

  const pathName = myURL.pathname;
  const extension = path.extname(pathName);

  const baseName = extension ? pathName.slice(0, -extension.length) : myURL.pathname;

  const partsURL = myURL.hostname + baseName;

  const re = /[^0-9a-zA-Z]/g;

  const result = partsURL.replace(re, "-");

  const type = {
    html: ".html",
    files: "_files",
    img: extension,
  };
  return result + type[ext];
};

export default getName;
