(() => {
  /**
   * Enforce uniqueness, lowercase and all letters sorted input
   *
   * @param {string} subject - Subject input field
   * @param {number} maxLength - [OPTIONAL] Maximum length of the input
   */
  const enforceLetterSanity = (subject, maxLength) => {
    let chars = [];

    let splitValue = subject.value.split('');

    for (const splitChar of splitValue) {
      if (!chars.includes(splitChar) && splitChar.toLowerCase().match(/[a-z]/)) {
        chars.push(splitChar.toLowerCase());
      }
    }

    chars.sort();

    subject.value = chars.join('').substring(0, maxLength || chars.length);
  };

  /**
   * Makes sure that the subject either does not contain letters from the authority, or alternatively only contains
   * letters from it
   *
   * @param {Object} authority - Field with authority over subject
   * @param {Object} subject - Subject field
   * @param {(undefined|string)} extraLetters - [OPTIONAL] Extra letters to include in the search. If given, the check
   *                                                       mode is flipped so that only included letters are accepted
   */
  const enforceLetterAuthority = (authority, subject, extraLetters) => {
    let cleanSubject = '';
    const authorityLetters = authority.value + (extraLetters || '');

    subjectLetters = subject.value.split('');
    for (const letter of subjectLetters) {
      if (
          (!extraLetters && !authorityLetters.includes(letter)) ||
          (extraLetters && authorityLetters.includes(letter))
      ) {
        cleanSubject += letter;
      }
    }

    subject.value = cleanSubject;
  };

  /**
   * Enforces all lowercase input on subject field
   *
   * @param {Object} subject - Subject field
   */
  const enforceLowerCase = (subject) => {
    subject.value = subject.value.toLowerCase();
  };

  // Grab elements for simple reference later
  const inputLetterCount = document.getElementById('inputLetterCount');
  const inputKnownLetters = document.getElementById('inputKnownLetters');
  const textareaDeadLetters = document.getElementById('textareaDeadLetters');
  const inputWordGuess = document.getElementById('inputWordGuess');
  const loadScreen = document.getElementById('loadScreen');
  const mainScreen = document.getElementById('mainScreen');
  const buttonShowWords = document.getElementById('buttonShowWords');
  const buttonClearFields = document.getElementById('buttonClearFields');
  const wordList = document.getElementById('wordList');

  let dictionary = [];

  // Filter some of the inputs on the go
  inputKnownLetters.addEventListener('keyup', () => {
    enforceLowerCase(inputKnownLetters);
    enforceLetterSanity(inputKnownLetters, parseInt(inputLetterCount.value));
    enforceLetterAuthority(inputKnownLetters, textareaDeadLetters);
    enforceLetterAuthority(inputKnownLetters, inputWordGuess, '?*()');
  });
  textareaDeadLetters.addEventListener('keyup', () => {
    enforceLowerCase(textareaDeadLetters);
    enforceLetterSanity(textareaDeadLetters);
    enforceLetterAuthority(inputKnownLetters, textareaDeadLetters);
    enforceLetterAuthority(textareaDeadLetters, inputWordGuess);
  });
  inputLetterCount.addEventListener('change', () => {
    // Make sure we don't have too long values where impossible
    inputKnownLetters.value = inputKnownLetters.value.substr(0, parseInt(inputLetterCount.value));
  });
  inputWordGuess.addEventListener('keyup', () => {
    enforceLowerCase(inputWordGuess);

    // Only accept the possible and keep the impossible ones out
    enforceLetterAuthority(textareaDeadLetters, inputWordGuess);
    enforceLetterAuthority(inputKnownLetters, inputWordGuess, '*?()');

    // Sanitize word guess to only contain properly formatted guess strings
    if (inputWordGuess.value.includes('(') || inputWordGuess.value.includes(')')) {
      const guessLetters = inputWordGuess.value.split('');

      let isBraceOpen = false;
      let guessLength = 0;
      let isSane = true;

      for (const guessChar of guessLetters) {
        if (guessChar === '(') {
          if (isBraceOpen) {
            window.alert('Improperly formatted guess, please check the value');
            isSane = false;
          } else {
            isBraceOpen = true;
          }
        } else if (guessChar === ')') {
          if (isBraceOpen) {
            guessLength++;
            isBraceOpen = false;
          } else {
            window.alert('Improperly formatted guess, please check the value');
            isSane = false;
          }
        } else {
          if (!isBraceOpen) {
            guessLength++;
          }
        }
      }

      if (guessLength > parseInt(inputLetterCount.value)) {
        window.alert('Guessed word cannot be longer than the number of letters, please check the value');
        isSane = false;
      }

      if (isSane) {
        buttonShowWords.removeAttribute('disabled');
      } else {
        buttonShowWords.setAttribute('disabled', 'disabled');
      }
    } else {
      if (inputWordGuess.value.length > parseInt(inputLetterCount.value)) {
        window.alert('Guessed word cannot be longer than the number of letters, please check the value');
        buttonShowWords.setAttribute('disabled', 'disabled');
      } else {
        buttonShowWords.removeAttribute('disabled');
      }
    }
  });

  // Find word options on button press and build a results list
  buttonShowWords.addEventListener('click', () => {
    const knownLetters = inputKnownLetters.value.split('');
    const deadLetters = textareaDeadLetters.value.split('');

    let matchString = '^';
    let matchRegex = null;

    /*
     * Factor in already-known data about possible and impossible words, assuming that word guess has already been
     * sanitized to only contain correctly formatted guess strings.
     */
    if (inputWordGuess.value) {
      let isBraceOpen = false;
      let notMatchString = '';

      const guessLetters = inputWordGuess.value.split('');

      for (const guessChar of guessLetters) {
        if (isBraceOpen) {
          if (guessChar !== ')') {
            notMatchString += guessChar;
          } else {
            isBraceOpen = false;
            matchString += `[^${notMatchString}]`;
            notMatchString = '';
          }
        } else {
          if (guessChar === '(') {
            isBraceOpen = true;
          } else if (guessChar === '?' || guessChar === '*') {
            matchString += '[a-z]';
          } else {
            matchString += guessChar;
          }
        }
      }

      matchRegex = new RegExp(`${matchString}$`);
    }

    const matches = [];

    // Go through all the words in the dictionary to look for results

    for (const entry of dictionary) {
      if (entry.length !== parseInt(inputLetterCount.value)) {
        continue;
      }

      // Make sure the word matches the guess if one is given
      if (matchRegex && !entry.match(matchRegex)) {
        continue;
      }

      // Make sure the word doesn't have dead letters
      let isMatch = true;
      for (const letter of deadLetters) {
        if (entry.includes(letter)) {
          isMatch = false;
          break;
        }
      }

      if (!isMatch) {
        continue;
      }

      // Make sure the word has the letters we know there to be
      for (const letter of knownLetters) {
        if (!entry.includes(letter)) {
          isMatch = false;
          break;
        }
      }

      if (!isMatch) {
        continue;
      }

      matches.push(entry);
    }

    console.log(`Found ${matches.length} matches`);

    if (matches.length === 0) {
      window.alert('No matches found');
    }

    while (wordList.firstChild) {
      wordList.firstChild.remove();
    }

    for (const match of matches) {
      const wordEntry = document.createElement('li');
      wordEntry.innerHTML = `<a href="https://thefreedictionary.com/${encodeURIComponent(match)}">${match}</a>`;
      wordList.appendChild(wordEntry);
    }
  });

  buttonClearFields.addEventListener('click', () => {
    inputKnownLetters.value = '';
    textareaDeadLetters.value = '';
    inputWordGuess.value = '';
  });

  // Load the dictionary dynamically and only then enable the UI
  const xhr = new XMLHttpRequest();

  xhr.open('GET', 'dict.json', true);

  xhr.onload = () => {
    try {
      dictionary = JSON.parse(xhr.response);
      console.log(`Loaded a dictionary with ${dictionary.length} words`);

      loadScreen.remove();
      mainScreen.classList.remove('hidden');
    } catch (e) {
      console.error('Could not load the dictionary');
    }
  };

  xhr.send();
})();
