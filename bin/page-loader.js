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
      .then((data) => console.log(data))
      .catch((error) => console.error(`Ошибка: ${error.message}`));
    return result;
  });

program.parse();
