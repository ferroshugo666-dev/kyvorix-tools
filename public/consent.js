/*
 * Kyvorix cookie/privacy consent banner.
 * Loaded on every page. Talks to Google Consent Mode v2 (the same
 * `gtag`/`dataLayer` already used for Analytics and AdSense on this site),
 * so a visitor's choice here controls both.
 *
 * Requires that the page has already set a "default: denied" consent
 * state (done inline, right before gtag('js', new Date())) so Analytics/
 * AdSense start out non-personalized until the visitor makes a choice.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "kyvorix_consent";

  function getStoredChoice() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function storeChoice(granted) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ granted: granted, ts: Date.now() })
      );
    } catch (e) {
      /* localStorage unavailable (private mode, etc.) - just skip persisting */
    }
  }

  function updateConsent(granted) {
    if (typeof window.gtag !== "function") return;
    var state = granted ? "granted" : "denied";
    window.gtag("consent", "update", {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }

  function injectStyle() {
    if (document.getElementById("kyv-consent-style")) return;
    var style = document.createElement("style");
    style.id = "kyv-consent-style";
    style.textContent =
      ".kyv-consent-banner{position:fixed;left:0;right:0;bottom:0;z-index:99999;" +
      "background:#111111;color:#f2f2f0;padding:20px 24px;box-shadow:0 -4px 24px rgba(0,0,0,.25);" +
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;" +
      "display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between;}" +
      ".kyv-consent-text{flex:1 1 420px;font-size:14px;line-height:1.6;color:#d9d9d6;margin:0;}" +
      ".kyv-consent-text strong{color:#fff;}" +
      ".kyv-consent-text a{color:#fff;text-decoration:underline;}" +
      ".kyv-consent-actions{display:flex;gap:10px;flex:0 0 auto;}" +
      ".kyv-consent-btn{cursor:pointer;border-radius:999px;padding:10px 20px;font-size:14px;" +
      "font-weight:600;border:1px solid transparent;font-family:inherit;}" +
      ".kyv-consent-accept{background:#f2f2f0;color:#111111;}" +
      ".kyv-consent-decline{background:transparent;color:#f2f2f0;border-color:#4a4a48;}" +
      ".kyv-consent-reopen{position:fixed;left:16px;bottom:16px;z-index:99998;" +
      "background:#111111;color:#f2f2f0;border:1px solid #4a4a48;border-radius:999px;" +
      "width:40px;height:40px;display:flex;align-items:center;justify-content:center;" +
      "font-size:18px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.2);}" +
      "@media (max-width:520px){.kyv-consent-actions{width:100%;}.kyv-consent-btn{flex:1;text-align:center;}}";
    document.head.appendChild(style);
  }

  function privacyPolicyHref() {
    // Works whether the page lives at the site root or under /tools/.
    return location.pathname.indexOf("/tools/") !== -1
      ? "../privacy-policy.html"
      : "privacy-policy.html";
  }

  function buildBanner() {
    var banner = document.createElement("div");
    banner.className = "kyv-consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie and privacy choices");

    var text = document.createElement("p");
    text.className = "kyv-consent-text";
    text.innerHTML =
      "<strong>We respect your privacy.</strong> Kyvorix processes your files locally in your browser \u2014 " +
      "they are never uploaded to our servers. This site uses Google Analytics and Google AdSense, which " +
      "may use cookies to measure traffic and show ads, including personalized ads where you allow it. " +
      'You can change this choice at any time. See our <a href="' +
      privacyPolicyHref() +
      '">Privacy Policy</a> for details.';

    var actions = document.createElement("div");
    actions.className = "kyv-consent-actions";

    var declineBtn = document.createElement("button");
    declineBtn.type = "button";
    declineBtn.className = "kyv-consent-btn kyv-consent-decline";
    declineBtn.textContent = "Decline";

    var acceptBtn = document.createElement("button");
    acceptBtn.type = "button";
    acceptBtn.className = "kyv-consent-btn kyv-consent-accept";
    acceptBtn.textContent = "Accept";

    declineBtn.addEventListener("click", function () {
      storeChoice(false);
      updateConsent(false);
      banner.remove();
      showReopenTab();
    });

    acceptBtn.addEventListener("click", function () {
      storeChoice(true);
      updateConsent(true);
      banner.remove();
      showReopenTab();
    });

    actions.appendChild(declineBtn);
    actions.appendChild(acceptBtn);
    banner.appendChild(text);
    banner.appendChild(actions);
    return banner;
  }

  function showBanner() {
    injectStyle();
    var existingTab = document.querySelector(".kyv-consent-reopen");
    if (existingTab) existingTab.remove();
    document.body.appendChild(buildBanner());
  }

  function showReopenTab() {
    if (document.querySelector(".kyv-consent-reopen")) return;
    injectStyle();
    var tab = document.createElement("button");
    tab.type = "button";
    tab.className = "kyv-consent-reopen";
    tab.setAttribute("aria-label", "Cookie preferences");
    tab.title = "Cookie preferences";
    tab.textContent = "\uD83C\uDF6A"; // cookie emoji
    tab.addEventListener("click", function () {
      tab.remove();
      showBanner();
    });
    document.body.appendChild(tab);
  }

  function init() {
    var choice = getStoredChoice();
    if (choice) {
      updateConsent(choice.granted);
      showReopenTab();
    } else {
      showBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
