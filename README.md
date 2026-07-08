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

## 📁 Project Structure

```
├── index.html      # Markup / structure
├── style.css       # All styling (theme, layout, animations)
├── script.js       # Audio engine + game logic
├── README.md
├── LICENSE
└── assets/         # Screenshots / images (optional)
```


## 🛠️ Tech Stack

- HTML5
- CSS3 (custom properties, animations, no framework)
- Vanilla JavaScript (ES6+)
- Web Audio API (for the generative jazz soundtrack)
- Google Fonts: DM Serif Display, DM Mono, Cormorant Garamond

## 📄 License

Released under the [MIT License](LICENSE).
