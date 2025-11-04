// ==== EVOLVING TECH - SCRIPT.JS ====

// Select all the menu buttons
const menuButtons = document.querySelectorAll(".menu-item");
// Select all the content sections
const sections = document.querySelectorAll(".section");

// Function to switch between sections
menuButtons.forEach(button => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-section");

    // Remove active class from all sections
    sections.forEach(section => section.classList.remove("active"));

    // Add active class to the clicked section
    const activeSection = document.getElementById(target);
    if (activeSection) activeSection.classList.add("active");

    // Optional: Add visual feedback for selected button
    menuButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

// Optional: small startup animation
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
});
