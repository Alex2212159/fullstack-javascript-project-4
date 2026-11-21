import * as cheerio from "cheerio";
import fsp from "node:fs/promises";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("axios-debug-log");
const axios = require("axios");
import path from "node:path";
import getName from "./paths.js";
import debug from "debug";

const logParse = debug("page-loader:parseHTML");

const getSource = ($, tag, source, pageUrl) => {
  const result = [];
  $(tag).each((_i, element) => {
    const $item = $(element);
    const sourceValue = $item.attr(source);
    if (!sourceValue) {
      return;
    }
    const itemHost = new URL(sourceValue, pageUrl).hostname;
    const pageHost = new URL(pageUrl).hostname;
    if (itemHost === pageHost || itemHost.endsWith("." + pageHost)) {
      result.push(sourceValue);
    }
  });
  return result;
};

const getResponse = (arrayLink, pathToDir, nameDir, url) => {
  const request = (link) => {
    const fullLink = new URL(link, url);
    const fullPath = path.join(pathToDir, getName(fullLink));
    const pathToFileHtml = path.join(nameDir, getName(fullLink));

    logParse("request sent: %s", fullLink);
    return axios
      .get(fullLink, { responseType: "arraybuffer" })
      .then((response) => {
        logParse("response status: %s", response.status);
        return fsp.writeFile(fullPath, response.data);
      })
      .then(() => {
        logParse("response written in dir: %s", nameDir);
        return { addressUrl: link, pathtoFile: pathToFileHtml };
      })
      .catch((error) => {
        logParse("error in process: %s", error.message);
        return null;
      });
  };
  const promises = arrayLink.map(request);
  return Promise.all(promises).then((resp) => resp.filter((elem) => elem !== null));
};

const parseHTML = (content, pathToDir, nameDir, baseUrl) => {
  const $ = cheerio.load(content);
  const linksImg = getSource($, "img", "src", baseUrl);
  const linksLink = getSource($, "link", "href", baseUrl);
  const linksScript = getSource($, "script", "src", baseUrl);

  logParse("get value src images: %s", linksImg.length);
  logParse("get value href links: %s", linksLink.length);
  logParse("get value src scripts: %s", linksScript.length);

  return getResponse(linksImg, pathToDir, nameDir, baseUrl)
    .then((responses) => {
      responses.forEach(({ addressUrl, pathtoFile }) => {
        $("img[src]").each((_, el) => {
          const $el = $(el);
          if ($el.attr("src") === addressUrl) {
            logParse("full images url changed on: %s", pathtoFile);
            $el.attr("src", pathtoFile);
          }
        });
      });
    })
    .then(() => getResponse(linksLink, pathToDir, nameDir, baseUrl))
    .then((responses) => {
      responses.forEach(({ addressUrl, pathtoFile }) => {
        $("link[href]").each((_, el) => {
          const $el = $(el);
          if ($el.attr("href") === addressUrl) {
            logParse("full links url changed on: %s", pathtoFile);
            $el.attr("href", pathtoFile);
          }
        });
      });
    })
    .then(() => getResponse(linksScript, pathToDir, nameDir, baseUrl))
    .then((responses) => {
      responses.forEach(({ addressUrl, pathtoFile }) => {
        $("script[src]").each((_, el) => {
          const $el = $(el);
          if ($el.attr("src") === addressUrl) {
            logParse("full script url changed on: %s", pathtoFile);
            $el.attr("src", pathtoFile);
          }
        });
      });
      return $.html();
    });
};

export default parseHTML;
