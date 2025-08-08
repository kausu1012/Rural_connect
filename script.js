window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("expenses")) || [];
  saved.forEach(addToLog);
};

function scrollToCalculator() {
  document.getElementById("calculator").scrollIntoView({ behavior: "smooth" });
}

function calculateExpenses() {
  const a1 = parseFloat(document.getElementById("amount1").value) || 0;
  const a2 = parseFloat(document.getElementById("amount2").value) || 0;
  const total = a1 + a2;
  document.getElementById("result").innerText = `Total: ₹${total}`;

  const entry = `₹${a1} + ₹${a2} = ₹${total}`;
  addToLog(entry);

  const log = JSON.parse(localStorage.getItem("expenses")) || [];
  log.push(entry);
  localStorage.setItem("expenses", JSON.stringify(log));
}

function addToLog(entry) {
  const li = document.createElement("li");
  li.textContent = entry;
  document.getElementById("entryList").appendChild(li);
}
