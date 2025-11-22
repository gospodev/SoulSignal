// SoulSignal – sample signals + filtering logic

let signals = [];

  
  function ethicsBadgeClass(rating, category) {
    // Optional Mystica visual accent:
    if (category === "mystica") {
      return "badge-ethics-a badge-mystica";
    }
  
    switch (rating) {
      case "A":
        return "badge-ethics-a";
      case "B":
        return "badge-ethics-b";
      default:
        return "badge-ethics-c";
    }
  }
  
  function humanCategoryLabel(category) {
    switch (category) {
      case "news":
        return "News";
      case "climate":
        return "Climate";
      case "ethics":
        return "Ethical Investing";
      case "culture":
        return "Culture";
      case "tech":
        return "Technology";
      case "mystica":
        return "Mystica";
      default:
        return "Mixed";
    }
  }
  
  async function loadSignalsFromLumar() {
    const activeCategoryBtn = document.querySelector(".chip-active");
    const category = activeCategoryBtn?.dataset.category ?? "all";
    const highEthicsOnly =
      document.getElementById("high-ethics-toggle").checked;
  
    const body = {
      userId: "manee",
      stream: category === "mystica" ? "mystica" : "rational",
      category,
      ethicsMode: highEthicsOnly ? "high-only" : "open",
      locale: "en",
      maxSignals: 7,
      context: {
        mood: "curious",
        focus: "soul_signal_mvp",
      },
    };
  
    try {
      const response = await fetch(
        "http://localhost:3000/api/soulsignal/signals",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
  
      if (!response.ok) {
        throw new Error("Lumar Ego API returned an error");
      }
  
      const data = await response.json();
      signals = data.signals || [];
      renderSignals();
    } catch (err) {
      console.error("Failed to load signals from Lumar:", err);
      const container = document.getElementById("signals-container");
      const summaryEl = document.getElementById("signals-summary");
      summaryEl.textContent =
        "Lumar is offline right now. Please try again in a moment.";
      container.innerHTML =
        "<p class='ss-summary'>Could not contact Lumar Ego API.</p>";
    }
  }
  

  function renderSignals() {
    const container = document.getElementById("signals-container");
    const summaryEl = document.getElementById("signals-summary");
    const activeCategoryBtn = document.querySelector(".chip-active");
    const category = activeCategoryBtn?.dataset.category ?? "all";
    const highEthicsOnly =
      document.getElementById("high-ethics-toggle").checked;
  
    let visibleCount = 0;
    let totalBlocked = 0;
  
    container.innerHTML = "";
  
    signals.forEach((signal) => {
      if (signal.blocked) {
        totalBlocked++;
        return;
      }
  
      if (category !== "all" && signal.category !== category) {
        return;
      }
  
      if (
        highEthicsOnly &&
        !(signal.ethicsRating === "A" || signal.ethicsRating === "B")
      ) {
        return;
      }
  
      visibleCount++;
  
      const card = document.createElement("article");
      card.className = "ss-card";
  
      card.innerHTML = `
        <div class="ss-card-header">
          <h3 class="ss-card-title">${signal.title}</h3>
          <span class="ss-badge ${ethicsBadgeClass(
            signal.ethicsRating,
            signal.category
          )}">Ethics ${signal.ethicsRating}</span>
        </div>
        <div class="ss-meta">
          <span>📚 ${signal.source}</span>
          <span>📍 ${signal.region}</span>
          <span>🌀 ${humanCategoryLabel(signal.category)}</span>
        </div>
        <p class="ss-summary">${signal.summary}</p>
        <div class="ss-tags">
          ${signal.tags
            .map((t) => `<span class="ss-tag">#${t}</span>`)
            .join("")}
        </div>
        <p class="ss-comment">Lumar: ${signal.lumarComment}</p>
      `;
  
      container.appendChild(card);
    });
  
    const categoryText =
      category === "all" ? "all streams" : `the "${humanCategoryLabel(category)}" stream`;
  
    summaryEl.textContent = `Showing ${visibleCount} signals from ${categoryText}. Filtered out ${totalBlocked} low-ethics or blocked signals.`;
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const categoryContainer = document.getElementById("category-filters");
    const highEthicsToggle = document.getElementById("high-ethics-toggle");
  
    categoryContainer.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-category]");
      if (!btn) return;
  
      document
        .querySelectorAll("#category-filters .chip")
        .forEach((el) => el.classList.remove("chip-active"));
      btn.classList.add("chip-active");
  
      loadSignalsFromLumar();
    });
  
    highEthicsToggle.addEventListener("change", loadSignalsFromLumar);
  
    // първоначално зареждане от Лумар
    loadSignalsFromLumar();
  });
  
  