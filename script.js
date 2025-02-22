document.addEventListener("alpine:init", () => {
  Alpine.data("cardData", () => ({
    gameName: "", // Stores the current game name
    savedGames: [], // List of saved games

    async init() {
      await this.loadWordLists(); // Ensure words are loaded first
      this.loadSavedGames(); // Then load saved games
    },

    get currentGameKey() {
      return `game_${this.gameName || new Date().toISOString()}`; // Default to timestamp if empty
    },

    showCardsPage: false,
    settings: {
      cardsPerDifficulty: 3, // Default: Show 3 words per difficulty
      language: "english",
    },

    currentWordIndex: 0,
    shuffledEasy: [],
    shuffledMedium: [],
    shuffledHard: [],

    get cardsReached() {
      return (
        Math.floor(this.currentWordIndex / this.settings.cardsPerDifficulty) + 1
      );
    },

    get totalCards() {
      return Math.ceil(
        this.shuffledEasy.length / this.settings.cardsPerDifficulty
      );
    },

    reloadPage() {
      window.location.reload(); // Reloads the entire page
    },

    async loadWordLists() {
      // Load words from text files asynchronously

      const response = await this.fetchWords("words/easy_words_english.txt");
      console.log("easy_words_english:", response);
      this.data.cards.easy.words.english = await this.fetchWords(
        "words/easy_words_english.txt"
      );
      this.data.cards.medium.words.english = await this.fetchWords(
        "words/medium_words_english.txt"
      );
      this.data.cards.hard.words.english = await this.fetchWords(
        "words/hard_words_english.txt"
      );
      this.data.cards.easy.words.arabic = await this.fetchWords(
        "words/easy_words_arabic.txt"
      );
      this.data.cards.medium.words.arabic = await this.fetchWords(
        "words/medium_words_arabic.txt"
      );
      this.data.cards.hard.words.arabic = await this.fetchWords(
        "words/hard_words_arabic.txt"
      );

      // Simulated Arabic words (Replace with actual translations if needed)
      // this.data.cards.easy.words.arabic = ["تفاحة", "موزة", "جزرة", "كلب", "فيل", "زهرة"];
      // this.data.cards.medium.words.arabic = ["فأر", "دفتر", "برتقالة", "قلم رصاص", "ملكة", "قوس قزح"];
      // this.data.cards.hard.words.arabic = ["حمار وحشي", "يخت", "أشعة إكس", "فيل البحر", "مصاص الدماء", "حصان ذو قرن"];

      console.log("Words loaded:", this.data);
    },

    async fetchWords(filePath) {
      try {
        const response = await fetch(filePath);
        const text = await response.text();
        return text
          .split("\n")
          .map((word) => word.trim())
          .filter((word) => word !== "");
      } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        return [];
      }
    },

    async startGame() {
      console.log("Starting game...");

      // Ensure words are loaded before proceeding
      if (this.data.cards.easy.words.english.length === 0) {
        console.log("Waiting for words to load...");
        await this.loadWordLists();
      }

      const gameKey = this.currentGameKey;

      // Shuffle words after loading
      this.shuffledEasy =
        this.loadFromStorage(`${gameKey}_shuffledEasy`) ||
        this.shuffleArray([
          ...this.data.cards.easy.words[this.settings.language],
        ]);
      this.shuffledMedium =
        this.loadFromStorage(`${gameKey}_shuffledMedium`) ||
        this.shuffleArray([
          ...this.data.cards.medium.words[this.settings.language],
        ]);
      this.shuffledHard =
        this.loadFromStorage(`${gameKey}_shuffledHard`) ||
        this.shuffleArray([
          ...this.data.cards.hard.words[this.settings.language],
        ]);

      // Load saved progress
      this.currentWordIndex =
        this.loadFromStorage(`${gameKey}_currentWordIndex`) || 0;

      // Save shuffled words to local storage under the specific game name
      this.saveToStorage(`${gameKey}_shuffledEasy`, this.shuffledEasy);
      this.saveToStorage(`${gameKey}_shuffledMedium`, this.shuffledMedium);
      this.saveToStorage(`${gameKey}_shuffledHard`, this.shuffledHard);
      this.saveToStorage(`${gameKey}_currentWordIndex`, this.currentWordIndex);

      this.saveGameName(gameKey);

      this.showCardsPage = true;
    },

    resetGame() {
      console.log("Resetting game...");

      const gameKey = this.currentGameKey;

      // Clear only this game's data
      localStorage.removeItem(`${gameKey}_shuffledEasy`);
      localStorage.removeItem(`${gameKey}_shuffledMedium`);
      localStorage.removeItem(`${gameKey}_shuffledHard`);
      localStorage.removeItem(`${gameKey}_currentWordIndex`);

      this.startGame();
    },

    updateLanguage(value) {
      this.settings.language = value;
      console.log("Language:", this.settings.language);
    },

    updateCardsPerDifficulty(value) {
      this.settings.cardsPerDifficulty = parseInt(value);
      console.log("Words Per Difficulty:", this.settings.cardsPerDifficulty);
    },

    generateCard() {
      const totalWords = this.shuffledEasy.length; // Total words in the shuffled list

      // Move index forward by `cardsPerDifficulty`, ensuring it doesn't go out of bounds
      if (
        this.currentWordIndex + this.settings.cardsPerDifficulty <
        totalWords
      ) {
        this.currentWordIndex += this.settings.cardsPerDifficulty;
      } else {
        console.log("All words have been used! Restarting shuffle...");
        this.currentWordIndex = 0; // Restart at the beginning
        this.shuffledEasy = this.shuffleArray([...this.shuffledEasy]); // Re-shuffle words
        this.shuffledMedium = this.shuffleArray([...this.shuffledMedium]);
        this.shuffledHard = this.shuffleArray([...this.shuffledHard]);
      }

      // Save the new index in local storage
      this.saveToStorage(
        this.currentGameKey + "_currentWordIndex",
        this.currentWordIndex
      );
      console.log("Next Card:", this.currentWordIndex);
    },

    get currentWords() {
      if (
        !this.shuffledEasy.length ||
        !this.shuffledMedium.length ||
        !this.shuffledHard.length
      ) {
        console.warn("Words not loaded yet.");
        return { easy: [], medium: [], hard: [] }; // Return empty if words aren't loaded yet
      }

      return {
        easy: this.shuffledEasy.slice(
          this.currentWordIndex,
          this.currentWordIndex + this.settings.cardsPerDifficulty
        ),
        medium: this.shuffledMedium.slice(
          this.currentWordIndex,
          this.currentWordIndex + this.settings.cardsPerDifficulty
        ),
        hard: this.shuffledHard.slice(
          this.currentWordIndex,
          this.currentWordIndex + this.settings.cardsPerDifficulty
        ),
      };
    },

    // Utility: Shuffle an array
    shuffleArray(array) {
      // Convert array to a Set to remove duplicates, then back to an array
      array = [...new Set(array)];

      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }

      return array;
    },

    // Utility: Save to Local Storage
    saveToStorage(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },

    // Utility: Load from Local Storage
    loadFromStorage(key) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    },

    saveGameName(gameKey) {
      let games = this.loadFromStorage("savedGames") || [];

      if (!games.includes(gameKey)) {
        games.push(gameKey);

        // Keep only the latest 5 saved games
        if (games.length > 5) {
          games.shift(); // Remove the oldest save
        }

        this.saveToStorage("savedGames", games);
      }

      // ✅ Save language and difficulty settings
      this.saveToStorage(`${gameKey}_language`, this.settings.language);
      this.saveToStorage(
        `${gameKey}_cardsPerDifficulty`,
        this.settings.cardsPerDifficulty
      );

      this.loadSavedGames(); // Refresh saved games list
    },

    deleteGame(gameKey) {
      console.log("Deleting game:", gameKey);

      // Remove the game's stored data
      localStorage.removeItem(`${gameKey}_shuffledEasy`);
      localStorage.removeItem(`${gameKey}_shuffledMedium`);
      localStorage.removeItem(`${gameKey}_shuffledHard`);
      localStorage.removeItem(`${gameKey}_currentWordIndex`);

      // Remove game from the saved games list
      let games = this.loadFromStorage("savedGames") || [];
      games = games.filter((game) => game !== gameKey); // Remove specific game
      this.saveToStorage("savedGames", games);

      this.loadSavedGames(); // Refresh the list
    },

    loadSavedGames() {
      let games = this.loadFromStorage("savedGames") || [];

      this.savedGames = games.map((gameKey) => {
        let gameData = {
          key: gameKey, // Game identifier
          gameName: gameKey.replace("game_", ""), // Remove prefix
          language: this.loadFromStorage(`${gameKey}_language`) || "English", // ✅ Fix: Default to English instead of Unknown
          cardsPerDifficulty:
            this.loadFromStorage(`${gameKey}_cardsPerDifficulty`) || 3,
          cardsCompleted:
            Math.floor(
              (this.loadFromStorage(`${gameKey}_currentWordIndex`) || 0) /
                (this.loadFromStorage(`${gameKey}_cardsPerDifficulty`) || 3)
            ) + 1,
          totalCards: Math.ceil(
            (this.loadFromStorage(`${gameKey}_shuffledEasy`) || []).length /
              (this.loadFromStorage(`${gameKey}_cardsPerDifficulty`) || 3)
          ),
        };

        return gameData;
      });
    },

    // Utility: Load a saved game
    loadGame(gameKey) {
      console.log("Loading game:", gameKey);
      this.gameName = gameKey.replace("game_", ""); // Set game name
      this.startGame();
    },

    data: {
      cards: {
        easy: {
          difficulty: "EASY",
          emoji: "😐",
          words: {
            english: [],
            arabic: [],
          },
          color: "#008000", // Green
        },
        medium: {
          difficulty: "MEDIUM",
          emoji: "🤔",
          words: {
            english: [],
            arabic: [],
          },
          color: "#F47F00", // Orange
        },
        hard: {
          difficulty: "HARD",
          emoji: "🤯",
          words: {
            english: [],
            arabic: [],
          },
          color: "#FF0000", // Red
        },
      },
    },
  }));
});

