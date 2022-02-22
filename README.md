# Find a Word - Word Assistant FAWWA

## About

Every night I scratch my head and scour the depths of my mind in order to attain gratisfaction for solving the cursed game that has swept the globe, Wordle. "What words even are there that have a W, D and Y?" I ask myself, too too often drawing a blank and falling to despair. But the thirst remains, the thirst for knowledge must be quenched, I want to know the words and be haunted no more. I beseech my computer for wisdom, and it answers.

It's a word learning helper that I made it to discover new words that I might have never heard of otherwise. It was inspired by Wordle but I'm more interested in learning new things and words and thus it doesn't use the same exact word set of Wordle but rather builds it from publicly available sources. It's more of a word lookup and learning tool than an automatic solver.

Note that the sources may well contain a lot of words that are uncommon, perhaps even incorrect as I didn't validate them at all.

## Usage

1. Change the configurations to your liking by overwriting _default.yaml_ values in your own _config/local.yaml_ as needed.
2. Configure your reverse proxy for the app if you like.
3. Run `npm start`.

See [Sources](#sources) and _config/default.yaml_ file for more information on available features and options.

## Sources

I've included a default source of words as a compressed archive derived from the following sources:

- [OPTED](https://github.com/eddydn/DictionaryDatabase) ([The Online Plain Text English Dictionary](https://www.mso.anu.edu.au/~ralph/OPTED/)) by EDMTDev, referenced on 2022-02-19 (version 75d50da)
- [SCOWL](https://github.com/en-wl/wordlist) ([Spell Checker Oriented Word Lists](http://wordlist.aspell.net/)) by Kevin Atkinson, referenced on 2022-02-19 (version 2020.12.07)

If you wish to make changes to the dictionary archive, you'll have to download the necessary OPTED and SCOWL files and place them so that they match your configurations. OPTED source is expected to be a JSON file, and SCOWL source is a directory of SCOWL word files. OPTED you can clone from github, SCOWL I downloaded a compressed tarball of but you may also be able to clone and build it yourself.

To rebuild the dictionary archive, configure settings and run `npm run build-dict`. To unpack the dictionary archive for the website, run `npm run unpack-dict`.

## Licenses

- Website and dictionary generation tools: MIT.
- Derived included or built dictionaries: Please check OPTED and SCOWL websites for their licensing terms if you wish to do something commercial with this project.
