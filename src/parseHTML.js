import * as cheerio from "cheerio";
import fsp from "node:fs/promises";
import axios from "axios";
import path from "node:path";
import getName from "./paths.js";

const parseHTML = (content, pathToDir, nameDir, baseUrl) => {
  const links = [];
  const $ = cheerio.load(content);
  $("img").each((_i, element) => {
    const $item = $(element);
    links.push($item.attr("src"));
  });
  return getResponseImg(links, pathToDir, nameDir, baseUrl).then((responses) => {
    responses.forEach(({ htmlSrc, pathtoFile }) => {
      $(`img[src="${htmlSrc}"]`).attr("src", pathtoFile);
    });
    return $.html();
  });
};

const getResponseImg = (arrayLink, pathToDir, nameDir, url) => {
  const request = (link) => {
    const fullLink = new URL(link, url);
    const fullPathImg = path.join(pathToDir, getName(fullLink));
    const pathImgHtml = path.join(nameDir, getName(fullLink));

    return axios
      .get(fullLink, { responseType: "arraybuffer" })
      .then((response) => fsp.writeFile(fullPathImg, response.data))
      .then(() => ({ htmlSrc: link, pathtoFile: pathImgHtml }))
      .catch(() => null);
  };
  const promises = arrayLink.map(request);
  return Promise.all(promises).then((resp) => resp.filter((elem) => elem !== null));
};

export default parseHTML;
