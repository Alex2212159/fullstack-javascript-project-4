import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import getName from "./paths.js";
import parseHTML from "./parseHTML.js";
import debug from "debug";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("axios-debug-log");
const axios = require("axios");

const logIndex = debug("page-loader:index");

const downloadPage = (paramUrl, paramDir = process.cwd()) => {
  const nameFileHTML = getName(paramUrl, "html");
  const nameDirContent = getName(paramUrl, "files");
  const pathToNewFile = path.join(paramDir, nameFileHTML);
  const pathToNewDir = path.join(paramDir, nameDirContent);
  const result = fsp
    .mkdir(paramDir, { recursive: true })
    .then(() => {
      logIndex("dir create : %s", paramDir);
      return fsp.mkdir(pathToNewDir, { recursive: true });
    })
    .then(() => {
      logIndex("dir create : %s", nameDirContent);
      logIndex("request sent: %s", paramUrl);
      return axios.get(paramUrl);
    })
    .then((response) => {
      logIndex("response status: %s", response.status);
      return response.data;
    })
    .then((html) => {
      logIndex("get base html file");
      return parseHTML(html, pathToNewDir, nameDirContent, paramUrl);
    })
    .then((newHtml) => {
      logIndex("get new html for writing");
      return fsp.writeFile(pathToNewFile, newHtml, "utf-8");
    })
    .then(() => {
      logIndex("new html writed in dirr: %s", nameDirContent);
      return pathToNewFile;
    })
    .catch((error) => {
      logIndex("get error: %s", error.message);
      throw error;
    });
  return result;
};

export default downloadPage;
