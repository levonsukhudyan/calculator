const display = document.getElementById("display");
const keys = document.querySelector(".keys");

let expression = "";
let justCalculated = false;

function updateDisplay(value = expression) {
  display.value = value;
}

function isOperator(character) {
  return ["+", "-", "*", "/"].includes(character);
}

function appendValue(value) {
  if (justCalculated && !isOperator(value)) {
    expression = "";
  }
  justCalculated = false;

  if (isOperator(value)) {
    if (expression.length === 0) {
      if (value !== "-") return;
    } else if (isOperator(expression.at(-1))) {
      // Replace the previous operator instead of creating an invalid sequence.
      expression = expression.slice(0, -1);
    }
  }

  expression += value;
  updateDisplay();
}

function clearCalculator() {
  expression = "";
  justCalculated = false;
  updateDisplay("");
}

// Parse arithmetic expressions without eval(). Multiplication and division
// are handled before addition and subtraction.
function calculate(source) {
  const tokens = source.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.join("") !== source.replace(/\s/g, "")) {
    throw new Error("Invalid expression");
  }

  let position = 0;

  function parseNumber() {
    let sign = 1;
    if (tokens[position] === "-") {
      sign = -1;
      position++;
    }

    const token = tokens[position];
    if (token === undefined || isOperator(token)) {
      throw new Error("A number is missing");
    }

    position++;
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error("Invalid number");
    return sign * value;
  }

  function parseTerm() {
    let value = parseNumber();

    while (tokens[position] === "*" || tokens[position] === "/") {
      const operator = tokens[position++];
      const next = parseNumber();

      if (operator === "/" && next === 0) {
        throw new Error("Cannot divide by zero");
      }
      value = operator === "*" ? value * next : value / next;
    }
    return value;
  }

  function parseExpression() {
    let value = parseTerm();

    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position++];
      const next = parseTerm();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }

  const result = parseExpression();
  if (position !== tokens.length || !Number.isFinite(result)) {
    throw new Error("Invalid expression");
  }
  return result;
}

function showResult() {
  if (!expression) return;

  try {
    const result = calculate(expression);
    // Avoid displaying floating-point noise such as 0.30000000000000004.
    const rounded = Number.parseFloat(result.toPrecision(12));
    expression = String(rounded);
    updateDisplay(expression);
    justCalculated = true;
  } catch (error) {
    updateDisplay(error.message === "Cannot divide by zero" ? "Cannot divide by 0" : "Error");
    expression = "";
    justCalculated = true;
  }
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "clear") {
    clearCalculator();
  } else if (button.dataset.action === "equals") {
    showResult();
  } else if (button.dataset.value) {
    appendValue(button.dataset.value);
  }
});

// Keyboard support is included in addition to the on-screen buttons.
document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key) || isOperator(event.key) || event.key === ".") {
    event.preventDefault();
    appendValue(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    showResult();
  } else if (event.key === "Escape" || event.key === "Delete") {
    clearCalculator();
  } else if (event.key === "Backspace") {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
  }
});
