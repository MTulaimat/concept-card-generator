document.addEventListener("alpine:init", () => {
  Alpine.data("cardData", () => ({
    currentLanguage: "english", // Default language

    toggleLanguage() {
      console.log("Toggling language...");
      this.currentLanguage =
        this.currentLanguage === "english" ? "arabic" : "english";
    },

    get data() {
      return {
        easy: {
          emoji: "😐",
          words: {
            english: ["Word 1", "Word 2", "Word 3"],
            arabic: ["كلمة ١", "كلمة ٢", "كلمة ٣"],
          },
          color: "#008000", // Green
        },
        medium: {
          emoji: "🤔",
          words: {
            english: ["Word 4", "Word 5", "Word 6"],
            arabic: ["كلمة ٤", "كلمة ٥", "كلمة ٦"],
          },
          color: "#F47F00", // Orange
        },
        hard: {
          emoji: "🤯",
          words: {
            english: ["Word 7", "Word 8", "Word 9"],
            arabic: ["كلمة ٧", "كلمة ٨", "كلمة ٩"],
          },
          color: "#FF0000", // Red
        },
      };
    },

    generateCard() {
      console.log("Generating card...");
    },
  }));
});
