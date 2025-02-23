# Concept Word Generator

A **mobile-friendly** word generator for the board game Concept built with **Alpine.js** and **Tailwind CSS**. This project allows users to generate and save randomized word cards, track progress, and load previously saved games.

## 🚀 Features

- **Randomized Word Generation**: Words are loaded from external text files and shuffl*ed for variety.*
- ***Saved Games****: Users can save up to 5 different game sessions.*
- ***Language Toggle****: Supports ****English**** and ****Arabic****.*
- ***Customiza*****ble Difficulty**: Choose how many words per difficulty level appear on each card.
- **Progress Tracking**: Tracks and saves progress between sessions.
- **Deployable via GitHub Pages**: Fully static and ready to be hosted.

## 📂 Project Structure

```
/
├── index.html        # Main UI
├── script.js         # Core Alpine.js logic
├── styles.css        # Tailwind-based styling
├── words/            # Folder for word lists
│   ├── easy_words_english.txt
│   ├── medium_words_english.txt
│   ├── hard_words_english.txt
│   ├── easy_words_arabic.txt
│   ├── medium_words_arabic.txt
│   ├── hard_words_arabic.txt
└── README.md         # This file
```

## 🔧 Installation & Running Locally

1. **Clone the repository**:
   ```sh
   git clone https://github.com/YOUR-USERNAME/concept-word-generator.git
   cd concept-word-generator
   ```
2. **Open ****`index.html`**** in a browser**:
   ```sh
   open index.html  # macOS
   start index.html # Windows
   ```
3. **Ensure words are loaded from the ****`/words/`**** folder**.

## 🚀 Deploying to GitHub Pages

1. **Push your code to GitHub**:
   ```sh
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. **Enable GitHub Pages**:
   - Go to your repository's **Settings**.
   - Scroll to **GitHub Pages**.
   - Set the source to **Deploy from a branch** → `main` → `/ (root)`.
   - Click **Save**.
3. **Your site will be available at**:
   ```
   https://YOUR-USERNAME.github.io/concept-word-generator/
   ```

## 🤝 Contributing

1. **Fork the repository**.
2. **Create a new branch**:
   ```sh
   git checkout -b feature-new-feature
   ```
3. **Commit your changes**:
   ```sh
   git commit -m "Added new feature"
   ```
4. **Push and open a Pull Request**:
   ```sh
   git push origin feature-new-feature
   ```

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---

💡 **Questions?** Feel free to open an issue or reach out! 🚀

