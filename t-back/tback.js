(() => {
  // tback.ts
  var SETS = {
    english: ["C", "H", "K", "L", "Q", "R", "S", "T"],
    russian: ["Б", "Ж", "К", "Л", "Н", "Р", "С", "Т"],
    digits: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
  };
  var N_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var LAST_RESULT_KEY = "tback.lastResult";
  var settings = { set: "english", n: 2 };
  var symbols = [];
  var streak = 0;
  var sign = "";
  var [stage, card, nextCard, signView, streakView, lastView, settingsView] = [
    "stage",
    "card",
    "next",
    "sign",
    "streak",
    "last",
    "settings"
  ].map((id) => document.getElementById(id));
  function pick(from) {
    return from[Math.floor(Math.random() * from.length)];
  }
  function nextSymbol(shown, set, n) {
    if (shown.length < n)
      return pick(set);
    const back = shown[shown.length - n];
    if (Math.random() < 1 / 3)
      return back;
    return pick(set.filter((symbol) => symbol !== back));
  }
  function correctSide(shown, n) {
    const last = shown.length - 1;
    if (last < n)
      return null;
    return shown[last] === shown[last - n] ? "right" : "left";
  }
  function beforeFirstSwipe() {
    return symbols.length === 1;
  }
  function show() {
    const start = beforeFirstSwipe();
    const last = localStorage.getItem(LAST_RESULT_KEY);
    settingsView.hidden = !start;
    lastView.hidden = !start || last === null;
    lastView.textContent = last;
    streakView.hidden = start;
    streakView.textContent = String(streak);
    signView.textContent = sign;
    for (const button of settingsView.querySelectorAll("button")) {
      const inUse = button.value === settings.set || button.value === String(settings.n);
      button.setAttribute("aria-pressed", String(inUse));
    }
  }
  function putCard() {
    card.textContent = symbols[symbols.length - 1];
    nextCard.textContent = nextSymbol(symbols, SETS[settings.set], settings.n);
    stage.scrollLeft = stage.clientWidth;
  }
  function newGame(withSign) {
    streak = 0;
    sign = withSign;
    symbols = [nextSymbol([], SETS[settings.set], settings.n)];
    putCard();
    show();
  }
  function answer(side) {
    const correct = correctSide(symbols, settings.n);
    if (correct !== null && side !== correct) {
      localStorage.setItem(LAST_RESULT_KEY, String(streak));
      newGame("wrong");
      return;
    }
    if (correct !== null)
      streak += 1;
    sign = correct !== null ? "correct" : "";
    symbols.push(nextCard.textContent);
    putCard();
    show();
  }
  function addButton(label, value, change) {
    const button = document.createElement("button");
    button.textContent = label;
    button.value = value;
    button.addEventListener("click", () => {
      if (!beforeFirstSwipe())
        return;
      change();
      show();
    });
    settingsView.append(button);
  }
  for (const name of Object.keys(SETS)) {
    addButton(SETS[name].slice(0, 3).join(" "), name, () => {
      settings.set = name;
      symbols = [nextSymbol([], SETS[name], settings.n)];
      putCard();
    });
  }
  for (const n of N_VALUES) {
    addButton(String(n), String(n), () => {
      settings.n = n;
    });
  }
  var settle;
  stage.addEventListener("scroll", () => {
    clearTimeout(settle);
    settle = setTimeout(() => {
      if (stage.scrollLeft < stage.clientWidth / 2)
        answer("right");
      if (stage.scrollLeft > stage.clientWidth * 1.5)
        answer("left");
    }, 100);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft")
      return;
    event.preventDefault();
    if (event.repeat)
      return;
    if (event.key === "ArrowRight")
      stage.scrollTo({ left: 0, behavior: "smooth" });
    if (event.key === "ArrowLeft")
      stage.scrollTo({ left: stage.clientWidth * 2, behavior: "smooth" });
  });
  newGame("");
})();
