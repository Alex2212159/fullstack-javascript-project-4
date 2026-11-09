import { expect, test, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import nock from "nock";
import downloadPage from "../src/index.js";

const contentHTML = "body";
const nameFile = "ru-hexlet-io-courses.html";

let nameDir;

beforeEach(async () => {
  nameDir = await fs.mkdtemp(path.join(os.tmpdir(), "page-loader-"));
});

test("getHtml", async () => {
  nock("https://ru.hexlet.io").get("/courses").reply(200, contentHTML);

  const pathToFile = await downloadPage("https://ru.hexlet.io/courses", nameDir);
  const contentFile = await fs.readFile(pathToFile, "utf-8");

  expect(pathToFile).toBe(path.join(nameDir, nameFile));
  expect(contentFile).toBe(contentHTML);
});

afterEach(async () => {
  await fs.rm(nameDir, { recursive: true, force: true });
  nock.cleanAll();
});
