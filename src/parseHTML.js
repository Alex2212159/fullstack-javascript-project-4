import * as cheerio from "cheerio";
import fsp from "node:fs/promises";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("axios-debug-log");
const axios = require("axios");
import path from "node:path";
import getName from "./paths.js";
import debug from "debug";
import Listr from "listr";

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
    if (itemHost === pageHost) {
      result.push(sourceValue);
    }
  });
  return result;
};

const getResponse = (arrayLink, pathToDir, nameDir, url) => {
  const responses = [];

  const uniqArrayLink = [...new Set(arrayLink)];

  const tasks = uniqArrayLink.map((link) => {
    const fullLink = new URL(link, url);
    const fullPath = path.join(pathToDir, getName(fullLink));
    const pathToFileHtml = path.join(nameDir, getName(fullLink));

    return {
      title: fullLink.href,
      task: () => {
        logParse("request sent: %s", fullLink);
        return axios
          .get(fullLink.href, { responseType: "arraybuffer" })
          .then((response) => {
            logParse("response status: %s", response.status);
            return fsp.writeFile(fullPath, response.data);
          })
          .then(() => {
            logParse("response written in dir: %s", nameDir);
            responses.push({ addressUrl: link, pathtoFile: pathToFileHtml });
          })
          .catch((error) => {
            logParse("error in process: %s", error.message);
            throw error;
          });
      },
    };
  });

  const listr = new Listr(tasks, { concurrent: true });
  return listr.run().then(() => ({ responses }));
};

const parseHTML = (content, pathToDir, nameDir, baseUrl) => {
  const $ = cheerio.load(content);
  const contentsTag = [
    { tag: "img", attr: "src" },
    { tag: "link", attr: "href" },
    { tag: "script", attr: "src" },
  ];

  const allLinks = contentsTag.flatMap(({ tag, attr }) => getSource($, tag, attr, baseUrl));
  logParse("get resources founded: %s", allLinks.length);

  return getResponse(allLinks, pathToDir, nameDir, baseUrl).then(({ responses }) => {
    responses.forEach(({ addressUrl, pathtoFile }) => {
      contentsTag.forEach(({ tag, attr }) => {
        $(`${tag}[${attr}]`).each((_, el) => {
          const $el = $(el);
          if ($el.attr(attr) === addressUrl) {
            logParse("url changed on: %s", pathtoFile);
            $el.attr(attr, pathtoFile);
          }
        });
      });
    });
    return $.html();
  });
};

export default parseHTML;
