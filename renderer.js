const { ipcRenderer } = require("electron");

let plateSizesArray = [];

async function initPlateSizes() {
  plateSizesArray = await ipcRenderer.invoke("get-plate-sizes");
}

const getInputTextArea = () => document.getElementById("inputTextArea");
const getOutputTextArea = () => document.getElementById("outputTextArea");
const getSizeInput = () => document.getElementById("sizeInput");
const getTrayInput = () => document.getElementById("trayInput");
const getAwNumInput = () => document.getElementById("awNumInput");
const getOrderNumInput = () => document.getElementById("orderNumInput");
const getEmailModeToggle = () => document.getElementById("emailModeToggle");

const setOrderNumber = (orderNumber) => {
  getOrderNumInput().value = orderNumber;
};

let itemSizes = [];

function clearInputText() {
  getInputTextArea().value = "";
  getSizeInput().value = "";
  getTrayInput().value = "";
  getAwNumInput().value = "";
  setOrderNumber("");
  itemSizes = [];
}

function clearOutputText() {
  const outputTextArea = getOutputTextArea();
  outputTextArea.value = "";
}

function copyOutputTextarea() {
  const outputTextArea = getOutputTextArea();

  navigator.clipboard.writeText(outputTextArea.value).catch(() => alert("Failed to copy."));

  window.getSelection().removeAllRanges();
}

function getCleanText(inputText) {
  return (
    inputText
      // Trim each line
      .split(/\r?\n/)
      .map((line) => line.trim())
      .join("\n")
      // Remove lines with exactly 10 dashes followed immediately by Back Plate line(s)
      .replace(/^-{10}\r?\nBack Plate:.*\r?\n?/gm, "")
      // Replace lines with exactly 20 dashes or a single dot line with a blank line
      .replace(/^(-{20}|[.])$/gm, "\n")
      // Get rid of top and bottom blank lines
      .trim()
      // Split on blank lines (2 or more newlines)
      .split(/\n\s*\n/)
      // Trim each block and replace internal newlines with tabs
      .map((block) => block.trim().replace(/\r?\n/g, "\t"))
      .filter(Boolean)
      .join("\n")
  );
}

function cleanText() {
  const inputTextArea = getInputTextArea().value;

  const cleaned = getCleanText(inputTextArea);

  getOutputTextArea().value = cleaned;
}

function cleanEmailEngraving() {
  const inputTextArea = getInputTextArea().value;

  const orderNumber = inputTextArea.match(/(?<=^Order No\s+)\S+$/m)[0];
  setOrderNumber(orderNumber);

  const lines = inputTextArea.split(/\r?\n/);
  // Find all "Engraving:" line indexes
  const engravingIndexes = [];
  lines.forEach((line, i) => {
    if (line.startsWith("Engraving:") && !line.includes("(Back plates)")) {
      engravingIndexes.push(i);
    }
  });

  const engravingSections = engravingIndexes.map((engravingIndex, sectionIndex) => {
    // Find item code
    const itemCode = (() => {
      for (let i = engravingIndex; i >= 0; i--) {
        if (lines[i].startsWith("Item Code:")) {
          return lines[i].match(/(?<=^Item Code:\s+)\S+$/m)[0];
        }
      }
    })();
    itemSizes.push(getItemSize(itemCode));
    if (!itemCode) {
      // TODO: Throw error
    }

    // Get engraving content
    const engravingContent = (() => {
      const nextEngravingIndex =
        sectionIndex + 1 < engravingIndexes.length
          ? engravingIndexes[sectionIndex + 1]
          : lines.length;

      return lines
        .slice(engravingIndex + 1, nextEngravingIndex)
        .join("\n")
        .replace(/(--------------------)(?![\s\S]*--------------------)[\s\S]*$/, "$1");
    })();

    return { itemCode, engravingContent };
  });

  let finalTextOutput = [];
  for (let i = 0; i < engravingSections.length; i++) {
    const cleanedText = getCleanText(engravingSections[i].engravingContent);
    finalTextOutput.push(cleanedText);
  }

  getOutputTextArea().value = finalTextOutput.join("\n\n");
}

function insertAdditionalColumns() {
  const inEmailMode = getEmailModeToggle().checked;
  const tray = getTrayInput().value;
  const orderNum = (() => {
    if (inEmailMode) {
      return getOrderNumInput().value;
    } else {
      return "AW" + getAwNumInput().value;
    }
  })();

  const outputTextArea = getOutputTextArea();
  const outputText = outputTextArea.value;

  const newOutputText = outputText
    .split("\n\n")
    .map((engravingSection, engravingSectionIndex) => {
      const size = (() => {
        if (inEmailMode) {
          return itemSizes[engravingSectionIndex];
        } else {
          return getSizeInput().value;
        }
      })();

      return engravingSection
        .split("\n")
        .map((line, lineIndex) => {
          const columns = line.split("\t");
          let columnIndex = columns.length;
          while (columnIndex <= 3) {
            columns.push("");
            columnIndex++;
          }
          columns.push(size);
          columns.push(`${tray} ${orderNum}`);
          columns.push(lineIndex + 1);
          return columns.join("\t");
        })
        .join("\n");
    })
    .join("\n\n");

  outputTextArea.value = newOutputText;
}

function getItemSize(itemCode) {
  const match = plateSizesArray.find(([code]) => code === itemCode);
  return match ? match[1] : "ERROR";
}

getOutputTextArea().addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    e.preventDefault();

    const start = this.selectionStart;
    const end = this.selectionEnd;

    // Insert tab character
    this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

    // Set cursor after the tab
    this.selectionStart = this.selectionEnd = start + 1;
  }
});

getEmailModeToggle().addEventListener("change", (e) => {
  inEmailMode = e.target.checked;
  handleModeChange(e.target.checked);
});

getTrayInput().addEventListener("input", function (e) {
  e.target.value = e.target.value.toUpperCase();
});


function handleModeChange(inEmailMode) {
  const sizeInputContainer = document.getElementById("sizeInputContainer");
  const awNumInputContainer = document.getElementById("awNumInputContainer");
  const orderNumInputContainer = document.getElementById("orderNumInputContainer");
  const cleanTextButton = document.getElementById("cleanTextButton");
  const cleanEmailEngravingButton = document.getElementById("cleanEmailEngravingButton");

  if (inEmailMode) {
    sizeInputContainer.classList.add("hidden");
    awNumInputContainer.classList.add("hidden");
    orderNumInputContainer.classList.remove("hidden");
    cleanTextButton.classList.add("hidden");
    cleanEmailEngravingButton.classList.remove("hidden");
  } else {
    sizeInputContainer.classList.remove("hidden");
    awNumInputContainer.classList.remove("hidden");
    orderNumInputContainer.classList.add("hidden");
    cleanTextButton.classList.remove("hidden");
    cleanEmailEngravingButton.classList.add("hidden");
  }

  getSizeInput().value = "";
  getTrayInput().value = "";
  getAwNumInput().value = "";
  getOrderNumInput().value = "";
  clearInputText();
  clearOutputText();
}

initPlateSizes();
handleModeChange(true);
