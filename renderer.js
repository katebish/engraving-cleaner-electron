function cleanText() {
  const input = document.getElementById("input").value;

  const cleaned = input
    .replace(/^-{10}\r?\nBack Plate:.*\r?\n?/gm, "")
    .split(/^(?:-{20}|\.)\r?\n?/gm)
    .map((block) => block.trim().replace(/\r?\n/g, "\t"))
    .filter(Boolean)
    .join("\n");

  document.getElementById("output").value = cleaned;
}

document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
    return;
  }
});

document.getElementById("output").addEventListener("keydown", function (e) {
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
