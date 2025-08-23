// JSON Validation Test
const testJSON = `{
  "welcome": {
    "title": "Nane Hua'ōlelo",
    "startButton": "Begin",
    "helpButton": "Help"
  },
  "instructions": {
    "title": "How to Play",
    "hawaiianToggle": "'Ōlelo Hawaiʻi",
    "englishToggle": "English",
    "close": "Close",
    "steps": {
      "selectLetters": {
        "title": "Select Letters:",
        "description": "Tap the buttons around the wheel to form a word. Inside the wheel you will see these letters:",
        "vowels": "Hawaiian vowels: a, e, i, o, u",
        "longVowels": "Long vowels with kahakō: ā, ē, ī, ō, ū",
        "okina": "The glottal stop: ʻokina (ʻ)",
        "note": "Letters may appear more than once across different words but are shown only once in the wheel."
      },
      "formingWords": {
        "title": "Forming Words:",
        "correctSpelling": "Words in the puzzle must be spelled according to the most common conventions for language you choose. This includes macrons and glottal stops (for some languages) when the language uses them.",
        "availableLetters": "All letters in the word must come from the seven on the wheel.",
        "minLength": "Each word must be at least X letters long (define this minimum if applicable)."
      },
      "submitAuto": {
        "title": "Submit Automatically:",
        "autoAppear": "When you complete a valid word, it will automatically appear in the crossword-style grid above the wheel.",
        "noSubmit": "No need to press a \\"submit\\" button."
      },
      "editing": {
        "title": "Editing:",
        "mistake": "Made a mistake? Tap the center delete button to remove the last letter you selected.",
        "keepTapping": "Keep tapping delete to remove letters one by one."
      },
      "continue": {
        "title": "Continue Guessing:",
        "afterSuccess": "After a successful word, keep going to find more.",
        "findAll": "Try to discover all the words hidden in the puzzle!"
      }
    },
    "tips": {
      "title": "Tips",
      "diacriticals": "Don't forget to use the kahakō (macron) and the ʻokina where needed—they count as distinct characters.",
      "differences": "Many Hawaiian words differ only by the use of kahakō or the ʻokina. Be careful:",
      "example": "For example, these are all different words: pau, paʻu, paʻū, and pāʻū.",
      "pronunciation": "Listen closely to how Hawaiian words are pronounced—they often hint at correct spelling."
    }
  },
  "game": {
    "wordsFound": "Words Found",
    "hintsUsed": "Hints Used",
    "currentWord": "Current Word",
    "delete": "Delete",
    "hint": "Hint",
    "refresh": "New Game",
    "upload": "Upload Words",
    "debug": {
      "wordListDisplayed": "Word list displayed",
      "wordListDisplayedDesc": "Showing all {{count}} words for copying",
      "noWordsFound": "No words found",
      "noWordsFoundDesc": "Please upload a word list first",
      "copied": "Copied!",
      "copiedDesc": "All words copied to clipboard"
    },
    "showWords": "Show Words",
    "hideWords": "Hide Words",
    "confirmRefresh": {
      "title": "Start New Game?",
      "message": "This will reset your current progress and start a new puzzle.",
      "confirm": "Play Again",
      "cancel": "Quit"
    },
    "tooltips": {
      "checkWord": "Check word",
      "refreshGame": "Refresh Game",
      "clearWord": "Clear current word",
      "revealWords": "Reveal all words",
      "backspace": "Backspace (Delete key)"
    },
    "input": {
      "placeholder": "Type word here..."
    },
    "buttons": {
      "submit": "Submit"
    },
    "messages": {
      "error": "Error",
      "failedToLoad": "Failed to load Hawaiian words from public file",
      "wordNotFound": "Word Not Found",
      "threeLetterTimeout": "When you stop typing for three seconds, I will attempt to find your word. If it you have typed a correct word, I will show it. Otherwise, I will then clear your word and you can try again with a new word.",
      "reminder": "Reminder",
      "hintReminder": "Please remember that when you use a hint or both and a letter appears, you must enter the full word to get the word correct!",
      "wordFound": "UIHĀ!",
      "wordFoundDesc": "You have successfully located {{word}}!",
      "alreadyFound": "PREVIOUSLY FOUND!",
      "invalidWord": "Not a valid word",
      "tooShort": "Word too short",
      "letterNotAvailable": "Letter not available",
      "threeLetterHint": "Try typing more letters for longer words!",
      "hintUsed": "One Hint used!",
      "hintLetterRevealed": "Letter revealed: {{letter}}",
      "noHintsLeft": "No hints left!",
      "celebrationComplete": [
        "You Won!",
        "Congratulations!",
        "Amazing!",
        "Excellent!",
        "Great Job!!"
      ]
    }
  },
  "uploader": {
    "title": "Upload Custom Word List",
    "description": "Upload a text file with Hawaiian words (one per line) to create a custom puzzle.",
    "dragDrop": "Drag and drop a .txt file here, or click to select",
    "processing": "Processing...",
    "success": "{{count}} words loaded successfully!",
    "error": "Error loading file. Please try again.",
    "useDefault": "Use Default Words",
    "startGame": "Start Game with Custom Words",
    "fileProcessed": "File processed successfully",
    "fileProcessedDesc": "Found {{count}} valid words",
    "failedToProcess": "Failed to process file",
    "invalidFileType": "Invalid file type",
    "invalidFileTypeDesc": "Please upload a .txt or .csv file",
    "wordListUpdated": "Word list updated!",
    "wordListUpdatedDesc": "Updated with {{count}} words",
    "uploadSuccess": "Words uploaded!",
    "uploadSuccessDesc": "Uploaded {{count}} words. Check console for word list to copy to {{fileName}}"
  },
  "languageDropdown": {
    "interfaceLanguage": "Interface Language",
    "gameLanguage": "Game Language", 
    "hawaiian": "Hawaiian",
    "maori": "Māori",
    "tahitian": "Tahitian",
    "english": "English",
    "underDevelopment": "(under development)",
    "cancel": "Cancel",
    "ok": "OK",
    "acknowledgment": "Mahalo to Mary Boyce for the Māori word list used in this game."
  },
  "loading": "Loading Hawaiian words..."
}`;

try {
  const parsed = JSON.parse(testJSON);
  console.log("✅ JSON is valid!");
  console.log("Keys found:", Object.keys(parsed));
} catch (error) {
  console.error("❌ JSON validation failed:", error.message);
}