#!/usr/bin/env node

require('dotenv').config();
const fetch = require('../utils/httpService');
const argv = require('../utils/argvOptions');
const chalk = require('chalk');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
const log = console.log;

const command = argv._[0];
const word = argv._[1];

let cnt =0;

//--------------------------------------------------------------

async function main(command, word) {
	if (!['defn', 'syn', 'ant', 'ex', 'play'].includes(command)) {
		if (!command) {
			// show full dictionary of a random word
			fullDictOfRadomWord();
		} else {
			// show full dictionary of a given word
			fullDictOfWord(command);
		}
	} else {
		if (!word && command !== 'play') {
			log(`Insufficient arguments\nplease try --help to know more about command`);
			process.exit(1);
		} else {
			switch (command) {
				case 'defn':
					getDefinition(word, true);
					break;
				case 'syn':
					getSynonyms(word, true);
					break;
				case 'ant':
					getAntonyms(word, true);
					break;
				case 'ex':
					getExamples(word, true);
					break;
				case 'play':
					letsPlay();
					break;
			}
		}
	}
}

main(command, word);

//--------------------------------------------------------------

async function getDefinition(word, shouldExit) {
	reqData(`/word/${word}/definitions`, 'definitions')
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

async function getSynonyms(word, shouldExit) {
	reqData(`/word/${word}/relatedWords`, 'synonyms')
		.then(result => {
			printRelatedWord(result, 'synonym');
			if (shouldExit) process.exit(0);
			else return Promise.resolve();
		})
		.catch(err => {
			log(err);
			if (shouldExit) process.exit(1);
			else return Promise.reject();
		});
}

async function getAntonyms(word, shouldExit) {
	reqData(`/word/${word}/relatedWords`, 'antonyms')
		.then(result => {
			printRelatedWord(result, 'antonym');
			if (shouldExit) process.exit(0);
			else return Promise.resolve();
		})
		.catch(err => {
			log(err);
			if (shouldExit) process.exit(1);
			else return Promise.reject();
		});
}

async function getExamples(word, shouldExit) {
	reqData(`/word/${word}/examples`, 'examples')
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
}

async function jumbleWord(word) {}

async function letsPlay() {
	let word = null;
	log(chalk.italic(`let's play:\n`));
	reqData(`/words/randomWord`)
		.then(result => {
			word = result.data && result.data.word;
			word = 'single';
			if (word) {
				play(word);
			} else {
				return Promise.reject('err');
			}
		})
		.catch(err => {
			console.log(err);
			log(`sorry can't play now. dictionary unavailable`);
			process.exit(1);
		});
}

//--------------------------------------------------------------

async function getHints(word) {
	return new Promise(async (resolve, reject) => {
		try {
			const hintsOption = [getDefinition, getSynonyms, getAntonyms];

			const randomHint = Math.round((Math.random() * 10) % 2);

			console.log('randomHint', randomHint);
			await hintsOption[randomHint](word, false);
			console.log('******************');
			return resolve();
		} catch (e) {
			return reject(e);
		}
	});
}

async function fullDictOfWord(word) {
	reqData(`/word/${word}/definitions`, 'definitions')
		.then(result => {
			printDefinition(result);
			return reqData(`/word/${word}/examples`, 'examples');
		})
		.then(result => {
			printExamples(result);
			return reqData(`/word/${word}/relatedWords`, 'synonyms');
		})
		.then(result => {
			printRelatedWord(result, 'synonym');
			return reqData(`/word/${word}/relatedWords`, 'antonyms');
		})
		.then(result => {
			printRelatedWord(result, 'antonym');
			process.exit(0);
		})
		.catch(err => {
			log(err);
			process.exit(1);
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

async function play(word) {
	main(word);
}

function askQuestion(word, cb) {
	rl.question(`\nGuess the word ${(cnt > 0 && 'again') || ''}?\nYour answer : `, function(answer) {
		cnt++;
		if (answer.trim().toLowerCase() == word.toLowerCase()) {
			console.log('\nYeah, you guessed the right word!');
			cb(true);
		} else {
			cb(false);
		}
	});
}

function main(word) {
	askQuestion(word, answer => {
		if (answer) {
			rl.close();
		} else {
			if (cnt === 3) {
				console.log(`\nIncorrect answer again, lifeline exausted!\n\nquiting now.`);
				rl.close();
			} else {
				choices(word);
			}
		}
	});
}

function choices(word) {
	console.log(`\nOh no, incorrect answer!`);
	rl.question(
		`
        \nYour choices:
    1. Try again
    2. Hint
    3. Quit
    
select : `,
		function(choice) {
			if (choice == '3') {
				rl.close();
			} else if (choice == '1') {
				main();
			} else if (choice == '2') {
				console.log('\nYour Hint: ');
				getHints(word)
					.then(res => {
						console.log('$$$$$$$$$$');
						main(word);
					})
					.catch(e => {
						log(`unable to get hint!`);
						rl.close();
					});
			} else {
				console.log(`\nInvalid choice`);
				rl.close();
			}
		}
	);
}

// main();

rl.on('close', function() {
	console.log('\nBYE BYE !!!');
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
}

function printRelatedWord(result, relationshipType) {
	const relatedWords = Array.isArray(result.data) && result.data.filter(d => d.relationshipType == relationshipType);

	relatedWords.length > 0 && Array.isArray(relatedWords[0].words) && relatedWords[0].words.length > 0 && log(chalk.bgWhiteBright.black.underline(`\n${relationshipType}s: `));

	relatedWords.length > 0 &&
		Array.isArray(relatedWords[0].words) &&
		relatedWords[0].words.length > 0 &&
		relatedWords[0].words.forEach(s => {
			s && log(`* ${s}`);
		});
}

function printExamples(result) {
	const examples = Array.isArray(result.data.examples) && result.data.examples.slice(0, 3);

	examples.length > 0 && log(chalk.bgWhiteBright.black.underline('\nExamples: '));

	examples.length > 0 &&
		examples.forEach(ex => {
			ex && ex.text && log(`* ${ex.text}`);
		});
}
