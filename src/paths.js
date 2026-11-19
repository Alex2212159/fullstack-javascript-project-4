import path from "node:path";

const getName = (fullUrl, ext = "extension") => {
  const myURL = new URL(fullUrl);

  const pathName = myURL.pathname;

  const value = path.extname(pathName);

  const baseName = value ? pathName.slice(0, -value.length) : myURL.pathname;

  const partsURL = myURL.hostname + baseName;

  const re = /[^0-9a-zA-Z]/g;

  const result = partsURL.replace(re, "-");

  const type = {
    html: ".html",
    files: "_files",
    extension: value,
  };

  const resultExt = type[ext] ? type[ext] : type.html;

  return result + resultExt;
};

export default getName;
