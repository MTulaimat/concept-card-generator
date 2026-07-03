document.addEventListener("alpine:init", () => {
  Alpine.data("cardData", () => ({
    // ---------- State ----------
    gameName: "",
    activeGameKey: null, // snapshot of the key for the game being played
    savedGames: [],
    showCardsPage: false,
    isFlipping: false,
    cardFlipped: false,
    showReshuffleNotice: false,
    settings: {
      cardsPerDifficulty: 3,
      language: "english",
    },
    currentWordIndex: 0,
    shuffledEasy: [],
    shuffledMedium: [],
    shuffledHard: [],

    async init() {
      await this.loadWordLists();
      this.loadSavedGames();
    },

    // ---------- Derived ----------
    get isArabic() {
      return this.settings.language === "arabic";
    },

    get deckSize() {
      return Math.min(
        this.shuffledEasy.length,
        this.shuffledMedium.length,
        this.shuffledHard.length
      );
    },

    get totalCards() {
      return Math.max(
        1,
        Math.ceil(this.deckSize / this.settings.cardsPerDifficulty)
      );
    },

    get cardsReached() {
      return Math.min(
        this.totalCards,
        Math.floor(this.currentWordIndex / this.settings.cardsPerDifficulty) + 1
      );
    },

    get progressPercent() {
      return Math.round((this.cardsReached / this.totalCards) * 100);
    },

    get currentWords() {
      if (!this.deckSize) {
        return { easy: [], medium: [], hard: [] };
      }
      const from = this.currentWordIndex;
      const to = from + this.settings.cardsPerDifficulty;
      return {
        easy: this.shuffledEasy.slice(from, to),
        medium: this.shuffledMedium.slice(from, to),
        hard: this.shuffledHard.slice(from, to),
      };
    },

    // ---------- Word loading ----------
    async loadWordLists() {
      for (const level of ["easy", "medium", "hard"]) {
        for (const language of ["english", "arabic"]) {
          this.data.cards[level].words[language] = await this.fetchWords(
            `words/${level}_words_${language}.txt`
          );
        }
      }
    },

    async fetchWords(filePath) {
      try {
        // Revalidate with the server on every load so a fresh deploy's
        // word lists show up immediately instead of after the CDN TTL.
        const response = await fetch(filePath, { cache: "no-cache" });
        const text = await response.text();
        const words = text
          .split("\n")
          .map((word) => word.trim())
          .filter((word) => word !== "");
        return [...new Set(words)];
      } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        return [];
      }
    },

    // ---------- Game flow ----------
    async startGame() {
      if (this.data.cards.easy.words[this.settings.language].length === 0) {
        await this.loadWordLists();
      }

      if (!this.gameName.trim()) {
        this.gameName = this.defaultGameName();
      }
      this.gameName = this.gameName.trim();

      // Snapshot the key so unnamed games don't drift to a new
      // timestamp key on every later save.
      const gameKey = `game_${this.gameName}`;
      this.activeGameKey = gameKey;

      // Resuming an existing game restores the settings it was played with.
      const savedLanguage = this.loadFromStorage(`${gameKey}_language`);
      const savedPerLevel = this.loadFromStorage(`${gameKey}_cardsPerDifficulty`);
      if (savedLanguage) this.settings.language = savedLanguage;
      if (savedPerLevel) this.settings.cardsPerDifficulty = parseInt(savedPerLevel);

      this.shuffledEasy =
        this.loadFromStorage(`${gameKey}_shuffledEasy`) ||
        this.shuffleArray([...this.data.cards.easy.words[this.settings.language]]);
      this.shuffledMedium =
        this.loadFromStorage(`${gameKey}_shuffledMedium`) ||
        this.shuffleArray([...this.data.cards.medium.words[this.settings.language]]);
      this.shuffledHard =
        this.loadFromStorage(`${gameKey}_shuffledHard`) ||
        this.shuffleArray([...this.data.cards.hard.words[this.settings.language]]);

      this.currentWordIndex =
        this.loadFromStorage(`${gameKey}_currentWordIndex`) || 0;

      this.persistDeck();
      this.saveToStorage(`${gameKey}_currentWordIndex`, this.currentWordIndex);
      this.saveGameName(gameKey);

      // Deal the first card in with a flip.
      this.cardFlipped = true;
      this.showCardsPage = true;
      setTimeout(() => {
        this.cardFlipped = false;
      }, 400);
    },

    resetGame() {
      const name = this.gameName.trim();
      if (name) {
        this.clearGameData(`game_${name}`);
      }
      this.startGame();
    },

    backToMenu() {
      this.showCardsPage = false;
      this.isFlipping = false;
      this.cardFlipped = false;
      this.showReshuffleNotice = false;
      this.loadSavedGames();
    },

    generateCard() {
      if (this.isFlipping || !this.deckSize) return;
      this.isFlipping = true;
      this.cardFlipped = true; // flip to the card back

      setTimeout(() => {
        this.advanceCard(); // swap words while the back is showing
        setTimeout(() => {
          this.cardFlipped = false; // flip back to reveal the new card
          setTimeout(() => {
            this.isFlipping = false;
          }, 400);
        }, 120);
      }, 400);
    },

    advanceCard() {
      const perLevel = this.settings.cardsPerDifficulty;

      if (this.currentWordIndex + perLevel < this.deckSize) {
        this.currentWordIndex += perLevel;
      } else {
        // Deck exhausted: reshuffle and start over.
        this.currentWordIndex = 0;
        this.shuffledEasy = this.shuffleArray([...this.shuffledEasy]);
        this.shuffledMedium = this.shuffleArray([...this.shuffledMedium]);
        this.shuffledHard = this.shuffleArray([...this.shuffledHard]);
        this.persistDeck();
        this.flashReshuffleNotice();
      }

      this.saveToStorage(
        `${this.activeGameKey}_currentWordIndex`,
        this.currentWordIndex
      );
    },

    flashReshuffleNotice() {
      this.showReshuffleNotice = true;
      setTimeout(() => {
        this.showReshuffleNotice = false;
      }, 2500);
    },

    persistDeck() {
      const gameKey = this.activeGameKey;
      if (!gameKey) return;
      this.saveToStorage(`${gameKey}_shuffledEasy`, this.shuffledEasy);
      this.saveToStorage(`${gameKey}_shuffledMedium`, this.shuffledMedium);
      this.saveToStorage(`${gameKey}_shuffledHard`, this.shuffledHard);
    },

    defaultGameName() {
      const now = new Date();
      const date = now.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const time = now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `Game ${date} ${time}`;
    },

    // ---------- Saved games ----------
    saveGameName(gameKey) {
      let games = this.loadFromStorage("savedGames") || [];

      if (!games.includes(gameKey)) {
        games.push(gameKey);

        // Keep only the latest 5 saves; wipe evicted games' data too.
        while (games.length > 5) {
          const evicted = games.shift();
          this.clearGameData(evicted);
        }

        this.saveToStorage("savedGames", games);
      }

      this.saveToStorage(`${gameKey}_language`, this.settings.language);
      this.saveToStorage(
        `${gameKey}_cardsPerDifficulty`,
        this.settings.cardsPerDifficulty
      );

      this.loadSavedGames();
    },

    clearGameData(gameKey) {
      [
        "_shuffledEasy",
        "_shuffledMedium",
        "_shuffledHard",
        "_currentWordIndex",
        "_language",
        "_cardsPerDifficulty",
      ].forEach((suffix) => localStorage.removeItem(`${gameKey}${suffix}`));
    },

    deleteGame(gameKey) {
      this.clearGameData(gameKey);

      let games = this.loadFromStorage("savedGames") || [];
      games = games.filter((game) => game !== gameKey);
      this.saveToStorage("savedGames", games);

      this.loadSavedGames();
    },

    loadSavedGames() {
      const games = this.loadFromStorage("savedGames") || [];

      this.savedGames = games.map((gameKey) => {
        const perLevel =
          this.loadFromStorage(`${gameKey}_cardsPerDifficulty`) || 3;
        const index = this.loadFromStorage(`${gameKey}_currentWordIndex`) || 0;
        const deck = this.loadFromStorage(`${gameKey}_shuffledEasy`) || [];
        const totalCards = Math.max(1, Math.ceil(deck.length / perLevel));

        return {
          key: gameKey,
          gameName: gameKey.replace("game_", ""),
          language: this.loadFromStorage(`${gameKey}_language`) || "english",
          cardsPerDifficulty: perLevel,
          cardsCompleted: Math.min(
            totalCards,
            Math.floor(index / perLevel) + 1
          ),
          totalCards,
        };
      });
    },

    loadGame(gameKey) {
      this.gameName = gameKey.replace("game_", "");
      this.startGame();
    },

    // ---------- Utilities ----------
    shuffleArray(array) {
      array = [...new Set(array)];
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },

    saveToStorage(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },

    loadFromStorage(key) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    },

    // ---------- Card metadata ----------
    data: {
      cards: {
        easy: {
          label: { english: "EASY", arabic: "سهل" },
          emoji: "😐",
          words: { english: [], arabic: [] },
          color: "#16A34A", // green
        },
        medium: {
          label: { english: "MEDIUM", arabic: "متوسط" },
          emoji: "🤔",
          words: { english: [], arabic: [] },
          color: "#F59E0B", // amber
        },
        hard: {
          label: { english: "HARD", arabic: "صعب" },
          emoji: "🤯",
          words: { english: [], arabic: [] },
          color: "#DC2626", // red
        },
      },
    },
  }));
});
