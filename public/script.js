"use strict";

document.addEventListener("DOMContentLoaded", () => {
  let installPrompt;
  const installButton = document.getElementById("installAppButton");
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });
  installButton?.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
  window.addEventListener("appinstalled", () => {
    if (installButton) installButton.hidden = true;
  });
  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }

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
  const filterTabs = [...document.querySelectorAll(".filter-tab")];
  const resultCount = document.getElementById("toolResultCount");
  const noResults = document.getElementById("toolNoResults");
  const clearSearch = document.getElementById("clearToolSearch");
  let activeFilter = "all";
  const categoryFor = (card) => {
    const tool = card.dataset.tool || "";
    if (tool.includes("compress")) return "compress";
    if (tool.includes("pdf")) return "pdf";
    if (tool.includes("resizer") || tool.includes("cropper")) return "edit";
    return "convert";
  };
  const updateToolView = () => {
    const query = search?.value.trim().toLowerCase() || "";
    let visibleCount = 0;
    cards.forEach((card) => {
      const haystack = `${card.dataset.tool || ""} ${card.textContent || ""}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesFilter = activeFilter === "all" || categoryFor(card) === activeFilter;
      const hidden = !matchesSearch || !matchesFilter;
      card.classList.toggle("is-hidden", hidden);
      card.classList.toggle("is-filtered", hidden);
      if (!hidden) visibleCount += 1;
    });
    if (resultCount) resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "tool" : "tools"}`;
    if (noResults) noResults.hidden = visibleCount > 0;
  };
  if (search) search.addEventListener("input", updateToolView);
  filterTabs.forEach((tab) => tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter || "all";
    filterTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    updateToolView();
  }));
  clearSearch?.addEventListener("click", () => {
    if (search) search.value = "";
    activeFilter = "all";
    filterTabs.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "all"));
    updateToolView();
    search?.focus();
  });
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName;
    if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
      event.preventDefault();
      search?.focus();
    }
    if (event.key === "Escape" && search?.value) {
      search.value = "";
      updateToolView();
      search.blur();
    }
  });
  updateToolView();

  const key = "kyvorix_recent_tools_v2";
  const recentSection = document.getElementById("recentTools");
  const recentGrid = document.getElementById("recentToolsGrid");
  const clearButton = document.getElementById("clearRecentTools");
  const safeRead = () => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
  const renderRecent = () => {
    if (!recentSection || !recentGrid) return;
    const recent = safeRead();
    if (!recent.length) { recentSection.hidden = true; return; }
    recentSection.hidden = false;
    recentGrid.innerHTML = recent.map((item) => {
      const href = typeof item === "string" ? item : item.href;
      const source = cards.find((card) => card.getAttribute("href") === href);
      return source ? source.outerHTML : "";
    }).join("");
  };
  cards.forEach((card) => card.addEventListener("click", () => {
    const href = card.getAttribute("href");
    if (!href) return;
    const recent = safeRead().filter((item) => (typeof item === "string" ? item : item.href) !== href);
    recent.unshift({ href, name: card.querySelector("h3")?.textContent?.trim() || card.dataset.tool });
    localStorage.setItem(key, JSON.stringify(recent.slice(0, 4)));
  }));
  if (clearButton) clearButton.addEventListener("click", () => { localStorage.removeItem(key); renderRecent(); });
  renderRecent();
});
