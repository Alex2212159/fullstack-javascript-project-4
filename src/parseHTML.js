import * as cheerio from "cheerio";
import fsp from "node:fs/promises";
import axios from "axios";
import path from "node:path";
import getName from "./paths.js";

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

const getResponse = (arrayLink, pathToDir, nameDir, url, typeRes = "text") => {
  const request = (link) => {
    const fullLink = new URL(link, url);
    const fullPath = path.join(pathToDir, getName(fullLink));
    const pathToFileHtml = path.join(nameDir, getName(fullLink));

    return axios
      .get(fullLink, { responseType: typeRes })
      .then((response) => fsp.writeFile(fullPath, response.data))
      .then(() => ({ addressUrl: link, pathtoFile: pathToFileHtml }))
      .catch(() => {
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

  return getResponse(linksImg, pathToDir, nameDir, baseUrl, "arraybuffer")
    .then((responses) => {
      responses.forEach(({ addressUrl, pathtoFile }) => {
        $("img[src]").each((_, el) => {
          const $el = $(el);
          if ($el.attr("src") === addressUrl) {
            $el.attr("src", pathtoFile);
          }
        });
      });
    })
    .then(() => getResponse(linksLink, pathToDir, nameDir, baseUrl, "arraybuffer"))
    .then((responses) => {
      responses.forEach(({ addressUrl, pathtoFile }) => {
        $("link[href]").each((_, el) => {
          const $el = $(el);
          if ($el.attr("href") === addressUrl) {
            $el.attr("href", pathtoFile);
          }
        });
      });
    })
    .then(() => getResponse(linksScript, pathToDir, nameDir, baseUrl, "arraybuffer"))
    .then((responses) => {
      responses.forEach(({ addressUrl, pathtoFile }) => {
        $("script[src]").each((_, el) => {
          const $el = $(el);
          if ($el.attr("src") === addressUrl) {
            $el.attr("src", pathtoFile);
          }
        });
      });
      return $.html();
    });
};

export default parseHTML;
