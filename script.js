"use strict";

// ======================================================
// KYVORIX TOOLS
// Main site script
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    // Smooth navigation for internal links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

});