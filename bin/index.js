#!/usr/bin/env node

require("dotenv").config();
const fetch = require("../utils/httpService");
const argv = require("../utils/argvOptions");
const chalk = require("chalk");
const boxen = require("boxen");
const ora = require("ora");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const log = console.log;

const command = argv._[0];
const word = argv._[1];

let cnt = 0;

//--------------------------------------------------------------

async function main(command, word) {
  try {
    if (!["defn", "syn", "ant", "ex", "play"].includes(command)) {
      if (!command) {
        // show full dictionary of a random word
        await fullDictOfRadomWord();
        process.exit(0);
      } else {
        // show full dictionary of a given word
        await fullDictOfWord(command);
        process.exit(0);
      }
    } else {
      if (!word && command !== "play") {
        log(
          `Insufficient arguments\nplease try --help to know more about command`
        );
        process.exit(1);
      } else {
        switch (command) {
          case "defn":
            await getDefinition(word);
            process.exit(0);
            break;

          case "syn":
            await getSynonyms(word);
            process.exit(0);
            break;

          case "ant":
            await getAntonyms(word);
            process.exit(0);
            break;

          case "ex":
            await getExamples(word);
            process.exit(0);
            break;

          case "play":
            letsPlay();
            break;
        }
      }
    }
  } catch (e) {
    log("unable to fetch from dictionary");
    process.exit(1);
  }
}

main(command, word);

//--------------------------------------------------------------

/* function getDefinition(word) {
  reqData(`/word/${word}/definitions`, "definitions")
    .then(result => {
      printDefinition(result);
      if (shouldExit) process.exit(0);
      else return Promise.resolve();
    })
    .catch(err => {
      log(err);
      if (shouldExit) process.exit(1);
      else return Promise.reject();
    });
}
 */
