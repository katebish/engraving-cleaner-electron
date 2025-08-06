const getInputTextArea = () => document.getElementById("inputTextArea");
const getOutputTextArea = () => document.getElementById("outputTextArea");

function clearInputText() {
  const inputTextArea = getInputTextArea();
  inputTextArea.value = "";
}

function clearOutputText() {
  const outputTextArea = getOutputTextArea();
  outputTextArea.value = "";
}

function cleanText() {
  const inputTextArea = getInputTextArea().value;

  const cleaned = inputTextArea
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
    .join("\n");

  getOutputTextArea().value = cleaned;
}

function copyOutputTextarea() {
  const outputTextArea = getOutputTextArea();

  navigator.clipboard.writeText(outputTextArea.value).catch(() => alert("Failed to copy."));

  window.getSelection().removeAllRanges();
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