// document.addEventListener("alpine:init", () => {
//   Alpine.data("cardData", () => ({
//     gameName: "", // Stores the current game name

//     get currentGameKey() {
//       return `game_${this.gameName || new Date().toISOString()}`; // Default to timestamp if empty
//     },

//     showCardsPage: false,
//     settings: {
//       cardsPerDifficulty: 3, // Default: Show 3 words per difficulty
//       language: "english",
//     },

//     currentWordIndex: 0,
//     shuffledEasy: [],
//     shuffledMedium: [],
//     shuffledHard: [],

//     startGame() {
//       console.log("Starting game...");

//       // Set the current game key dynamically
//       const gameKey = this.currentGameKey;

//       // Load from storage or shuffle new words for this game
//       this.shuffledEasy =
//         this.loadFromStorage(`${gameKey}_shuffledEasy`) ||
//         this.shuffleArray([
//           ...this.data.cards.easy.words[this.settings.language],
//         ]);
//       this.shuffledMedium =
//         this.loadFromStorage(`${gameKey}_shuffledMedium`) ||
//         this.shuffleArray([
//           ...this.data.cards.medium.words[this.settings.language],
//         ]);
//       this.shuffledHard =
//         this.loadFromStorage(`${gameKey}_shuffledHard`) ||
//         this.shuffleArray([
//           ...this.data.cards.hard.words[this.settings.language],
//         ]);

