(() => {
  /**
   * Enforce uniqueness, lowercase and all letters sorted input
   *
   * @param {string} currentValue - String from an input field
   * @param {number} maxLength - [OPTIONAL] Maximum length of the input
   * @returns {string}
   */
  const enforceLetterSanity = (currentValue, maxLength) => {
    let chars = [];

    let splitValue = currentValue.split('');

    for (const splitChar of splitValue) {
      if (!chars.includes(splitChar) && splitChar.toLowerCase().match(/[a-z]/)) {
        chars.push(splitChar.toLowerCase());
      }
    }

    chars.sort();

    return chars.join('').substring(0, maxLength || chars.length);
  };

  /**
   * Makes sure that the subject does not contain letters from the authority
   *
   * @param {Object} authority - Field with authority over subject
   * @param {Object} subject - Subject field
   */
  const enforceLetterAuthority = (authority, subject) => {
    let cleanSubject = '';

    subjectLetters = subject.value.split('');
    for (const letter of subjectLetters) {
      if (!authority.value.includes(letter)) {
        cleanSubject += letter;
      }
    }

    subject.value = cleanSubject;
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
    inputKnownLetters.value = enforceLetterSanity(inputKnownLetters.value, parseInt(inputLetterCount.value));
    enforceLetterAuthority(inputKnownLetters, textareaDeadLetters);
  });
  textareaDeadLetters.addEventListener('keyup', () => {
    textareaDeadLetters.value = enforceLetterSanity(textareaDeadLetters.value);
    enforceLetterAuthority(inputKnownLetters, textareaDeadLetters);
  });
  inputLetterCount.addEventListener('change', () => {
    // Make sure we don't have too long values where impossible
    inputKnownLetters.value = inputKnownLetters.value.substr(0, parseInt(inputLetterCount.value));
    inputWordGuess.value = inputWordGuess.value.substr(0, parseInt(inputLetterCount.value));
  });
  inputWordGuess.addEventListener('keyup', () => {
    // Keep guesses clean from non-alphabeticals and non-wildcard characters
    inputWordGuess.value = inputWordGuess.value.substr(0, parseInt(inputLetterCount.value)).toLowerCase();
    inputWordGuess.value = inputWordGuess.value.replaceAll(/[^a-z\*\?]/g, '');
  });

  // Find word options on button press and build a results list
  buttonShowWords.addEventListener('click', () => {
    const knownLetters = inputKnownLetters.value.split('');
    const deadLetters = textareaDeadLetters.value.split('');

    let matchString = '^';
    let matchRegex = null;

    if (inputWordGuess.value) {
      const guessLetters = inputWordGuess.value.split('');

      for (const guessChar of guessLetters) {
        if (guessChar === '?' || guessChar === '*') {
          matchString += '[a-z]';
        } else {
          matchString += guessChar;
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

  const xhr = new XMLHttpRequest();

  xhr.open('GET', 'dict.json', true);

  xhr.onload = () => {
    try {
      dictionary = JSON.parse(xhr.response);
      console.log(`Loaded a dictionary with ${dictionary.length} words`);

      loadScreen.remove();
      mainScreen.classList.remove('hidden');
    } catch (e) {
      console.error('Could not load dictionary');
    }
  };

  xhr.send();
})();
