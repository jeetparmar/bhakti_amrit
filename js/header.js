(function injectSharedHeader() {
  const mountPoint = document.getElementById('siteHeaderMount');
  if (!mountPoint) return;

  mountPoint.innerHTML = `
    <header>
      <span class="om-symbol">🕉️</span>
      <h1
        id="siteTitle"
        data-title-hi="भक्ति अमृत"
        data-title-en="Bhakti Amrit"
      >
        भक्ति अमृत
      </h1>
      <p
        id="siteSubtitle"
        data-subtitle-hi="॥ दैनिक साधना का संपूर्ण साथी ॥"
        data-subtitle-en="Your complete daily sadhana companion - Aarti, Chalisa, Mantras, deity stories, and temple guidance in one place."
      >
        ॥ दैनिक साधना का संपूर्ण साथी॥
      </p>
      <div class="header-divider">
        <div class="divider-line"></div>
        <div class="divider-dot"></div>
        <div class="divider-dot" style="background: var(--gold)"></div>
        <div class="divider-dot"></div>
        <div class="divider-line"></div>
      </div>
    </header>
  `;
})();
