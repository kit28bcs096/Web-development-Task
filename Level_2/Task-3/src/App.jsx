import { useState, useEffect } from "react";
import "./App.css";

function CalculatorButton({ value, onClick, type = "", isActive = false }) {
  return (
    <button
      className={`calculator-button ${type} ${isActive ? "active" : ""}`}
      onClick={() => onClick(value)}
    >
      {value}
    </button>
  );
}

function Display({ equation, value }) {
  return (
    <div className="display-screen">
      <div className="display-equation">{equation}</div>
      <div className="display-value">{value}</div>
    </div>
  );
}

function evaluateExpression(expr) {
  const sanitized = expr.replace(/×/g, "*").replace(/÷/g, "/");
  if (!/^[\d\s+\-*/.]+$/.test(sanitized)) {
    return "Error";
  }

  const tokens = sanitized.match(/(\d+(\.\d+)?|[+\-*/])/g);
  if (!tokens || tokens.length === 0) return "0";

  if (["+", "-", "*", "/"].includes(tokens[tokens.length - 1])) {
    tokens.pop();
  }
  if (tokens.length === 0) return "0";

  const pass1 = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === "*" || token === "/") {
      const prev = pass1.pop();
      const next = parseFloat(tokens[i + 1]);
      if (isNaN(next)) return "Error";
      if (token === "/" && next === 0) return "Error";
      const res = token === "*" ? prev * next : prev / next;
      pass1.push(res);
      i += 2;
    } else if (token === "+" || token === "-") {
      pass1.push(token);
      i++;
    } else {
      pass1.push(parseFloat(token));
      i++;
    }
  }

  let result = pass1[0];
  let j = 1;
  while (j < pass1.length) {
    const op = pass1[j];
    const val = pass1[j + 1];
    if (op === "+") result += val;
    else if (op === "-") result -= val;
    j += 2;
  }

  if (isNaN(result) || !isFinite(result)) return "Error";

  return String(Math.round(result * 100000000) / 100000000);
}

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [activeKey, setActiveKey] = useState(null);

  function triggerButtonEffect(val) {
    setActiveKey(val);
    setTimeout(() => {
      setActiveKey((current) => (current === val ? null : current));
    }, 150);
  }

  function handleNumber(number) {
    if (isFinished) {
      setDisplay(String(number));
      setEquation("");
      setIsFinished(false);
      return;
    }

    if (display === "0" || display === "Error") {
      setDisplay(String(number));
    } else {
      setDisplay(display + number);
    }
  }

  function handleOperator(selectedOperator) {
    if (display === "Error") return;

    if (isFinished) {
      setIsFinished(false);
      setEquation("");
      setDisplay(display + " " + selectedOperator + " ");
      return;
    }

    const trimmed = display.trim();
    const lastChar = trimmed.slice(-1);

    if (["+", "-", "×", "÷"].includes(lastChar)) {
      setDisplay(trimmed.slice(0, -1) + selectedOperator + " ");
    } else {
      setDisplay(display + " " + selectedOperator + " ");
    }
  }

  function calculate() {
    if (display === "Error" || isFinished) return;

    const trimmed = display.trim();
    const lastChar = trimmed.slice(-1);
    if (["+", "-", "×", "÷"].includes(lastChar)) return;

    if (!/[+\-×÷]/.test(display)) return;

    const result = evaluateExpression(display);
    setEquation(display + " =");
    setDisplay(result);
    setIsFinished(true);
  }

  function clearCalculator() {
    setDisplay("0");
    setEquation("");
    setIsFinished(false);
  }

  function handleBackspace() {
    if (isFinished || display === "Error") {
      clearCalculator();
      return;
    }
    const trimmed = display.trimEnd();
    if (trimmed.length <= 1) {
      setDisplay("0");
    } else if (["+", "-", "×", "÷"].includes(trimmed.slice(-1))) {
      setDisplay(trimmed.slice(0, -1).trimEnd());
    } else {
      setDisplay(display.slice(0, -1));
    }
  }

  function handleDecimal() {
    if (isFinished || display === "Error") {
      setDisplay("0.");
      setEquation("");
      setIsFinished(false);
      return;
    }
    const parts = display.split(/[+\-×÷]/);
    const currentNumber = parts[parts.length - 1];
    if (!currentNumber.includes(".")) {
      setDisplay(display + ".");
    }
  }

  function handleButton(value) {
    triggerButtonEffect(value);

    if (!isNaN(value)) {
      handleNumber(value);
      return;
    }

    if (value === "C") {
      clearCalculator();
      return;
    }

    if (value === "=") {
      calculate();
      return;
    }

    if (["+", "-", "×", "÷"].includes(value)) {
      handleOperator(value);
    }
  }

  // Handle system keyboard input
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        triggerButtonEffect(key);
        handleNumber(key);
      } else if (key === "+") {
        e.preventDefault();
        triggerButtonEffect("+");
        handleOperator("+");
      } else if (key === "-") {
        e.preventDefault();
        triggerButtonEffect("-");
        handleOperator("-");
      } else if (key === "*" || key.toLowerCase() === "x") {
        e.preventDefault();
        triggerButtonEffect("×");
        handleOperator("×");
      } else if (key === "/") {
        e.preventDefault();
        triggerButtonEffect("÷");
        handleOperator("÷");
      } else if (key === "=" || key === "Enter") {
        e.preventDefault();
        triggerButtonEffect("=");
        calculate();
      } else if (key.toLowerCase() === "c" || key === "Escape") {
        e.preventDefault();
        triggerButtonEffect("C");
        clearCalculator();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (key === ".") {
        e.preventDefault();
        handleDecimal();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, isFinished]);

  return (
    <div className="calculator-wrapper">
      <Display equation={equation} value={display} />
      <div className="button-grid">
        <CalculatorButton
          value="7"
          onClick={handleButton}
          isActive={activeKey === "7"}
        />
        <CalculatorButton
          value="8"
          onClick={handleButton}
          isActive={activeKey === "8"}
        />
        <CalculatorButton
          value="9"
          onClick={handleButton}
          isActive={activeKey === "9"}
        />
        <CalculatorButton
          value="÷"
          onClick={handleButton}
          type="operator"
          isActive={activeKey === "÷"}
        />

        <CalculatorButton
          value="4"
          onClick={handleButton}
          isActive={activeKey === "4"}
        />
        <CalculatorButton
          value="5"
          onClick={handleButton}
          isActive={activeKey === "5"}
        />
        <CalculatorButton
          value="6"
          onClick={handleButton}
          isActive={activeKey === "6"}
        />
        <CalculatorButton
          value="×"
          onClick={handleButton}
          type="operator"
          isActive={activeKey === "×"}
        />

        <CalculatorButton
          value="1"
          onClick={handleButton}
          isActive={activeKey === "1"}
        />
        <CalculatorButton
          value="2"
          onClick={handleButton}
          isActive={activeKey === "2"}
        />
        <CalculatorButton
          value="3"
          onClick={handleButton}
          isActive={activeKey === "3"}
        />
        <CalculatorButton
          value="-"
          onClick={handleButton}
          type="operator"
          isActive={activeKey === "-"}
        />

        <CalculatorButton
          value="0"
          onClick={handleButton}
          isActive={activeKey === "0"}
        />
        <CalculatorButton
          value="C"
          onClick={handleButton}
          type="clear"
          isActive={activeKey === "C"}
        />
        <CalculatorButton
          value="="
          onClick={handleButton}
          type="equals"
          isActive={activeKey === "="}
        />
        <CalculatorButton
          value="+"
          onClick={handleButton}
          type="operator"
          isActive={activeKey === "+"}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app-container">
      <Calculator />
    </div>
  );
}

export default App;