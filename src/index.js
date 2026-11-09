import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import axios from "axios";
import getNameFile from "./paths.js";

const downloadPage = (paramUrl, paramDir = process.cwd()) => {
  const name = getNameFile(paramUrl);
  const pathToNewFile = path.join(paramDir, name);
  const result = fsp
    .mkdir(paramDir, { recursive: true })
    .then(() => axios.get(paramUrl))
    .then((response) => fsp.writeFile(pathToNewFile, response.data))
    .then(() => pathToNewFile)
    .catch((error) => {
      throw error;
    });
  return result;
};

export default downloadPage;
