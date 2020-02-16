#!/usr/bin/env node

require("dotenv").config();
const fetch = require("../utils/httpService");
const argv = require("../utils/argvOptions");
const chalk = require("chalk");

const log = console.log;

const command = argv._[0];
const word = argv._[1];

async function main(command, word) {
  if (!["defn", "syn", "ant", "ex", "play"].includes(command)) {
    if (!command) {
      // show full dictionary of a random word
      fullDictOfRadomWord();
    } else {
      // show full dictionary of a given word
      fullDictOfWord(command);
    }
  } else {
    if (!word) {
      log(
        `Insufficient arguments\nplease try --help to know more about command`
      );
      process.exit(1);
    } else {
      switch (command) {
        case "defn":
          reqData(`/word/${word}/definitions`, "definitions")
            .then(result => {
              printDefinition(result);
            })
            .catch(err => {
              log(err);
            });
          break;
        case "syn":
          reqData(`/word/${word}/relatedWords`, "synonyms")
            .then(result => {
              printRelatedWord(result, "synonym");
              process.exit(0);
            })
            .catch(err => {
              log(err);
            });

          break;
        case "ant":
          reqData(`/word/${word}/relatedWords`, "antonyms")
            .then(result => {
              printRelatedWord(result, "antonym");
              process.exit(0);
            })
            .catch(err => {
              log(err);
            });
          break;
        case "ex":
          reqData(`/word/${word}/examples`, "examples")
            .then(result => {
              printExamples(result);
            })
            .catch(err => {
              log(err);
            });
          break;
        case "play":
          play();
          break;
      }
    }
  }
}

main(command, word);

async function reqData(endPoint, type) {
  try {
    const result = await fetch(endPoint);
    return Promise.resolve(result);
  } catch (e) {
    return Promise.reject(`can't fetch ${type} of word`);
  }
}

function printDefinition(result) {
  const definitions = Array.isArray(result.data) && result.data.slice(0, 3);

  definitions.length > 0 &&
    log(chalk.bgWhiteBright.black.bold.underline("\ndefinition: "));

  definitions.length > 0 &&
    definitions.forEach(d => {
      d && d.text && log(`* ${d.text}`);
    });
}

function printRelatedWord(result, relationshipType) {
  const relatedWords =
    Array.isArray(result.data) &&
    result.data.filter(d => d.relationshipType == relationshipType);

  relatedWords.length > 0 &&
    Array.isArray(relatedWords[0].words) &&
    relatedWords[0].words.length > 0 &&
    log(chalk.bgWhiteBright.black.underline(`\n${relationshipType}s: `));

  relatedWords.length > 0 &&
    Array.isArray(relatedWords[0].words) &&
    relatedWords[0].words.length > 0 &&
    relatedWords[0].words.forEach(s => {
      s && log(`* ${s}`);
    });
}

function printExamples(result) {
  const examples =
    Array.isArray(result.data.examples) && result.data.examples.slice(0, 3);

  examples.length > 0 &&
    log(chalk.bgWhiteBright.black.underline("\nExamples: "));

  examples.length > 0 &&
    examples.forEach(ex => {
      ex && ex.text && log(`* ${ex.text}`);
    });
}

//--------------------------------------------------------------

async function play() {}

async function fullDictOfWord(word) {
  reqData(`/word/${word}/definitions`, "definitions")
    .then(result => {
      printDefinition(result);
      return reqData(`/word/${word}/examples`, "examples");
    })
    .then(result => {
      printExamples(result);
      return reqData(`/word/${word}/relatedWords`, "synonyms");
    })
    .then(result => {
      printRelatedWord(result, "synonym");
      return reqData(`/word/${word}/relatedWords`, "antonyms");
    })
    .then(result => {
      printRelatedWord(result, "antonym");
      process.exit(0);
    })
    .catch(err => {
      log(err);
    });
}

async function fullDictOfRadomWord() {
  reqData(`/words/randomWord`)
    .then(result => {
      const word = result.data && result.data.word;
      if (word) {
        fullDictOfWord(word);
      } else {
        log(`can't fetch a random word`);
        process.exit(1);
      }
    })
    .catch(err => {
      log(err);
    });
}
