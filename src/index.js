import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import axios from "axios";
import getName from "./paths.js";
import parseHTML from "./parseHTML.js";

const downloadPage = (paramUrl, paramDir = process.cwd()) => {
  const nameFileHTML = getName(paramUrl, "html");
  const nameDirContent = getName(paramUrl, "files");
  const pathToNewFile = path.join(paramDir, nameFileHTML);
  const pathToNewDir = path.join(paramDir, nameDirContent);
  const result = fsp
    .mkdir(paramDir, { recursive: true })
    .then(() => fsp.mkdir(pathToNewDir, { recursive: true }))
    .then(() => axios.get(paramUrl))
    .then((response) => response.data)
    .then((html) => parseHTML(html, pathToNewDir, nameDirContent, paramUrl))
    .then((newHtml) => fsp.writeFile(pathToNewFile, newHtml, "utf-8"))
    .then(() => pathToNewFile)
    .catch((error) => {
      throw error;
    });
  return result;
};

export default downloadPage;
