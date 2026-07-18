(function () {
  const MAX_ATTEMPTS = parseInt(document.getElementById("max-attempts-label").textContent, 10);
  const SWEEP_DEG = 300; // total sweep of the dial, centered on top
  const START_DEG = -SWEEP_DEG / 2;

  const form = document.getElementById("guess-form");
  const input = document.getElementById("guess-input");
  const turnBtn = document.getElementById("turn-btn");
  const feedback = document.getElementById("feedback");
  const needle = document.getElementById("needle");
  const readout = document.getElementById("dial-readout");
  const caption = document.getElementById("dial-caption");
  const tumblersEl = document.getElementById("tumblers");
  const logList = document.getElementById("log-list");
  const resetBtn = document.getElementById("reset-btn");
  const ticksGroup = document.getElementById("dial-ticks");

  function buildTicks() {
    ticksGroup.innerHTML = "";
    const cx = 160, cy = 160, rOuter = 128, rInnerMinor = 116, rInnerMajor = 108;
    for (let v = 0; v <= 100; v += 5) {
      const angle = (START_DEG + (v / 100) * SWEEP_DEG - 90) * (Math.PI / 180);
      const major = v % 20 === 0;
      const rInner = major ? rInnerMajor : rInnerMinor;
      const x1 = cx + rOuter * Math.cos(angle);
      const y1 = cy + rOuter * Math.sin(angle);
      const x2 = cx + rInner * Math.cos(angle);
      const y2 = cy + rInner * Math.sin(angle);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1.toFixed(1));
      line.setAttribute("y1", y1.toFixed(1));
      line.setAttribute("x2", x2.toFixed(1));
      line.setAttribute("y2", y2.toFixed(1));
      if (major) line.classList.add("major");
      ticksGroup.appendChild(line);
    }
  }

  function buildTumblers() {
    tumblersEl.innerHTML = "";
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const d = document.createElement("div");
      d.className = "tumbler";
      d.id = "tumbler-" + i;
      tumblersEl.appendChild(d);
    }
  }

  function markTumbler(index, state) {
    const el = document.getElementById("tumbler-" + index);
    if (!el) return;
    el.classList.add("used");
    if (state) el.classList.add(state);
  }

  function rotateNeedle(value) {
    const deg = START_DEG + (value / 100) * SWEEP_DEG;
    needle.style.transform = `rotate(${deg}deg)`;
  }

  function setNeedleColor(result) {
    needle.classList.remove("higher", "lower", "correct");
    let color = "#b5453a";
    if (result === "higher") color = "#5c8a92";
    else if (result === "lower") color = "#b5453a";
    else if (result === "correct") color = "#7ea56b";
    needle.style.stroke = color;
  }

  function addLogEntry(turnNum, value, result) {
    const li = document.createElement("li");
    const label = result === "correct" ? "Aligned" : result === "higher" ? "Go higher" : "Go lower";
    li.innerHTML = `<span>${turnNum}</span><span>${value}</span><span class="reading ${result}">${label}</span>`;
    logList.prepend(li);
  }

  function setFeedback(message, cls) {
    feedback.textContent = message;
    feedback.className = "feedback" + (cls ? " " + cls : "");
  }

  function lockConsole() {
    input.disabled = true;
    turnBtn.disabled = true;
    resetBtn.classList.remove("hidden");
  }

  async function submitGuess(e) {
    e.preventDefault();
    const value = input.value;
    if (value === "") return;

    turnBtn.disabled = true;

    try {
      const res = await fetch("/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: value }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback(data.error || "Something jammed the lock.", "error");
        turnBtn.disabled = false;
        return;
      }

      rotateNeedle(data.value);
      setNeedleColor(data.result);
      readout.textContent = data.value;
      markTumbler(data.attempts_used - 1, data.result === "correct" ? "hit" : "miss");
      addLogEntry(data.attempts_used, data.value, data.result);

      if (data.result === "correct") {
        caption.textContent = "Vault open";
        setFeedback("Tumblers aligned at " + data.value + ". The vault is open.", "correct");
        lockConsole();
      } else if (data.over) {
        caption.textContent = "Vault re-locked";
        setFeedback(
          "Out of turns. The combination was " + data.secret + ". The vault re-locks itself.",
          "over"
        );
        lockConsole();
      } else {
        caption.textContent = data.result === "higher" ? "Reading: too low" : "Reading: too high";
        setFeedback(data.message + " (" + data.attempts_left + " turn" + (data.attempts_left === 1 ? "" : "s") + " left)", data.result);
        turnBtn.disabled = false;
      }

      input.value = "";
      if (!data.over) input.focus();
    } catch (err) {
      setFeedback("Lost contact with the vault. Try again.", "error");
      turnBtn.disabled = false;
    }
  }

  async function resetGame() {
    await fetch("/reset", { method: "POST" });
    buildTumblers();
    readout.textContent = "--";
    caption.textContent = "Awaiting first turn";
    needle.style.transform = "rotate(0deg)";
    needle.style.stroke = "#b5453a";
    logList.innerHTML = "";
    setFeedback("The lock is cold. Enter a number to begin cracking the vault.", "");
    input.disabled = false;
    turnBtn.disabled = false;
    resetBtn.classList.add("hidden");
    input.focus();
  }

  form.addEventListener("submit", submitGuess);
  resetBtn.addEventListener("click", resetGame);

  buildTicks();
  buildTumblers();
})();