function getDefinition(word) {
  return new Promise(async (resolve, reject) => {
    try {
      const spinner = ora("loading definition").start();
      const result = await reqData(`/word/${word}/definitions`, "definitions");
      spinner.stop();
      printDefinition(result);
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

/* function getSynonyms(word, shouldExit) {
  reqData(`/word/${word}/relatedWords`, "synonyms")
    .then(result => {
      printRelatedWord(result, "synonym");
      if (shouldExit) process.exit(0);
      else return Promise.resolve();
    })
    .catch(err => {
      log(err);
      if (shouldExit) process.exit(1);
      else return Promise.reject();
    });
} */
function getSynonyms(word) {
  return new Promise(async (resolve, reject) => {
    try {
      const spinner = ora("loading synonyms").start();
      const result = await reqData(`/word/${word}/relatedWords`, "synonyms");
      spinner.stop();
      printRelatedWord(result, "synonym");
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

/* function getAntonyms(word, shouldExit) {
  reqData(`/word/${word}/relatedWords`, "antonyms")
    .then(result => {
      printRelatedWord(result, "antonym");
      if (shouldExit) process.exit(0);
      else return Promise.resolve();
    })
    .catch(err => {
      log(err);
      if (shouldExit) process.exit(1);
      else return Promise.reject();
    });
} */
function getAntonyms(word) {
  return new Promise(async (resolve, reject) => {
    try {
      const spinner = ora("loading antonyms").start();
      const result = await reqData(`/word/${word}/relatedWords`, "antonyms");
      spinner.stop();
      printRelatedWord(result, "antonym");
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

/* function getExamples(word, shouldExit) {
  reqData(`/word/${word}/examples`, "examples")
    .then(result => {
      printExamples(result);
      if (shouldExit) process.exit(0);
      else return Promise.resolve();
    })
    .catch(err => {
      log(err);
      if (shouldExit) process.exit(1);
      else return Promise.reject();
    });
} */
function getExamples(word) {
  return new Promise(async (resolve, reject) => {
    try {
      const spinner = ora("loading examples").start();
      const result = await reqData(`/word/${word}/examples`, "examples");
      spinner.stop();
      printExamples(result);
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

async function jumbleWord(word) {}

/* function letsPlay() {
  let word = null;
  log(chalk.italic(`let's play:\n`));
  reqData(`/words/randomWord`)
    .then(result => {
      word = result.data && result.data.word;
      word = "single";
      if (word) {
        play(word);
      } else {
        return Promise.reject("err");
      }
    })
    .catch(err => {
      console.log("!!!!!!!!!", err);
      log(`sorry can't play now. dictionary unavailable`);
      process.exit(1);
    });
} */
function letsPlay() {
  return new Promise(async (resolve, reject) => {
    try {
      //   const spinner = ora("loading...").start();
      const result = await reqData(`/words/randomWord`);
      //   spinner.stop();
      let word = result.data && result.data.word;
      //   word = "single";
      if (word) {
        await play(word);
        log(word);
        return resolve();
      } else {
        return reject(`dictionary unavailable`);
      }
    } catch (e) {
      return reject(`sorry can't play now. dictionary unavailable`);
    }
  });
}

/* async function fullDictOfWord(word) {
  log(`\n${chalk.bold.italic.underline("word")} : ${word}\n`);

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
      process.exit(1);
    });
}
 */
function fullDictOfWord(word) {
  return new Promise(async (resolve, reject) => {
    try {
      log(`\n${chalk.bold.italic.underline("word")} : ${word}\n`);
      /* const definitions = await reqData(
        `/word/${word}/definitions`,
        "definitions"
      );
      printDefinition(definitions); */
      await getDefinition(word);

      /* const examples = await reqData(`/word/${word}/examples`, "examples");
	  printExamples(examples); */
      await getExamples(word);

      /* const synonyms = await reqData(`/word/${word}/relatedWords`, "synonyms");
	  printRelatedWord(synonyms, "synonym"); */
      await getSynonyms(word);

      /* const antonyms = await reqData(`/word/${word}/relatedWords`, "antonyms");
	  printRelatedWord(antonyms, "antonym"); */
      await getAntonyms(word);

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

/* async function fullDictOfRadomWord() {
  reqData(`/words/randomWord`)
    .then(result => {
      const word = result.data && result.data.word;
      log(`\n${chalk.bold.italic.underline("word")} : ${word}\n`);
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
} */
function fullDictOfRadomWord() {
  return new Promise(async (resolve, reject) => {
    try {
      const spinner = ora("loading...").start();
      const result = await reqData(`/words/randomWord`);
      spinner.stop();
      const word = result.data && result.data.word;
      if (word) {
        await fullDictOfWord(word);
        return resolve();
      } else {
        return reject(`can't fetch a random word`);
      }
    } catch (e) {
      return reject(e);
    }
  });
}

//--------------------------------------------------------------

function getHints(word) {
  return new Promise(async (resolve, reject) => {
    try {
      const hintsOption = [getDefinition, getSynonyms, getAntonyms];
      const randomHint = Math.round((Math.random() * 10) % 2);

      console.log("randomHint", randomHint);
      await hintsOption[randomHint](word, false);

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

function play(word) {
  return new Promise(async (resolve, reject) => {
    try {
      await getHints(word);
      await mainQ(word);
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

function askQuestion(word) {
  return new Promise(async (resolve, reject) => {
    try {
      rl.question(
        `\nGuess the word ${(cnt > 0 && "again") || ""}?\nYour answer : `,
        function(answer) {
          log("ans==>", answer);
          cnt++;
          if (answer.trim().toLowerCase() == word.toLowerCase()) {
            console.log("\nYeah, you guessed the right word!");
            return resolve(true);
          } else {
            return resolve(false);
          }
        }
      );
    } catch (e) {
      return reject(e);
    }
  });
}

/* function mainQ(word) {
  getHints(word)
    .then(res => {
      console.log("===>", res);
      askQuestion(word, answer => {
        if (answer) {
          rl.close();
        } else {
          if (cnt === 3) {
            console.log(
              `\nIncorrect answer again, lifeline exausted!\n\nquiting now.`
            );
            rl.close();
          } else {
            choices(word);
          }
        }
      });
    })
    .catch(e => {
      console.log("***", e);
      log("Sorry,play interrupted. somthing went wrong!");
    });
} */
function mainQ(word) {
  return new Promise(async (resolve, reject) => {
    try {
      const answer = await askQuestion(word);
      if (answer) {
        rl.close();
        return resolve();
      } else {
        if (cnt === 3) {
          log(`\nIncorrect answer again, lifeline exausted!\n\nquiting now.`);
          rl.close();
          return resolve();
        } else {
          await choices(word);
          return resolve();
        }
      }
    } catch (e) {
      return reject(`Sorry,play interrupted. somthing went wrong!`);
    }
  });
}

function choices(word) {
  return new Promise(async (resolve, reject) => {
    try {
      log(`\nOh no, incorrect answer!`);
      rl.question(
        `
        \nYour choices:
    1. Try again
    2. Hint
    3. Quit
    
select : `,
        async function(choice) {
          if (choice == "3") {
            rl.close();
            return resolve();
          } else if (choice == "1") {
            await mainQ(word);
            return resolve();
          } else if (choice == "2") {
            console.log("\nYour Hint: ");
            await getHints(word);
            await mainQ(word);
            return resolve();
          } else {
            console.log(`\nInvalid choice`);
            rl.close();
            return resolve();
          }
        }
      );
    } catch (e) {
      return reject(e);
    }
  });
}

// main();

rl.on("close", function() {
  console.log("\nBye Bye !!!");
  process.exit(0);
});

//----------------------------------------------------------------
// To fetch data from API

async function reqData(endPoint, type) {
  try {
    const result = await fetch(endPoint);
    return Promise.resolve(result);
  } catch (e) {
    return Promise.reject(`can't fetch ${type} of word`);
  }
}

//----------------------------------------------------------------
// Formatting & printing results of commands

function printDefinition(result) {
  const definitions = Array.isArray(result.data) && result.data.slice(0, 3);

  definitions.length > 0 &&
    log(chalk.bgWhiteBright.black.bold.underline("\ndefinition: "));

  definitions.length > 0 &&
    definitions.forEach(d => {
      d && d.text && log(`* ${d.text}`);
    });
  log("");
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
  log("");
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
  log("");
}
