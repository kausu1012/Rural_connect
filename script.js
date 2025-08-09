const meals = {
  breakfast: ["Oatmeal with fruits", "Boiled eggs", "Green tea"],
  snacks: ["Protein bar", "Mixed nuts", "Yogurt"]
};

function loadMeals() {
  ["breakfast", "snacks"].forEach(type => {
    const list = document.getElementById(`${type}-list`);
    meals[type].forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = item;

      const btn = document.createElement("button");
      const key = `${type}-${index}`;
      const completed = localStorage.getItem(key) === "true";

      if (completed) {
        li.classList.add("completed");
        btn.textContent = "Incomplete";
        btn.classList.add("incomplete");
      } else {
        btn.textContent = "Complete";
        btn.classList.add("complete");
      }

      btn.addEventListener("click", () => {
        const isComplete = li.classList.toggle("completed");
        btn.textContent = isComplete ? "Incomplete" : "Complete";
        btn.className = isComplete ? "incomplete" : "complete";
        localStorage.setItem(key, isComplete);
      });

      li.appendChild(btn);
      list.appendChild(li);
    });
  });
}

document.addEventListener("DOMContentLoaded", loadMeals);
