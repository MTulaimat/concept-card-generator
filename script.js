document.addEventListener("alpine:init", () => {
  Alpine.data("cardData", () => ({
    settings: {
      cardsPerDifficulty: 3, // Default: Show 3 words per difficulty
      language: "english",
    },

    toggleLanguage() {
      console.log("Toggling language...");
      this.settings.language =
        this.settings.language === "english" ? "arabic" : "english";
      console.log("Current Language:", this.settings.language);
    },

    updateCardsPerDifficulty(value) {
      this.settings.cardsPerDifficulty = parseInt(value);
      console.log("Words Per Difficulty:", this.settings.cardsPerDifficulty);
    },

    get data() {
      return {
        cards: {
          easy: {
            order: 1,
            emoji: "😐",
            words: {
              english: ["Word 1", "Word 2", "Word 3", "Word 4", "Word 5"],
              arabic: ["كلمة ١", "كلمة ٢", "كلمة ٣", "كلمة ٤", "كلمة ٥"],
            },
            color: "#008000", // Green
          },
          medium: {
            order: 4,
            emoji: "🤔",
            words: {
              english: ["Word 6", "Word 7", "Word 8", "Word 9", "Word 10"],
              arabic: ["كلمة ٦", "كلمة ٧", "كلمة ٨", "كلمة ٩", "كلمة ١٠"],
            },
            color: "#F47F00", // Orange
          },
          hard: {
            order: 7,
            emoji: "🤯",
            words: {
              english: ["Word 11", "Word 12", "Word 13", "Word 14", "Word 15"],
              arabic: ["كلمة ١١", "كلمة ١٢", "كلمة ١٣", "كلمة ١٤", "كلمة ١٥"],
            },
            color: "#FF0000", // Red
          },
        },
      };
    },

    generateCard() {
      console.log("Generating card...");
    },
  }));
});
