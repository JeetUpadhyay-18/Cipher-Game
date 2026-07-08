# Cipher — A Quiet Game of Deduction

A minimalist, elegant 4-digit number deduction game (Mastermind-style) with a moody dark theme, generative ambient jazz soundtrack, and a "trace log" of your guesses.

![Cipher](assets/screenshot.png)

## 🎮 How to Play

1. A secret 4-digit number is chosen at the start of each game — all digits are unique (0–9).
2. Enter your 4-digit guess and click **Decode** (or press **Enter**).
3. You'll be told:
   - How many **digits** in your guess exist in the secret number.
   - How many **positions** are exactly correct.
4. Keep guessing until all 4 positions match. There's no attempt limit or timer.
5. Use the **Scratchpad** in the corner to jot down notes and eliminate possibilities.

## ✨ Features

- Clean, distraction-free single-column UI with a "trace log" side panel recording every guess
- Ambient, generative jazz background music built entirely with the Web Audio API (no audio files)
- Smooth intro screen, win overlay, and subtle micro-interactions (shake on invalid input, animated feedback)
- Fully client-side — no build step, no dependencies, no backend

## 📁 Project Structure

```
├── index.html      # Markup / structure
├── style.css       # All styling (theme, layout, animations)
├── script.js       # Audio engine + game logic
├── README.md
├── LICENSE
└── assets/         # Screenshots / images (optional)
```

## 🚀 Running Locally

No build tools or dependencies required. Just open `index.html` in a modern browser:

```bash
git clone https://github.com/<your-username>/cipher-game.git
cd cipher-game
open index.html   # or double-click it, or serve it locally:
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## 🌐 Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set the source branch to `main` and the folder to `/ (root)`.
4. Your game will be live at `https://<your-username>.github.io/cipher-game/`.

## 🛠️ Tech Stack

- HTML5
- CSS3 (custom properties, animations, no framework)
- Vanilla JavaScript (ES6+)
- Web Audio API (for the generative jazz soundtrack)
- Google Fonts: DM Serif Display, DM Mono, Cormorant Garamond

## 📄 License

Released under the [MIT License](LICENSE).
