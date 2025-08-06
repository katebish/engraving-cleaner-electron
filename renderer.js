function cleanText() {
  const input = document.getElementById("input").value;

  const cleaned = 
  input
    // Trim each line
    .split(/\r?\n/)
    .map(line => line.trim())
    .join('\n')
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

  document.getElementById("outputTextArea").value = cleaned;
}

function copyOutputTextarea() {
  const textarea = document.getElementById("outputTextArea");

  navigator.clipboard.writeText(textarea.value)
        .catch(() => alert('Failed to copy.'));

  window.getSelection().removeAllRanges();
}

document.getElementById("outputTextArea").addEventListener("keydown", function (e) {
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
