const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const operatorPattern = /[+\-*/%]/;

let currentInput = "0";

function updateDisplay() {
  display.textContent = currentInput;
}

function clearDisplay() {
  currentInput = "0";
  updateDisplay();
}

function deleteLastCharacter() {
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
  updateDisplay();
}

function appendValue(value) {
  if (currentInput === "0" && value !== ".") {
    currentInput = value;
    updateDisplay();
    return;
  }

  const parts = currentInput.split(operatorPattern);
  const lastPart = parts[parts.length - 1];

  if (value === "." && lastPart.includes(".")) {
    return;
  }

  if (value === "." && lastPart === "") {
    currentInput += "0.";
    updateDisplay();
    return;
  }

  currentInput += value;
  updateDisplay();
}

function appendOperator(operator) {
  if (currentInput === "0") {
    return;
  }

  const lastCharacter = currentInput.slice(-1);

  if (operatorPattern.test(lastCharacter)) {
    currentInput = currentInput.slice(0, -1) + operator;
  } else {
    currentInput += operator;
  }

  updateDisplay();
}

function tokenizeExpression(expression) {
  const tokens = [];
  let numberBuffer = "";

  for (const character of expression) {
    if ((character >= "0" && character <= "9") || character === ".") {
      numberBuffer += character;
      continue;
    }

    if (operatorPattern.test(character)) {
      if (numberBuffer === "") {
        return null;
      }

      tokens.push(Number(numberBuffer), character);
      numberBuffer = "";
      continue;
    }

    return null;
  }

  if (numberBuffer === "") {
    return null;
  }

  tokens.push(Number(numberBuffer));
  return tokens.every((token) => typeof token === "number" ? !Number.isNaN(token) : true) ? tokens : null;
}

function evaluateTokens(tokens, operators) {
  const result = [tokens[0]];

  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index];
    const nextValue = tokens[index + 1];

    if (!operators.includes(operator)) {
      result.push(operator, nextValue);
      continue;
    }

    const previousValue = result.pop();
    let computedValue;

    if (operator === "*") {
      computedValue = previousValue * nextValue;
    } else if (operator === "/") {
      computedValue = previousValue / nextValue;
    } else if (operator === "%") {
      computedValue = previousValue % nextValue;
    } else if (operator === "+") {
      computedValue = previousValue + nextValue;
    } else {
      computedValue = previousValue - nextValue;
    }

    result.push(computedValue);
  }

  return result;
}

function calculateResult() {
  try {
    const tokens = tokenizeExpression(currentInput);

    if (!tokens) {
      currentInput = "Error";
      updateDisplay();
      return;
    }

    const highPriorityPass = evaluateTokens(tokens, ["*", "/", "%"]);
    const finalPass = evaluateTokens(highPriorityPass, ["+", "-"]);
    const result = finalPass[0];

    if (!Number.isFinite(result)) {
      currentInput = "Error";
    } else {
      currentInput = Number.isInteger(result) ? String(result) : result.toFixed(2).replace(/\.?0+$/, "");
    }
  } catch (error) {
    currentInput = "Error";
  }

  updateDisplay();
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const { value, action } = button.dataset;

    if (action === "clear") {
      clearDisplay();
      return;
    }

    if (action === "delete") {
      deleteLastCharacter();
      return;
    }

    if (action === "calculate") {
      calculateResult();
      return;
    }

    if (currentInput === "Error") {
      currentInput = "0";
    }

    if (operatorPattern.test(value)) {
      appendOperator(value);
      return;
    }

    appendValue(value);
  });
});

window.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/\d/.test(key) || key === ".") {
    if (currentInput === "Error") {
      currentInput = "0";
    }

    appendValue(key);
    return;
  }

  if (["+", "-", "*", "/", "%"].includes(key)) {
    if (currentInput === "Error") {
      currentInput = "0";
    }

    appendOperator(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    calculateResult();
    return;
  }

  if (key === "Backspace") {
    deleteLastCharacter();
    return;
  }

  if (key === "Escape") {
    clearDisplay();
  }
});

updateDisplay();
