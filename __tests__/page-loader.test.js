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

let content;
let contentAbs;
beforeAll(async () => {
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

  const pathToFileResult = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(pathToFileResult, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const contentPNG = await fs.readFile(path.join(nameDir, nameDirRes, nameFileImg));
  const contentResult = await fs.readFile(getFixturePath("expectHTML"), "utf-8");

  expect(pathToFileResult).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(fakeImg).toEqual(contentPNG);
  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentResult).html());
  expect(nock.isDone()).toBe(true);
});

test("getHTML with absolute url", async () => {
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentAbs);
  nock("https://ru.hexlet.io").get("/assets/professions/nodejs.png").reply(200, fakeImg);

  const pathToFileResult = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(pathToFileResult, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const contentPNG = await fs.readFile(path.join(nameDir, nameDirRes, nameFileImg));
  const contentResult = await fs.readFile(getFixturePath("expectHTML"), "utf-8");

  expect(pathToFileResult).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(fakeImg).toEqual(contentPNG);
  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentResult).html());
  expect(nock.isDone()).toBe(true);
});

test("getHTML with subdomain", async () => {
  const nameImg = "test-ru-hexlet-io-assets-professions-nodejs.png";
  const contentWithSubdomain = await fs.readFile(getFixturePath("unparsHTMLSubdomain"), "utf-8");
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentWithSubdomain);
  nock("https://test.ru.hexlet.io").get("/assets/professions/nodejs.png").reply(200, fakeImg);

  const pathToFileResult = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(pathToFileResult, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const contentPNG = await fs.readFile(path.join(nameDir, nameDirRes, nameImg));
  const contentResult = await fs.readFile(getFixturePath("expectHTMLSubdomain"), "utf-8");

  expect(pathToFileResult).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(fakeImg).toEqual(contentPNG);
  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentResult).html());
  expect(nock.isDone()).toBe(true);
});

test("getHTML with foreign hostname", async () => {
  const contentForeignHostname = await fs.readFile(getFixturePath("unparsHTMLforeign"), "utf-8");
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentForeignHostname);

  const pathToFileResult = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(pathToFileResult, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const listContentFiles = await fs.readdir(path.join(nameDir, nameDirRes));

  expect(pathToFileResult).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(listContentFiles.sort()).toEqual([]);
  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentForeignHostname).html());
  expect(nock.isDone()).toBe(true);
});

test("getHTML with img not have src", async () => {
  const contentNotSrc = await fs.readFile(getFixturePath("unparsHTMLNull"), "utf-8");
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentNotSrc);

  const pathToFileResult = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(pathToFileResult, "utf-8");
  const listContentOfDir = await fs.readdir(nameDir);
  const listContentFiles = await fs.readdir(path.join(nameDir, nameDirRes));

  expect(pathToFileResult).toBe(path.join(nameDir, nameFile));
  expect(listContentOfDir.sort()).toEqual([nameFile, nameDirRes].sort());
  expect(listContentFiles.sort()).toEqual([]);
  expect(cheerio.load(contentFile).html()).toBe(cheerio.load(contentNotSrc).html());
  expect(nock.isDone()).toBe(true);
});

afterEach(async () => {
  await fs.rm(nameDir, { recursive: true, force: true });
  nock.cleanAll();
});
