import { expect, test, beforeEach, afterEach, beforeAll } from "vitest";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Buffer } from "node:buffer";
import nock from "nock";
import downloadPage from "../src/index.js";
import * as cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, "..", "__fixtures__", name);

const nameFile = "ru-hexlet-io-courses.html";
const nameDirRes = "ru-hexlet-io-courses_files";
const fakeImg = Buffer.from([0xff, 0x11]);
const nameFileImg = "ru-hexlet-io-assets-professions-nodejs.png";
const nameFileCss = "ru-hexlet-io-assets-application.css";
const nameFileJs = "ru-hexlet-io-packs-js-runtime.js";

let content;
let contentAbs;
beforeAll(async () => {
  nock.disableNetConnect();
  content = await fs.readFile(getFixturePath("unparsHTML"), "utf-8");
  contentAbs = await fs.readFile(getFixturePath("unparsAbsHTML"), "utf-8");
});

let nameDir;
beforeEach(async () => {
  nameDir = await fs.mkdtemp(path.join(os.tmpdir(), "page-loader-"));
});

test("getHtml", async () => {
  nock("https://ru.hexlet.io").get("/courses").reply(200, content);
  nock("https://ru.hexlet.io").get("/assets/professions/nodejs.png").reply(200, fakeImg);

  const resultDownloadPage = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(resultDownloadPage, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const contentPNG = await fs.readFile(path.join(nameDir, nameDirRes, nameFileImg));
  const contentResult = await fs.readFile(getFixturePath("expectHTML"), "utf-8");

  expect(resultDownloadPage).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(fakeImg).toEqual(contentPNG);
  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentResult).html());
  expect(nock.isDone()).toBe(true);
});

test("getHTML with absolute url", async () => {
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentAbs);
  nock("https://ru.hexlet.io").get("/assets/professions/nodejs.png").reply(200, fakeImg);

  const resultDownloadPage = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(resultDownloadPage, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const contentPNG = await fs.readFile(path.join(nameDir, nameDirRes, nameFileImg));
  const contentResult = await fs.readFile(getFixturePath("expectHTML"), "utf-8");

  expect(resultDownloadPage).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(fakeImg).toEqual(contentPNG);
  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentResult).html());
  expect(nock.isDone()).toBe(true);
});

test("getHTML with foreign hostname", async () => {
  const contentForeignHostname = await fs.readFile(getFixturePath("unparsHTMLforeign"), "utf-8");
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentForeignHostname);

  const resultDownloadPage = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(resultDownloadPage, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const listContentFiles = await fs.readdir(path.join(nameDir, nameDirRes));

  expect(resultDownloadPage).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(listContentFiles.sort()).toEqual([]);
  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentForeignHostname).html());
  expect(nock.isDone()).toBe(true);
});

test("getHTML with img not have src", async () => {
  const contentNotSrc = await fs.readFile(getFixturePath("unparsHTMLNull"), "utf-8");
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentNotSrc);

  const resultDownloadPage = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(resultDownloadPage, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const listContentFiles = await fs.readdir(path.join(nameDir, nameDirRes));

  expect(resultDownloadPage).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(listContentFiles.sort()).toEqual([]);
  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentNotSrc).html());
  expect(nock.isDone()).toBe(true);
});

test("getHTML with different contents", async () => {
  const contentDiffCont = await fs.readFile(getFixturePath("unparse-page-contents.html"), "utf-8");
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentDiffCont);
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentDiffCont);
  nock("https://ru.hexlet.io").get("/assets/professions/nodejs.png").reply(200, fakeImg);
  nock("https://ru.hexlet.io").get("/assets/application.css").reply(200, "OK");
  nock("https://ru.hexlet.io").get("/packs/js/runtime.js").reply(200, "OK");

  const resultDownloadPage = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(resultDownloadPage, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const listContentOfDirRes = await fs.readdir(path.join(nameDir, nameDirRes));
  const contentPNG = await fs.readFile(path.join(nameDir, nameDirRes, nameFileImg));
  const contentCss = await fs.readFile(path.join(nameDir, nameDirRes, nameFileCss), "utf-8");
  const contentJs = await fs.readFile(path.join(nameDir, nameDirRes, nameFileJs), "utf-8");
  const contentHtml = await fs.readFile(path.join(nameDir, nameDirRes, nameFile), "utf-8");
  const contentResult = await fs.readFile(getFixturePath("expect-page-after-parse.html"), "utf-8");

  expect(resultDownloadPage).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(listContentOfDirRes.sort()).toEqual(
    [nameFile, nameFileImg, nameFileCss, nameFileJs].sort(),
  );

  expect(fakeImg).toEqual(contentPNG);
  expect(cheerio.load(contentHtml).html()).toBe(cheerio.load(contentDiffCont).html());
  expect(contentCss).toBe("OK");
  expect(contentJs).toBe("OK");

  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentResult).html());
  expect(nock.isDone()).toBe(true);
});

test("getHTML with error in response", async () => {
  nock("https://ru.hexlet.io").get("/courses").reply(404);

  await expect(downloadPage("https://ru.hexlet.io/courses", nameDir)).rejects.toThrow();
  const listContentOfDir = await fs.readdir(nameDir);
  expect(listContentOfDir.sort()).toEqual([nameDirRes]);
  const listContentOfDirRes = await fs.readdir(path.join(nameDir, nameDirRes));
  expect(listContentOfDirRes.sort()).toEqual([]);
  expect(nock.isDone()).toBe(true);
});

test("getHTML with error in request", async () => {
  nock("https://ru.hexlet.io")
    .get("/courses")
    .replyWithError(Object.assign(new Error("Connection refused"), { code: "ECONNREFUSED" }));

  await expect(downloadPage("https://ru.hexlet.io/courses", nameDir)).rejects.toMatchObject({
    code: "ECONNREFUSED",
  });
  const listContentOfDir = await fs.readdir(nameDir);
  expect(listContentOfDir.sort()).toEqual([nameDirRes]);
  const listContentOfDirRes = await fs.readdir(path.join(nameDir, nameDirRes));
  expect(listContentOfDirRes.sort()).toEqual([]);
  expect(nock.isDone()).toBe(true);
});

test("getHTML with error in permission", async () => {
  await fs.chmod(nameDir, 0o100);
  await expect(downloadPage("https://ru.hexlet.io/courses", nameDir)).rejects.toMatchObject({
    code: "EACCES",
  });
});

test("getHTML with error in response download resourse", async () => {
  const contentDiffCont = await fs.readFile(getFixturePath("unparse-page-contents.html"), "utf-8");
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentDiffCont);
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentDiffCont);
  nock("https://ru.hexlet.io").get("/assets/professions/nodejs.png").reply(200, fakeImg);
  nock("https://ru.hexlet.io").get("/assets/application.css").reply(404);
  nock("https://ru.hexlet.io").get("/packs/js/runtime.js").reply(200, "OK");

  await expect(downloadPage("https://ru.hexlet.io/courses", nameDir)).rejects.toThrow();
  const listContentOfDir = await fs.readdir(nameDir);
  expect(listContentOfDir.sort()).toEqual([nameDirRes]);
  expect(nock.isDone()).toBe(true);
});

afterEach(async () => {
  await fs.chmod(nameDir, 0o755);
  await fs.rm(nameDir, { recursive: true, force: true });
  nock.cleanAll();
});