//       // Load saved progress
//       this.currentWordIndex =
//         this.loadFromStorage(`${gameKey}_currentWordIndex`) || 0;

//       // Save shuffled words to local storage under the specific game name
//       this.saveToStorage(`${gameKey}_shuffledEasy`, this.shuffledEasy);
//       this.saveToStorage(`${gameKey}_shuffledMedium`, this.shuffledMedium);
//       this.saveToStorage(`${gameKey}_shuffledHard`, this.shuffledHard);
//       this.saveToStorage(`${gameKey}_currentWordIndex`, this.currentWordIndex);

//       this.showCardsPage = true;
//     },

//     resetGame() {
//       console.log("Resetting game...");

//       const gameKey = this.currentGameKey;

//       // Clear only this game's data
//       localStorage.removeItem(`${gameKey}_shuffledEasy`);
//       localStorage.removeItem(`${gameKey}_shuffledMedium`);
//       localStorage.removeItem(`${gameKey}_shuffledHard`);
//       localStorage.removeItem(`${gameKey}_currentWordIndex`);

//       this.startGame();
//     },

//     updateLanguage(value) {
//       this.settings.language = value;
//       console.log("Language:", this.settings.language);
//     },

//     updateCardsPerDifficulty(value) {
//       this.settings.cardsPerDifficulty = parseInt(value);
//       console.log("Words Per Difficulty:", this.settings.cardsPerDifficulty);
//     },

//     generateCard() {
//       // Increase index
//       if (this.currentWordIndex < this.shuffledEasy.length - 1) {
//         this.currentWordIndex++;
//         this.saveToStorage("currentWordIndex", this.currentWordIndex);
//       }
//       console.log("Next Card:", this.currentWordIndex);
//     },

//     get currentWords() {
//       return {
//         easy: this.shuffledEasy.slice(
//           this.currentWordIndex,
//           this.currentWordIndex + this.settings.cardsPerDifficulty
//         ),
//         medium: this.shuffledMedium.slice(
//           this.currentWordIndex,
//           this.currentWordIndex + this.settings.cardsPerDifficulty
//         ),
//         hard: this.shuffledHard.slice(
//           this.currentWordIndex,
//           this.currentWordIndex + this.settings.cardsPerDifficulty
//         ),
//       };
//     },

//     // Utility: Shuffle an array
//     shuffleArray(array) {
//       for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//       }
//       return array;
//     },

//     // Utility: Save to Local Storage
//     saveToStorage(key, value) {
//       localStorage.setItem(key, JSON.stringify(value));
//     },

//     // Utility: Load from Local Storage
//     loadFromStorage(key) {
//       const data = localStorage.getItem(key);
//       return data ? JSON.parse(data) : null;
//     },

