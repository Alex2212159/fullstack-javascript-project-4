#!/usr/bin/env node

import { Command } from "commander";
import process from "node:process";
import downloadPage from "../src/index.js";
const program = new Command();

program
  .description("downloads web pages and saves to the computer")
  .version("1.0.0")
  .option("-o --output [dir]", "output dir", process.cwd())
  .argument("<url>")
  .action((arg, options) => {
    const result = downloadPage(arg, options.output)
      .then((data) => {
        console.log(`Page was succesfully downloaded into '${data}'`);
      })
      .catch((error) => {
        const failedUrl = error.config?.url || arg;

        if (error.code === "EACCES") {
          console.error(
            `Ошибка (доступ запрещен): была предпринята попытка доступа к файлу способом, запрещенным его правами доступа: ${error.code}`,
          );
        } else if (error.code === "ENOENT") {
          console.error(
            `Ошибка (нет такого файла или каталога): по заданному пути не удалось найти ни один объект (файл или каталог): ${error.code}`,
          );
        } else if (error.response) {
          console.error(
            `Ошибка загрузки страницы по указанному url ${failedUrl}, статус: ${error.response.status}`,
          );
        } else if (error.request) {
          console.error(
            `Ошибка: запрос был отправлен ${failedUrl}, но ответ от сервера так и не получен`,
          );
        } else {
          console.error(
            `Ошибка загрузки страницы по указанному url ${failedUrl}: ${error.message}`,
          );
        }
        process.exit(1);
      });

    return result;
  });

/*
import { Command } from "commander";
import process from "node:process";
import downloadPage from "../src/index.js";
const program = new Command();

program
  .description("downloads web pages and saves to the computer")
  .version("1.0.0")
  .option("-o --output [dir]", "output dir", process.cwd())
  .argument("<url>")
  .action((arg, options) => {
    const result = downloadPage(arg, options.output)
      .then((data) => {
        console.log(`Page was succesfully downloaded into '${data.path}'`);

        if (data.errors.length !== 0) {
          const message = data.errors;
          message.forEach(({ error }) => {
            console.error(
              `Возникла ошибка: ${error.message} при загрузке с ресурса: ${error.linkName}`,
            );
          });
        }
      })
      .catch((error) => {
        if (error.code === "EACCES") {
          console.error(
            `Ошибка (доступ запрещен): была предпринята попытка доступа к файлу способом, запрещенным его правами доступа: ${error.code}`,
          );
        } else if (error.code === "ENOENT") {
          console.error(
            `Ошибка (нет такого файла или каталога): по заданному пути не удалось найти ни один объект (файл или каталог): ${error.code}`,
          );
        } else if (error.response) {
          console.error(
            `Ошибка загрузки страницы по указанному url, статус: ${error.response.status}`,
          );
        } else if (error.request) {
          console.error(
            `Ошибка: запрос был отправлен, но ответ от сервера так и не получен: ${error.request}`,
          );
        } else {
          console.error(`Ошибка загрузки страницы: ${error.code}`);
        }
        process.exit(1);
      });
    return result;
  });

program.parse();
*/

program.parse();
