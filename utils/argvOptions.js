const argv = require("yargs")
  .usage(
    `
Usage: dict [command] <word>

command: 

    defn    -   Display definitions of a given word.
    syn     -   Display synonyms of a given word. 
    ant     -   Display antonyms/related of a given word.
    ex      -   Display examples of usage of a given word in a sentence. 
    play    -   Display a definition, a synonym or an antonym and ask the 
                user to guess the word. 
  `
  )
  .demandCommand(0)
  .option("h", { alias: "help", describe: "Show help" }).argv;

module.exports = argv;
