"use strict";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = targetId && document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const search = document.getElementById("toolSearch");
  const cards = [...document.querySelectorAll(".tool-card[data-tool]")];
  if (search) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      cards.forEach((card) => {
        const haystack = `${card.dataset.tool || ""} ${card.textContent || ""}`.toLowerCase();
        card.classList.toggle("is-hidden", Boolean(query) && !haystack.includes(query));
      });
    });
  }

  const key = "kyvorix_recent_tools_v1";
  const recentSection = document.getElementById("recentTools");
  const recentGrid = document.getElementById("recentToolsGrid");
  const clearButton = document.getElementById("clearRecentTools");
  const safeRead = () => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
  const renderRecent = () => {
    if (!recentSection || !recentGrid) return;
    const recent = safeRead();
    if (!recent.length) { recentSection.hidden = true; return; }
    recentSection.hidden = false;
    recentGrid.innerHTML = recent.map((href) => {
      const source = cards.find((card) => card.getAttribute("href") === href);
      return source ? source.outerHTML : "";
    }).join("");
  };
  cards.forEach((card) => card.addEventListener("click", () => {
    const href = card.getAttribute("href");
    if (!href) return;
    const recent = safeRead().filter((item) => item !== href);
    recent.unshift(href);
    localStorage.setItem(key, JSON.stringify(recent.slice(0, 4)));
  }));
  if (clearButton) clearButton.addEventListener("click", () => { localStorage.removeItem(key); renderRecent(); });
  renderRecent();
});
