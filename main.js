"use strict";

////////////////////////////////////////////////////
// VARIABLES & CONSTANTS
const actDisplay = document.querySelector(".act");
const prevDisplay = document.querySelector(".prev");
let operator,
  prevOperator,
  actNumber,
  prevNumber,
  result,
  delAllFromActDisplay,
  initial,
  working;

/////////////////////////////////////////////
// FUNCTIONS
const init = function () {
  actDisplay.textContent = "0";
  prevDisplay.textContent = "";
  actNumber = "";
  prevNumber = "";
  result = "0";
  operator = undefined;
  prevOperator = undefined;
  initial = 1;
  working = 1;
  document
    .querySelectorAll("[data-disableable='true']")
    .forEach((el) => el.classList.remove("btn-disabled"));
};
init();

const disableCalculator = function () {
  working = 0;
  document
    .querySelectorAll("[data-disableable='true']")
    .forEach((el) => el.classList.add("btn-disabled"));
};

// FORMAT NUMBER (SPACES)
const formatNumber = function (num) {
  let parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
};

// RETURN RESULT BASED ON CONTAINER WIDTH
const resultFit = function (num) {
  const formatted = formatNumber(num);
  if (formatted.includes("e")) {
    disableCalculator();
    return "Too long";
  }
  actDisplay.textContent = formatted;
  if (actDisplay.textContent === "Infinity") {
    disableCalculator();
    return "Infinity";
  }
  if (
    document.querySelector(".result").getBoundingClientRect().width - 40 >
    actDisplay.getBoundingClientRect().width
  ) {
    return formatted;
  } else if (
    document.querySelector(".result").getBoundingClientRect().width - 40 <=
      actDisplay.getBoundingClientRect().width &&
    formatted.indexOf(".") !== -1
  ) {
    result = formatNumber(parseFloat(num.toString().substring(0, 13)));
    return result;
  } else {
    disableCalculator();
    return "Too long";
  }
};

// CLEAR ALL
const clear = function () {
  init();
};

// DELETE LAST LETTER FROM ACTDISPLAY
const deleteLast = function () {
  actDisplay.textContent = actDisplay.textContent.slice(0, -1);
  actNumber = actNumber.slice(0, -1);
};

const addToActDisplay = function (val) {
  // CHECK IF ACT DISPLAY CAN FIT IN RESULT DIV
  if (
    document.querySelector(".result").getBoundingClientRect().width - 40 <
      actDisplay.getBoundingClientRect().width &&
    actNumber !== "0"
  )
    return;
  actNumber += val;
  // CHECK IF ACTNUMBER STARTS WITH 0 OR HAVE A DOT (BLOCK TYPING MANY DOTS OR ZEROS)
  if (actNumber[0] === "0" && actNumber.indexOf(".") < 0)
    actNumber = actNumber.slice(1);

  // DISPLAY NUMBER IN ACTDISPLAY
  actDisplay.textContent = formatNumber(actNumber);
};

// PREVDISPLAY
const addToPrevDisplay = function () {
  // DISPLAY BASED ON INITIAL VARIABLE
  if (initial === 1) {
    prevDisplay.innerHTML = `${formatNumber(actNumber)} ${
      operator === "="
        ? '<i class="fa-solid fa-equals"></i>'
        : operator === "/"
        ? '<i class="fa-solid fa-divide"></i>'
        : operator === "x"
        ? '<i class="fa-solid fa-xmark"></i>'
        : operator === "+"
        ? '<i class="fa-solid fa-plus"></i>'
        : '<i class="fa-solid fa-minus"></i>'
    } `;
  } else {
    prevDisplay.innerHTML += `${formatNumber(actNumber)} ${
      operator === "="
        ? '<i class="fa-solid fa-equals"></i>'
        : operator === "/"
        ? '<i class="fa-solid fa-divide"></i>'
        : operator === "x"
        ? '<i class="fa-solid fa-xmark"></i>'
        : operator === "+"
        ? '<i class="fa-solid fa-plus"></i>'
        : '<i class="fa-solid fa-minus"></i>'
    } `;
  }
  if (prevNumber === "") prevNumber = actNumber;

  delAllFromActDisplay = 1;
};

// CALCULATE
const calculate = function () {
  switch (operator) {
    case "/":
      result = parseFloat(prevNumber) / parseFloat(actNumber);
      break;
    case "x":
      result = parseFloat(prevNumber) * parseFloat(actNumber);
      break;
    case "+":
      result = parseFloat(prevNumber) + parseFloat(actNumber);
      break;
    case "-":
      result = parseFloat(prevNumber) - parseFloat(actNumber);
      break;
  }
  actDisplay.textContent = resultFit(result);
  prevNumber = actNumber;
  actNumber = "";
  initial = 0;
};

/////////////////////////////////////////////////
// EVENT LISTENERS
// ONE EVEN LISTENER ON PARENT CONTAINER OF ALL BUTTONS
document.querySelector(".container").addEventListener("click", function (e) {
  // CHECK IF CLEAR BUTTON WAS CLICKED
  if (e.target?.value === "c" || e.target.closest("button")?.value === "c") {
    clear();

    // CHECK IF DELETE BUTTON WAS CLICKED
  } else if (
    (e.target?.value === "del" ||
      e.target.closest("button")?.value === "del") &&
    working === 1
  ) {
    deleteLast();

    // CHECK IF NUMBER OR DOT BUTTON WAS CLICKED
  } else if (/[0-9.]/.test(e.target?.value)) {
    if (operator === "=" || working === 0) init();
    if (delAllFromActDisplay === 1) {
      actNumber = "0";
      delAllFromActDisplay = 0;
    }
    if (e.target.value === "0" && actNumber === "") actNumber = "0";
    if (e.target.value === "." && actNumber.indexOf(".") >= 0) return;
    if (e.target.value === "." && actNumber === "") actNumber = "0";
    if (prevNumber !== "") initial = 0;

    addToActDisplay(e.target.value);

    // CHECK IF MATH OPERATION BUTTON WAS CLICKED
  } else if (
    (/[\/\x\-\+\=]/.test(e.target?.value) ||
      /[\/\x\-\+\=]/.test(e.target?.closest("button")?.value)) &&
    working === 1
  ) {
    let val = e.target.value || e.target.closest("button").value;

    if (/[\/\x\-\+]/.test(val)) {
      if (prevNumber !== "" && actNumber === "")
        prevDisplay.textContent = result;
      if (prevNumber === "" && actNumber === "") return;
      if (prevNumber !== "" && actNumber !== "" && initial === 0) {
        calculate();
        if (
          actDisplay.textContent === "Too long" ||
          actDisplay.textContent === "Infinity"
        ) {
          disableCalculator();
          prevDisplay.innerHTML += `${formatNumber(
            prevNumber
          )} <i class="fa-solid fa-equals"></i> `;
          return;
        }
        prevDisplay.textContent = result;
        prevNumber = result;
      }

      operator = val;
      addToPrevDisplay();
    } else if (val === "=") {
      if (
        (prevNumber !== "" && actNumber === "") ||
        prevNumber === "" ||
        initial !== 0
      )
        return;
      calculate();
      prevOperator = operator;
      operator = val;
      prevDisplay.innerHTML += `${formatNumber(
        prevNumber
      )} <i class="fa-solid fa-equals"></i> `;
      prevNumber = result;
    }
  }
});
