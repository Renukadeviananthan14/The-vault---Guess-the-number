# 🔐 The Vault — Guess the Number Game

A browser-based twist on the classic "guess the number" game, themed as a safe-cracking heist. Built with **Flask** on the backend and a custom **vanilla JavaScript / SVG / CSS** frontend — no external UI frameworks.

Guess a number between 1 and 100 in 5 turns. Every guess rotates a live combination dial and lights up a tumbler, nudging you closer (or further) from cracking the vault.

## Features

- 🎯 Classic higher/lower number-guessing logic, with a limited number of attempts
- 🕹️ Animated SVG dial that rotates to reflect each guess
- 🔩 Tumbler pins that light up green (hit) or red (miss) per attempt
- 📜 Live guess log tracking every turn
- 🔁 One-click reset to start a new game
- 🔒 Server-side game state via Flask sessions — no client-side cheating

## Tech Stack

| Layer     | Tech                          |
|-----------|--------------------------------|
| Backend   | Python, Flask                 |
| Frontend  | HTML, CSS, vanilla JavaScript, SVG |
| State     | Flask session (server-side)   |

## Project Structure

```
vault_game/
├── app.py                 # Flask app: routes, game logic, session state
├── templates/
│   └── index.html         # Main page markup
└── static/
    ├── style.css           # Vault/safe-cracking themed styling
    └── script.js            # Dial animation, AJAX calls, game UI logic
```

## Getting Started

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
git clone https://github.com/<your-username>/vault-guess-the-number.git
cd vault-guess-the-number
pip install flask
```

### Run

```bash
python app.py
```

Open your browser at **http://127.0.0.1:5000**

## How to Play

1. A secret number between 1 and 100 is chosen when the page loads.
2. Enter a number and click **Turn Dial**.
3. You'll be told if the number is too high or too low — the dial and tumblers update accordingly.
4. Crack the combination within **5 turns** to open the vault.
5. Click **Start New Heist** to play again.

## Game Logic

The core guessing logic lives in `app.py`:

- Validates input is a whole number between 1–100
- Compares the guess to the secret number (`<`, `==`, `>`)
- Tracks attempts used and enforces the 5-turn limit
- Ends the game on a correct guess or when attempts run out

## Simple Logic

import random
print ("Welcome to guess the number game")
print ("Enter the number between 1 to 100")
secret_key = random.randint(1,100)

for i in range (1,6):
    user_input = int(input("Enter the number"))
    if user_input < 1 or user_input > 100:
        print ("Oops! Invalid Number. Enter the number between 1 to 100")
    elif user_input == secret_key:
        print("Your guessed number is correct")
    elif user_input > secret_key:
        print ("Your number is greater than secret key")
    else:
        print("Your number is lesser than secret key")
else:
    print("Your trails are over. Try again")

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Built by Renuka devi Ananthan — backend game logic developed independently, frontend design and Flask integration built with Claude.
