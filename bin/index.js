#!/usr/bin/env node

require('dotenv').config();
const fetch = require('../utils/httpService');
const argv = require('../utils/argvOptions');
const chalk = require('chalk');
const boxen = require('boxen');
// const ora = require('ora');
const readline = require('readline');
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
		if (!['defn', 'syn', 'ant', 'ex', 'play'].includes(command)) {
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
			if (!word && command !== 'play') {
				log(`Insufficient arguments\nplease try --help to know more about command`);
				process.exit(1);
			} else {
				switch (command) {
					case 'defn':
						await getDefinition(word);
						process.exit(0);
						break;

					case 'syn':
						await getSynonyms(word);
						process.exit(0);
						break;

					case 'ant':
						await getAntonyms(word);
						process.exit(0);
						break;

					case 'ex':
						await getExamples(word);
						process.exit(0);
						break;

					case 'play':
						await play();
						break;
				}
			}
		}
	} catch (e) {
		log('unable to fetch from dictionary');
		process.exit(1);
	}
}

main(command, word);

//--------------------------------------------------------------

function getDefinition(word) {
	return new Promise(async (resolve, reject) => {
		// const spinner = ora('loading definition').start();
		try {
			const result = await reqData(`/word/${word}/definitions`, 'definitions');
			// spinner.stop();
			printDefinition(result);
			return resolve();
		} catch (e) {
			// spinner.stop();
			return reject(e);
		}
	});
}

function getSynonyms(word) {
	return new Promise(async (resolve, reject) => {
		// const spinner = ora('loading synonyms').start();
		try {
			const result = await reqData(`/word/${word}/relatedWords`, 'synonyms');
			// spinner.stop();
			printRelatedWord(result, 'synonym', true);
			return resolve();
		} catch (e) {
			// spinner.stop();
			return reject(e);
		}
	});
}

function getAntonyms(word) {
	return new Promise(async (resolve, reject) => {
		// const spinner = ora('loading antonyms').start();
		try {
			const result = await reqData(`/word/${word}/relatedWords`, 'antonyms');
			// spinner.stop();
			printRelatedWord(result, 'antonym', false);
			return resolve();
		} catch (e) {
			// spinner.stop();
			return reject(e);
		}
	});
}

function getExamples(word) {
	return new Promise(async (resolve, reject) => {
		// const spinner = ora('loading examples').start();
		try {
			const result = await reqData(`/word/${word}/examples`, 'examples');
			// spinner.stop();
			printExamples(result);
			return resolve();
		} catch (e) {
			// spinner.stop();
			return reject(e);
		}
	});
}

function fullDictOfWord(word) {
	return new Promise(async (resolve, reject) => {
		try {
			log(`\n${chalk.bold.italic.underline('word')} : ${word}\n`);

			await getDefinition(word);

			await getExamples(word);

			await getSynonyms(word);

			await getAntonyms(word);

			return resolve();
		} catch (e) {
			return reject(e);
		}
	});
}

function fullDictOfRadomWord() {
	return new Promise(async (resolve, reject) => {
		try {
			// const spinner = ora('loading...').start();
			const result = await reqData(`/words/randomWord`);
			// spinner.stop();
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
// dictionary play

async function jumbleWord(word) {}

function getHints(word) {
	return new Promise(async (resolve, reject) => {
		try {
			const hintsOption = [getDefinition, getSynonyms, getAntonyms];
			const randomHint = Math.round((Math.random() * 10) % 2);

			log('\n', chalk.bold.white('Hint :'));
			await hintsOption[randomHint](word, false);
			return resolve();
		} catch (e) {
			return reject(e);
		}
	});
}

function askQuestion(word) {
	return new Promise((resolve, reject) => {
		try {
			rl.question(`Guess the word ${(cnt > 0 && 'again') || ''}?\nYour answer : `, function(answer) {
				cnt++;
				if (answer.trim().toLowerCase() == word.trim().toLowerCase()) {
					log('\n',chalk.green.bold('Yeah, you guessed the right word!'));
					return resolve(true);
				} else {
					return resolve(false);
				}
			});
		} catch (e) {
			return reject(e);
		}
	});
}

function play() {
	return new Promise(async (resolve, reject) => {
		try {
			log(chalk.italic(`let's play`));
			const result = await reqData(`/words/randomWord`);
			const word = result.data && result.data.word;

			await getHints(word);
			await mainQ(word);

			return resolve();
		} catch (e) {
			log(e);
			return reject(e);
		}
	});
}

function mainQ(word) {
	return new Promise(async (resolve, reject) => {
		try {
			const answer = await askQuestion(word);

			if (answer) {
				rl.close();
				return resolve();
			} else {
				if (cnt === 3) {
          log('\n');
          log(chalk.red.bold(`Incorrect answer again, lifeline exausted!`),`\n\nquiting now.`);
          log(chalk.bold('expected word was'), chalk.bold.green(word));
					rl.close();
					return resolve();
				} else {
					await choices(word);
					return resolve();
				}
			}
		} catch (e) {
			return reject(e);
		}
	});
}

function choices(word) {
	return new Promise((resolve, reject) => {
		try {
      log('\n');
			log(chalk.red.bold(`Oh no, incorrect answer!`));
			rl.question(
				`
        \n${chalk.bold.white('Your choices:')}
    1. Try again
    2. Hint
    3. Quit
    
${chalk.bold.white('select :')} `,
				async function(choice) {
					if (choice == '3') {
						rl.close();
						return resolve();
					} else if (choice == '1') {
						await mainQ(word);
						return resolve();
					} else if (choice == '2') {
						await getHints(word);
						await mainQ(word);
						return resolve();
					} else {
						log(`\nInvalid choice`);
						rl.close();
					}
				}
			);
		} catch (e) {
			return reject(e);
		}
	});
}

rl.on('close', function() {
	log('\n',chalk.italic('bye bye !!!'));
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

	definitions.length > 0 && log(chalk.bgWhiteBright.black.bold.underline('\ndefinition: '));

	definitions.length > 0 &&
		definitions.forEach(d => {
			d && d.text && log(`* ${d.text}`);
		});
	log('');
}

function printRelatedWord(result, relationshipType, shouldExit) {
	const relatedWords = Array.isArray(result.data) && result.data.filter(d => d.relationshipType == relationshipType);

	relatedWords.length > 0 &&
		Array.isArray(relatedWords[0].words) &&
		relatedWords[0].words.length > 0 &&
		log(chalk.bgWhiteBright.black.underline(`\n${shouldExit ? 'related word' : relationshipType}s: `));

	relatedWords.length > 0 &&
		Array.isArray(relatedWords[0].words) &&
		relatedWords[0].words.length > 0 &&
		relatedWords[0].words.forEach(s => {
			s && log(`* ${s}`);
		});

	!shouldExit && relatedWords.length == 0 && printDefinition(result, 'synonym', true);

	log('');
}

function printExamples(result) {
	const examples = Array.isArray(result.data.examples) && result.data.examples.slice(0, 3);

	examples.length > 0 && log(chalk.bgWhiteBright.black.underline('\nExamples: '));

	examples.length > 0 &&
		examples.forEach(ex => {
			ex && ex.text && log(`* ${ex.text}`);
		});
	log('');
}
