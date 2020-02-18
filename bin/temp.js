const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

(function run() {
	let cnt = 0;

	function askQuestion(cb) {
		rl.question(`Guess the word ${(cnt > 0 && 'again') || ''}?\nYour answer : `, function(answer) {
			cnt++;
			if (answer == 'correct') {
				console.log('\nYeah, you guessed the right word!');
				cb(true);
			} else {
				cb(false);
			}
		});
	}

	function mainQ() {
		askQuestion(answer => {
			if (answer) {
				rl.close();
			} else {
				if (cnt === 3) {
					console.log(`\nIncorrect answer again, lifeline exausted!\n\nquiting now.`);
					rl.close();
				} else {
					choices();
				}
			}
		});
	}

	function choices() {
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
					mainQ();
				} else if (choice == '2') {
					console.log('\nYour Hint: ');
					mainQ();
				} else {
					console.log(`\nInvalid choice`);
					rl.close();
				}
			}
		);
	}

	main();

	rl.on('close', function() {
		console.log('\nBYE BYE !!!');
		process.exit(0);
	});
})

function shuffle(word){
  if(!word || !(word.trim().length > 0)) return Promise.resolve('');

  let shuffled = word.trim().split('').sort(function(){return 0.5-Math.random()}).join('');

  if(shuffled.trim()===word.trim()) 
	return shuffle(word);

  return Promise.resolve(shuffled);
}

shuffle(null)
 .then(res=>{  
	console.log(res);
        process.exit(0);
});
