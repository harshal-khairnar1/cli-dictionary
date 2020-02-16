#!/usr/bin/env node

require("dotenv").config();
const fetch = require("../utils/httpService");
const argv = require("../utils/argvOptions");
const chalk = require("chalk");

const log = console.log;

// show definition of a given word
if (argv._[0] === "defn") {
    console.log(argv._)
}

// show syn of a given word
if (argv._[0] === "syn") {
}

// show ant of a given word
if (argv._[0] === "ant") {
}

// show example of a given word
if (argv._[0] === "ex") {
}

// show full dictionary of a given word [definition, syn, ant]
if (!["defn", "syn", "ant", "ex", "play"].includes(argv._[0])) {
}

// show full dictionary of a random word [definition, syn, ant]
if (argv._.length === 0) {
}

// guess the word based on
if (argv._[0] === "play") {
}
