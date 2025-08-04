document.addEventListener("DOMContentLoaded", () => {
  console.log("Welcome to the Er. Kaushal  site!");

  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      alert(`This would navigate to: ${link.textContent}`);
    });
  });
});