//     get data() {
//       return {
//         cards: {
//           easy: {
//             order: "EASY",
//             emoji: "😐",
//             words: {
//               english: [
//                 "apple",
//                 "banana",
//                 "carrot",
//                 "dog",
//                 "elephant",
//                 "flower",
//               ],
//               arabic: ["تفاحة", "موزة", "جزرة", "كلب", "فيل", "زهرة"],
//             },
//             color: "#008000", // Green
//           },
//           medium: {
//             order: "MEDIUM",
//             emoji: "🤔",
//             words: {
//               english: [
//                 "mouse",
//                 "notebook",
//                 "orange",
//                 "pencil",
//                 "queen",
//                 "rainbow",
//               ],
//               arabic: ["فأر", "دفتر", "برتقالة", "قلم رصاص", "ملكة", "قوس قزح"],
//             },
//             color: "#F47F00", // Orange
//           },
//           hard: {
//             order: "HARD",
//             emoji: "🤯",
//             words: {
//               english: [
//                 "zebra",
//                 "yacht",
//                 "x-ray",
//                 "walrus",
//                 "vampire",
//                 "unicorn",
//               ],
//               arabic: [
//                 "حمار وحشي",
//                 "يخت",
//                 "أشعة إكس",
//                 "فيل البحر",
//                 "مصاص الدماء",
//                 "حصان ذو قرن",
//               ],
//             },
//             color: "#FF0000", // Red
//           },
//         },
//       };
//     },
//   }));
// });

// document.addEventListener("alpine:init", () => {
//   Alpine.data("cardData", () => ({
//     showCardsPage: false,
//     settings: {
//       cardsPerDifficulty: 3, // Default: Show 3 words per difficulty
//       language: "english",
//     },

//     currentWordsIdex: 0,

//     startGame() {
//       console.log("Starting game...");
//       this.showCardsPage = true;
//     },

//     updateLanguage(value) {
//       this.settings.language = value;
//       console.log("Language:", this.settings.language);
//     },

//     updateCardsPerDifficulty(value) {
//       this.settings.cardsPerDifficulty = parseInt(value);
//       console.log("Words Per Difficulty:", this.settings.cardsPerDifficulty);
//     },

//     get data() {
//       return {
//         cards: {
//           easy: {
//             order: 1,
//             emoji: "😐",
//             words: {
//               english: [
//                 "apple",
//                 "banana",
//                 "carrot",
//                 "dog",
//                 "elephant",
//                 "flower",
//                 "guitar",
//                 "house",
//                 "ice cream",
//                 "jacket",
//                 "kangaroo",
//                 "lemon",
//               ],
//               arabic: [
//                 "تفاحة",
//                 "موزة",
//                 "جزرة",
//                 "كلب",
//                 "فيل",
//                 "زهرة",
//                 "جيتار",
//                 "منزل",
//                 "آيس كريم",
//                 "جاكيت",
//                 "كنغر",
//                 "ليمون",
//               ],
//             },
//             color: "#008000", // Green
//           },
//           medium: {
//             order: 2,
//             emoji: "🤔",
//             words: {
//               english: [
//                 "mouse",
//                 "notebook",
//                 "orange",
//                 "pencil",
//                 "queen",
//                 "rainbow",
//                 "sun",
//                 "tree",
//                 "umbrella",
//                 "violin",
//                 "watermelon",
//                 "xylophone",
//               ],
//               arabic: [
//                 "فأر",
//                 "دفتر",
//                 "برتقالة",
//                 "قلم رصاص",
//                 "ملكة",
//                 "قوس قزح",
//                 "شمس",
//                 "شجرة",
//                 "مظلة",
//                 "كمان",
//                 "بطيخ",
//                 "زيلوفون",
//               ],
//             },
//             color: "#F47F00", // Orange
//           },
//           hard: {
//             order: 3,
//             emoji: "🤯",
//             words: {
//               english: [
//                 "zebra",
//                 "yacht",
//                 "x-ray",
//                 "walrus",
//                 "vampire",
//                 "unicorn",
//                 "tiger",
//                 "snake",
//                 "rhinoceros",
//                 "quokka",
//                 "penguin",
//                 "ostrich",
//               ],
//               arabic: [
//                 "حمار وحشي",
//                 "يخت",
//                 "أشعة إكس",
//                 "فيل البحر",
//                 "مصاص الدماء",
//                 "حصان ذو قرن",
//                 "نمر",
//                 "ثعبان",
//                 "وحيد القرن",
//                 "كوكا",
//                 "بطريق",
//                 "نعامة",
//               ],
//             },
//             color: "#FF0000", // Red
//           },
//         },
//       };
//     },

//     generateCard() {
//       console.log("Generating card...");
//     },
//   }));
// });
