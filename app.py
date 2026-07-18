import random
from flask import Flask, render_template, request, jsonify, session

app = Flask(__name__)
app.secret_key = "vault-cracker-secret-key-change-me"

MAX_ATTEMPTS = 10


def new_game():
    session["secret"] = random.randint(1, 100)
    session["attempts_used"] = 0
    session["history"] = []
    session["over"] = False
    session["won"] = False


@app.route("/")
def index():
    new_game()
    return render_template("index.html", max_attempts=MAX_ATTEMPTS)


@app.route("/guess", methods=["POST"])
def guess():
    if "secret" not in session:
        new_game()

    if session.get("over"):
        return jsonify({"error": "The vault is locked. Start a new heist."}), 400

    data = request.get_json(silent=True) or {}
    raw = data.get("value", "")

    try:
        value = int(raw)
    except (TypeError, ValueError):
        return jsonify({"error": "Enter a whole number between 1 and 100."}), 400

    if value < 1 or value > 100:
        return jsonify({"error": "Out of range. The dial only goes from 1 to 100."}), 400

    secret = session["secret"]
    session["attempts_used"] += 1
    attempts_used = session["attempts_used"]
    attempts_left = MAX_ATTEMPTS - attempts_used

    if value == secret:
        session["over"] = True
        session["won"] = True
        result = "correct"
        message = "Tumblers aligned. The vault is open."
    elif value < secret:
        result = "higher"
        message = "Turn the dial higher."
    else:
        result = "lower"
        message = "Turn the dial lower."

    if result != "correct" and attempts_left <= 0:
        session["over"] = True
        session["won"] = False

    entry = {"value": value, "result": result}
    history = session.get("history", [])
    history.append(entry)
    session["history"] = history

    return jsonify(
        {
            "result": result,
            "message": message,
            "value": value,
            "attempts_used": attempts_used,
            "attempts_left": max(attempts_left, 0),
            "max_attempts": MAX_ATTEMPTS,
            "over": session["over"],
            "won": session["won"],
            "secret": secret if session["over"] else None,
        }
    )


@app.route("/reset", methods=["POST"])
def reset():
    new_game()
    return jsonify({"ok": True, "max_attempts": MAX_ATTEMPTS})


if __name__ == "__main__":
    app.run(debug=True)
