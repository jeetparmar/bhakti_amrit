// ============ PARTICLES ============
function createParticles() {
  const container = document.getElementById('particles');
  const symbols = ['🪔', '✨', '🌸', '⭐', '🕉️'];
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.cssText = `
    left: ${Math.random() * 100}%;
    font-size: ${20 + Math.random() * 20}px;
    animation-duration: ${15 + Math.random() * 25}s;
    animation-delay: ${Math.random() * 20}s;
  `;
    container.appendChild(p);
  }
}

// ============ BUILD HOME GRID ============
const deityTypeMap = {
  ganesh: 'देव',
  shiva: 'देव',
  durga: 'देवी',
  lakshmi: 'देवी',
  saraswati: 'देवी',
  vishnu: 'देव',
  ram: 'अवतार',
  krishna: 'अवतार',
  hanuman: 'देव',
  surya: 'ग्रह देव',
  kali: 'देवी',
  khatu_shyam: 'लोक देव',
  shani: 'ग्रह देव',
  gopal: 'अवतार',
  brahma: 'देव',
  bhairav: 'देव',
  batuk_bhairav: 'देव',
  navgrah: 'ग्रह देव',
  vishwakarma: 'देव',
  ravidas: 'लोक देव',
  gorakh_nath: 'लोक देव',
  jaharveer: 'लोक देव',
  pretraj_sarkar: 'लोक देव',
  balaji: 'लोक देव',
  sai: 'लोक देव',
  giriraj: 'लोक देव',
  mahavir: 'लोक देव',
  parshuram: 'अवतार',
  ramdev: 'लोक देव',
  pitar: 'लोक देव',
  baba_gangaram: 'लोक देव',
  vindhyeshwari: 'देवी',
  mahalakshmi: 'देवी',
  gayatri: 'देवी',
  mahakali: 'देवी',
  sheetla: 'देवी',
  radha: 'देवी',
  tulsi: 'देवी',
  vaishno_devi: 'देवी',
  santoshi_maa: 'देवी',
  annapurna: 'देवी',
  parvati: 'देवी',
  baglamukhi: 'देवी',
  ganga: 'देवी',
  narmada: 'देवी',
  sharda: 'देवी',
  shakambhari: 'देवी',
  lalita_shakambhari: 'देवी',
  rani_sati: 'देवी',
};

function getDeityType(key) {
  return deityTypeMap[key] || 'देव';
}

function getValidDeityImage(path) {
  if (!path) return '';
  const normalized = String(path)
    .trim()
    .replace(/^\.?\//, '');
  if (!normalized.startsWith('icons/')) return '';
  if (!normalized.toLowerCase().endsWith('.webp')) return '';
  return normalized;
}

let activeHomeType = 'all';
let activeHomeNavId = 'home';
let activeHomeSearchQuery = '';
let activeDeityKey = '';
let activeDeityTab = 'about';
const validDeityTabs = ['about', 'aarti', 'chalisa', 'mantra', 'temples'];

const homeTypeToNavId = {
  all: 'home',
  देव: 'type-dev',
  देवी: 'type-devi',
  अवतार: 'type-avatar',
  'ग्रह देव': 'type-grah-dev',
  'लोक देव': 'type-lok-dev',
};

function getNavIdByHomeType(typeId = 'all') {
  return homeTypeToNavId[typeId] || 'home';
}

function getSafeHomeType(typeId = 'all') {
  return Object.prototype.hasOwnProperty.call(homeTypeToNavId, typeId)
    ? typeId
    : 'all';
}

function getSafeDeityTab(tabId = 'about') {
  return validDeityTabs.includes(tabId) ? tabId : 'about';
}

function updateUrlState({
  typeId = activeHomeType,
  deityKey = '',
  tabId = activeDeityTab,
  replace = false,
} = {}) {
  const url = new URL(window.location.href);
  url.search = '';
  const safeType = getSafeHomeType(typeId);
  const safeDeity = deityKey && deities[deityKey] ? deityKey : '';
  const safeTab = getSafeDeityTab(tabId);

  if (safeType !== 'all') url.searchParams.set('type', safeType);
  if (safeDeity) {
    url.searchParams.set('deity', safeDeity);
    url.searchParams.set('tab', safeTab);
  }

  const method = replace ? 'replaceState' : 'pushState';
  history[method](
    {
      typeId: safeType,
      deityKey: safeDeity || null,
      tabId: safeDeity ? safeTab : null,
    },
    '',
    `${url.pathname}${url.search}`,
  );
}

function applyUrlState() {
  const params = new URLSearchParams(window.location.search);
  const rawType = params.get('type') || 'all';
  const typeId = getSafeHomeType(rawType);
  const navId = getNavIdByHomeType(typeId);
  const deityKey = params.get('deity') || '';
  const tabId = getSafeDeityTab(params.get('tab') || 'about');

  if (deityKey && deities[deityKey]) {
    activeHomeType = typeId;
    activeHomeNavId = navId;
    showDeityPage(deityKey, { skipUrl: true, initialTab: tabId });
    return;
  }

  showHomeByType(typeId, navId, { skipUrl: true });
}

function buildHomeGrid() {
  renderHomeGrid(activeHomeType, activeHomeSearchQuery);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHomeGrid(
  filter = activeHomeType,
  searchQuery = activeHomeSearchQuery,
) {
  const grid = document.getElementById('homeGrid');
  if (!grid) return;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = Object.entries(deities).filter(
    ([key, deity]) =>
      (filter === 'all' ? true : getDeityType(key) === filter) &&
      (!normalizedQuery ||
        `${key} ${deity.name} ${deity.desc} ${getDeityType(key)}`
          .toLowerCase()
          .includes(normalizedQuery)),
  );

  if (!filtered.length) {
    const queryText = normalizedQuery
      ? ` "${escapeHtml(searchQuery.trim())}"`
      : '';
    grid.innerHTML = `
      <div class="home-empty-state">
        <div class="home-empty-icon">🔍</div>
        <div class="home-empty-title">कोई परिणाम नहीं मिला${queryText}</div>
        <div class="home-empty-subtitle">दूसरा नाम लिखें या ऊपर की श्रेणी बदलकर देखें</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map(([key, deity], index) => {
      const deityType = getDeityType(key);
      const imgSrc = getValidDeityImage(deity.img);
      const isPriorityImage = index < 6;
      const imgHtml = imgSrc
        ? `<img class="deity-img" src="${imgSrc}" alt="${deity.name}" loading="${isPriorityImage ? 'eager' : 'lazy'}" fetchpriority="${isPriorityImage ? 'high' : 'low'}" width="240" height="240" decoding="async" onerror="this.parentNode.querySelector('.deity-img-fallback').style.display='flex'; this.style.display='none';">
     <div class="deity-img-fallback" style="display:none">${deity.emoji}</div>`
        : `<div class="deity-img-fallback">${deity.emoji}</div>`;
      return `
    <div class="deity-card" onclick="showDeityPage('${key}')">
    ${imgHtml}
    <div class="deity-info">
      <span class="deity-name">${deity.name}</span>
      <span class="deity-meta">${deity.desc}</span>
      <span class="deity-type-badge">${deityType}</span>
      <div class="deity-tags">
        <span class="tag tag-aarti" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'aarti' })">आरती</span>
        <span class="tag tag-chalisa" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'chalisa' })">चालीसा</span>
        <span class="tag tag-mantra" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'mantra' })">मंत्र</span>
      </div>
    </div>
    </div>`;
    })
    .join('');
}

function showHomeByType(typeId = 'all', navId = 'home', options = {}) {
  const safeType = getSafeHomeType(typeId);
  const safeNavId = navId || getNavIdByHomeType(safeType);
  activeHomeType = safeType;
  activeHomeNavId = safeNavId;
  activeDeityKey = '';
  activeDeityTab = 'about';
  showPage('home', safeNavId);
  const grid = document.getElementById('homeGrid');
  if (!grid) return;
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(12px)';
  setTimeout(() => {
    renderHomeGrid(safeType, activeHomeSearchQuery);
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }, 180);

  if (!options.skipUrl) {
    updateUrlState({ typeId: safeType, deityKey: '' });
  }
}

function setupHomeSearch() {
  const searchInput = document.getElementById('homeSearchInput');
  const clearBtn = document.getElementById('homeSearchClear');
  if (!searchInput) return;

  const syncClearButton = () => {
    if (!clearBtn) return;
    clearBtn.classList.toggle('visible', searchInput.value.trim().length > 0);
  };

  searchInput.value = activeHomeSearchQuery;
  syncClearButton();

  searchInput.addEventListener('input', (event) => {
    activeHomeSearchQuery = event.target.value;
    renderHomeGrid(activeHomeType, activeHomeSearchQuery);
    syncClearButton();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      activeHomeSearchQuery = '';
      searchInput.value = '';
      renderHomeGrid(activeHomeType, activeHomeSearchQuery);
      syncClearButton();
      searchInput.focus();
    });
  }
}

// ============ NAVIGATION ============
function scrollNav(direction) {
  const container = document.querySelector('.nav-inner-wrapper');
  const scrollAmount = 200;
  container.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth',
  });
}

function updateArrowVisibility() {
  const container = document.querySelector('.nav-inner-wrapper');
  const leftArrow = document.querySelector('.nav-arrow.left');
  const rightArrow = document.querySelector('.nav-arrow.right');

  if (!container || !leftArrow || !rightArrow) return;

  const canScroll = container.scrollWidth > container.clientWidth + 5;

  container.classList.toggle('is-scrollable', canScroll);
  leftArrow.style.display = container.scrollLeft > 5 ? 'flex' : 'none';
  rightArrow.style.display =
    canScroll &&
    container.scrollLeft + container.clientWidth < container.scrollWidth - 5
      ? 'flex'
      : 'none';
}

function updateSiteTitleByLang() {
  const titleEl = document.getElementById('siteTitle');
  const lang = (
    document.documentElement.getAttribute('lang') || ''
  ).toLowerCase();
  const isEnglish = lang.startsWith('en');

  if (titleEl) {
    titleEl.textContent = isEnglish
      ? titleEl.dataset.titleEn || 'Bhakti Amrit'
      : titleEl.dataset.titleHi || 'भक्ति अमृत';
  }

  const subtitleEl = document.getElementById('siteSubtitle');
  if (subtitleEl) {
    subtitleEl.textContent = isEnglish
      ? subtitleEl.dataset.subtitleEn || ''
      : subtitleEl.dataset.subtitleHi || '';
  }
}

function showPage(pageId, navId) {
  document
    .querySelectorAll('.page')
    .forEach((p) => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');
  syncNav(navId || pageId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pageId === 'temples') buildTemplesPage();
}

function syncNav(pageId) {
  document.querySelectorAll('.nav-btn').forEach((b) => {
    const isActive = b.dataset.page === pageId;
    b.classList.toggle('active', isActive);
    if (isActive) {
      b.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  });
  updateArrowVisibility();
}

function showDeityPage(key, options = {}) {
  const deity = deities[key];
  if (!deity) return;
  activeDeityKey = key;
  activeDeityTab = getSafeDeityTab(options.initialTab || 'about');

  // Build header
  const imgSrc = getValidDeityImage(deity.img);
  const imgHtml = imgSrc
    ? `<img class="deity-portrait" src="${imgSrc}" alt="${deity.name}" loading="eager" fetchpriority="high" width="100" height="100" decoding="async" onerror="this.nextElementSibling.style.display='flex'; this.style.display='none';">
   <div class="deity-portrait-emoji" style="display:none">${deity.emoji}</div>`
    : `<div class="deity-portrait-emoji">${deity.emoji}</div>`;

  document.getElementById('deityHeader').innerHTML = `
  ${imgHtml}
  <div class="content-header-text">
    <h2>${deity.name}</h2>
    <p>${deity.desc}</p>
  </div>`;

  // Build tabs
  const tabs = document.getElementById('deityTabs');
  tabs.innerHTML = `
  <button class="tab-btn ${activeDeityTab === 'about' ? 'active' : ''}" onclick="showTab('about', this)">🚩 परिचय</button>
  <button class="tab-btn ${activeDeityTab === 'aarti' ? 'active' : ''}" onclick="showTab('aarti', this)">🪔 आरती</button>
  <button class="tab-btn ${activeDeityTab === 'chalisa' ? 'active' : ''}" onclick="showTab('chalisa', this)">📖 चालीसा</button>
  <button class="tab-btn ${activeDeityTab === 'mantra' ? 'active' : ''}" onclick="showTab('mantra', this)">🕉️ मंत्र</button>
  <button class="tab-btn ${activeDeityTab === 'temples' ? 'active' : ''}" onclick="showTab('temples', this)">🛕 मंदिर</button>`;

  // Render contents
  const content = document.getElementById('deityContent');
  if (!content) return;

  content.innerHTML = `
  <div id="tab-about" class="text-content ${activeDeityTab === 'about' ? 'active' : ''}">
    <div class="deity-tab-wrap deity-tab-wrap-no-padding">
      <div class="lyrics-box about-content">${renderAbout(aboutData[key])}</div>
    </div>
  </div>
  <div id="tab-aarti" class="text-content ${activeDeityTab === 'aarti' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="lyrics-box">${renderLyrics(deity.aarti)}</div>
    </div>
  </div>
  <div id="tab-chalisa" class="text-content ${activeDeityTab === 'chalisa' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="lyrics-box">${renderLyrics(deity.chalisa)}</div>
    </div>
  </div>
  <div id="tab-mantra" class="text-content ${activeDeityTab === 'mantra' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="mantra-grid">${renderMantras(deity.mantras, key)}</div>
    </div>
  </div>
  <div id="tab-temples" class="text-content ${activeDeityTab === 'temples' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      ${renderDeityTemples(key)}
    </div>
  </div>`;

  showPage('deity', activeHomeNavId);

  if (!options.skipUrl) {
    updateUrlState({
      typeId: activeHomeType,
      deityKey: key,
      tabId: activeDeityTab,
    });
  }
}

function renderAbout(data) {
  if (typeof data === 'string') return data;
  if (!Array.isArray(data)) return 'विवरण जल्द ही आ रहा है...';

  return data
    .map((section) => {
      let contentHtml = '';
      if (section.content) {
        contentHtml = `<p>${section.content}</p>`;
      } else if (section.items) {
        contentHtml = `<ul>${section.items
          .map(
            (item) => `
        <li><strong>${item.label}:</strong> ${item.text}</li>
      `,
          )
          .join('')}</ul>`;
      }
      return `
      <div class="info-section">
        <h3>${section.title}</h3>
        ${contentHtml}
      </div>`;
    })
    .join('');
}

function renderLyrics(data) {
  if (typeof data === 'string') return data;
  if (!data || !data.lines) return 'जल्द ही आ रहा है...';

  const titleHtml = data.title
    ? `<div class="title-line">${data.title}</div>`
    : '';
  const linesHtml = data.lines
    .map((line) => {
      if (line.type === 'refrain') {
        return `<div class="refrain">${line.text}</div>`;
      } else if (line.type === 'stanza') {
        const refrainHtml = line.refrain
          ? `<div class="refrain">${line.refrain}</div>`
          : '';
        return `<div class="stanza">${line.text}${refrainHtml}</div>`;
      }
      return line.text;
    })
    .join('');

  return `${titleHtml}${linesHtml}`;
}

function renderMantras(mantras, key) {
  return (mantras || [])
    .map(
      (m, i) => `
  <div class="mantra-card">
    <button class="copy-btn" onclick="copyMantra(this, ${i}, '${key}')">📋 कॉपी</button>
    <div class="mantra-type">${m.type}</div>
    <div class="mantra-text">${m.text}</div>
    <div class="mantra-meaning">${m.meaning}</div>
    <div class="mantra-count">🔢 जाप संख्या: ${m.count}</div>
  </div>`,
    )
    .join('');
}

function showTab(tabId, btn) {
  const safeTab = getSafeDeityTab(tabId);
  const content = document.getElementById('deityContent');
  if (!content) return;
  content
    .querySelectorAll('.text-content')
    .forEach((t) => t.classList.remove('active'));
  document
    .querySelectorAll('.tabs .tab-btn')
    .forEach((b) => b.classList.remove('active'));
  const target = document.getElementById('tab-' + safeTab);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');
  activeDeityTab = safeTab;
  if (activeDeityKey) {
    updateUrlState({
      typeId: activeHomeType,
      deityKey: activeDeityKey,
      tabId: safeTab,
    });
  }
}

function copyMantra(btn, idx, key) {
  const mantra = deities[key].mantras[idx];
  navigator.clipboard
    .writeText(mantra.text)
    .then(() => {
      btn.textContent = '✅ कॉपी हुआ';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '📋 कॉपी';
        btn.classList.remove('copied');
      }, 2000);
    })
    .catch(() => {
      btn.textContent = '✅ कॉपी हुआ';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '📋 कॉपी';
        btn.classList.remove('copied');
      }, 2000);
    });
}

// ============ DEITY TEMPLES TAB ============
// Maps deity page keys → deity field values in templesData
const deityTempleMap = {
  ganesh: ['गणेश'],
  shiva: ['शिव'],
  durga: ['दुर्गा'],
  lakshmi: ['लक्ष्मी'],
  saraswati: ['सरस्वती'],
  vishnu: ['विष्णु'],
  ram: ['राम', 'Ram'],
  krishna: ['कृष्ण', 'Krishna'],
  hanuman: ['हनुमान'],
  surya: ['सूर्य'],
  kali: ['काली'],
  khatu_shyam: ['खाटू श्याम'],
  shani: ['शनि'],
  gopal: ['कृष्ण', 'Krishna'],
  brahma: ['ब्रह्मा'],
  bhairav: ['भैरव'],
  batuk_bhairav: ['भैरव'],
  navgrah: ['सूर्य', 'शनि'],
  vishwakarma: ['विश्वकर्मा'],
  ravidas: ['रविदास'],
  gorakh_nath: ['गोरख'],
  jaharveer: ['जाहरवीर'],
  pretraj_sarkar: ['प्रेतराज'],
  balaji: ['हनुमान', 'विष्णु'],
  sai: ['साईं'],
  giriraj: ['कृष्ण', 'Krishna'],
  mahavir: ['महावीर'],
  parshuram: ['विष्णु'],
  ramdev: ['रामदेव'],
  pitar: ['पितर'],
  baba_gangaram: ['गंगाराम'],
  vindhyeshwari: ['दुर्गा', 'विंध्यवासिनी'],
  mahalakshmi: ['लक्ष्मी'],
  gayatri: ['सूर्य', 'गायत्री'],
  mahakali: ['काली'],
  sheetla: ['शीतला'],
  radha: ['कृष्ण', 'Krishna'],
  tulsi: ['विष्णु', 'कृष्ण', 'Krishna'],
  vaishno_devi: ['वैष्णो देवी', 'दुर्गा'],
  santoshi_maa: ['संतोषी'],
  annapurna: ['अन्नपूर्णा', 'शिव'],
  parvati: ['शिव'],
  baglamukhi: ['बगलामुखी'],
  ganga: ['गंगा'],
  narmada: ['नर्मदा'],
  sharda: ['सरस्वती', 'शारदा'],
  shakambhari: ['शाकम्भरी'],
  lalita_shakambhari: ['शाकम्भरी', 'ललिता'],
  rani_sati: ['राणी सती'],
};

function renderDeityTemples(deityKey) {
  const deityNames = deityTempleMap[deityKey] || [];
  const related = templesData.filter((t) =>
    deityNames.some((name) => t.deity.includes(name)),
  );

  if (related.length === 0) {
    return `
      <div class="deity-temples-empty">
        <div class="deity-temples-empty-icon">🛕</div>
        <p>इस देवता के विशेष मंदिर अभी सूची में नहीं हैं।</p>
        <button class="deity-temples-all-btn" onclick="showPage('temples')">
          सभी प्रसिद्ध मंदिर देखें →
        </button>
      </div>`;
  }

  const cards = related
    .map(
      (temple, idx) => `
    <div class="temple-card deity-temple-card" onclick="openTempleModal('${temple.id}')"
         style="animation-delay:${idx * 0.08}s; background:${temple.gradient}; --temple-color:${temple.color};">
      <div class="temple-card-top">
        <div class="temple-emoji-badge">${temple.emoji}</div>
        <div class="temple-type-badge">${temple.type}</div>
      </div>
      <div class="temple-card-body">
        <h3 class="temple-name">${temple.name}</h3>
        <p class="temple-name-en">${temple.nameEn}</p>
        <div class="temple-location-row">
          <span class="temple-location-pin">📍</span>
          <span class="temple-state">${temple.location}</span>
        </div>
        <p class="temple-desc">${temple.desc}</p>
      </div>
      <div class="temple-card-footer">
        <span class="temple-map-cta">ℹ️ विवरण देखें</span>
        <span class="temple-arrow">→</span>
      </div>
    </div>
  `,
    )
    .join('');

  return `
    <div class="deity-temples-intro">
      <span class="deity-temples-count">${related.length} मंदिर</span> इस देवता से संबंधित प्रसिद्ध तीर्थ स्थल
    </div>
    <div class="temples-grid deity-temples-grid">${cards}</div>
    <button class="deity-temples-all-btn" onclick="showPage('temples')">
      🛕 सभी प्रसिद्ध मंदिर देखें
    </button>`;
}

// ============ TEMPLES DATA ============

const templesData = [
  {
    id: 'kedarnath',
    name: 'केदारनाथ मंदिर',
    nameEn: 'Kedarnath Temple',
    state: 'उत्तराखंड',
    deity: 'शिव',
    type: 'Jyotirlinga',
    emoji: '🏔️',
    desc: 'हिमालय की गोद में स्थित 12 ज्योतिर्लिंगों में एक, 3,583 मीटर की ऊँचाई पर।',
    history:
      'यह मंदिर 8वीं शताब्दी में आदि शंकराचार्य द्वारा पुनर्निर्मित किया गया था। मूल मंदिर पांडवों द्वारा बनाया गया था।',
    timings: 'अप्रैल-नवंबर: 6AM – 3PM, 5PM – 9PM',
    bestTime: 'मई–जून, सितंबर–अक्टूबर',
    location: 'रुद्रप्रयाग, उत्तराखंड',
    mapQuery: 'Kedarnath+Temple+Uttarakhand',
    color: '#4FC3F7',
    gradient:
      'linear-gradient(135deg, rgba(79,195,247,0.15), rgba(30,136,229,0.08))',
  },
  {
    id: 'somnath',
    name: 'सोमनाथ मंदिर',
    nameEn: 'Somnath Temple',
    state: 'गुजरात',
    deity: 'शिव',
    type: 'Jyotirlinga',
    emoji: '🌊',
    desc: '12 ज्योतिर्लिंगों में प्रथम, अरब सागर के तट पर स्थित शिवजी का पवित्र धाम।',
    history:
      'सोमनाथ मंदिर को कई बार आक्रमणकारियों ने नष्ट किया और हर बार इसे पुनर्निर्मित किया गया।',
    timings: '6AM – 10PM (आरती: 7AM, 12PM, 7PM)',
    bestTime: 'अक्टूबर–मार्च',
    location: 'प्रभास पाटन, सोमनाथ, गुजरात',
    mapQuery: 'Somnath+Temple+Gujarat',
    color: '#81C784',
    gradient:
      'linear-gradient(135deg, rgba(129,199,132,0.15), rgba(56,142,60,0.08))',
  },
  {
    id: 'vaishno_devi',
    name: 'वैष्णो देवी मंदिर',
    nameEn: 'Vaishno Devi Temple',
    state: 'जम्मू & कश्मीर',
    deity: 'दुर्गा',
    type: 'Shakti Peeth',
    emoji: '⛰️',
    desc: 'त्रिकुट पर्वत पर स्थित माँ वैष्णो देवी का पवित्र गुफा मंदिर।',
    history:
      'यह मंदिर त्रेतायुग से पूजित है। माँ वैष्णो देवी ने यहाँ तपस्या की थी।',
    timings: '24 घंटे खुला (यात्रा पास अनिवार्य)',
    bestTime: 'मार्च–मई, अक्टूबर–नवंबर',
    location: 'कटरा, जम्मू, J&K',
    mapQuery: 'Vaishno+Devi+Temple+Katra',
    color: '#F48FB1',
    gradient:
      'linear-gradient(135deg, rgba(244,143,177,0.15), rgba(194,24,91,0.08))',
  },
  {
    id: 'tirupati',
    name: 'तिरुपति बालाजी',
    nameEn: 'Tirupati Balaji',
    state: 'आंध्र प्रदेश',
    deity: 'विष्णु',
    type: 'Vaishnava',
    emoji: '🌟',
    desc: 'विश्व का सबसे अमीर और सर्वाधिक दर्शनार्थियों वाला मंदिर — भगवान वेंकटेश्वर का धाम।',
    history:
      'यह मंदिर 300 ई. के आसपास बना। यहाँ प्रकाश के देवता वेंकटेश्वर की पूजा होती है।',
    timings: '2:30AM – 1:30AM (22 घंटे खुला)',
    bestTime: 'सितंबर–फरवरी (ब्रह्मोत्सव में)',
    location: 'तिरुमाला, चित्तूर, आंध्र प्रदेश',
    mapQuery: 'Tirupati+Balaji+Temple+Andhra+Pradesh',
    color: '#FFD54F',
    gradient:
      'linear-gradient(135deg, rgba(255,213,79,0.15), rgba(255,160,0,0.08))',
  },
  {
    id: 'rameshwaram',
    name: 'रामेश्वरम मंदिर',
    nameEn: 'Rameshwaram Temple',
    state: 'तमिलनाडु',
    deity: 'शिव',
    type: 'Jyotirlinga',
    emoji: '🏝️',
    desc: 'चार धाम में से एक, रामनाथस्वामी मंदिर – भगवान राम द्वारा स्थापित शिवलिंग।',
    history:
      'रावण वध के पाप से मुक्ति के लिए भगवान राम ने यहाँ शिवलिंग स्थापित किया था।',
    timings: '5AM – 1PM, 3PM – 9PM',
    bestTime: 'अक्टूबर–मार्च',
    location: 'रामनाथपुरम, तमिलनाडु',
    mapQuery: 'Ramanathaswamy+Temple+Rameswaram',
    color: '#80DEEA',
    gradient:
      'linear-gradient(135deg, rgba(128,222,234,0.15), rgba(0,151,167,0.08))',
  },
  {
    id: 'kashi_vishwanath',
    name: 'काशी विश्वनाथ',
    nameEn: 'Kashi Vishwanath',
    state: 'उत्तर प्रदेश',
    deity: 'शिव',
    type: 'Jyotirlinga',
    emoji: '🪔',
    desc: 'वाराणसी में गंगा तट पर स्थित 12 ज्योतिर्लिंगों में से एक।',
    history:
      'मूल मंदिर औरंगज़ेब ने नष्ट किया था। 1780 में अहिल्याबाई होलकर ने वर्तमान मंदिर बनवाया।',
    timings: '3AM – 11PM',
    bestTime: 'नवंबर–मार्च, देव दीपावली',
    location: 'वाराणसी, उत्तर प्रदेश',
    mapQuery: 'Kashi+Vishwanath+Temple+Varanasi',
    color: '#FFAB91',
    gradient:
      'linear-gradient(135deg, rgba(255,171,145,0.15), rgba(230,74,25,0.08))',
  },
  {
    id: 'jagannath',
    name: 'जगन्नाथ पुरी',
    nameEn: 'Jagannath Puri',
    state: 'ओडिशा',
    deity: 'कृष्ण (जगन्नाथ)',
    type: 'Vaishnava',
    emoji: '🎪',
    desc: 'चार धामों में से एक — भगवान जगन्नाथ, बलभद्र और सुभद्रा का प्रसिद्ध मंदिर।',
    history:
      'यह मंदिर 12वीं शताब्दी में राजा अनंतवर्मन् चोडगंग देव ने बनवाया था।',
    timings: '5AM – 11PM (गैर-हिंदुओं को अनुमति नहीं)',
    bestTime: 'जुलाई में रथयात्रा, अक्टूबर–फरवरी',
    location: 'पुरी, ओडिशा',
    mapQuery: 'Jagannath+Temple+Puri+Odisha',
    color: '#CE93D8',
    gradient:
      'linear-gradient(135deg, rgba(206,147,216,0.15), rgba(106,27,154,0.08))',
  },
  {
    id: 'dwarka',
    name: 'द्वारकाधीश मंदिर',
    nameEn: 'Dwarkadhish Temple',
    state: 'गुजरात',
    deity: 'कृष्ण',
    type: 'Vaishnava',
    emoji: '🌅',
    desc: 'चार धामों में से एक — भगवान कृष्ण की द्वारका नगरी में जगत मंदिर।',
    history:
      'यह मंदिर 2,500 वर्ष पुराना माना जाता है। भगवान कृष्ण ने यहाँ अपनी राजधानी स्थापित की थी।',
    timings: '6:30AM – 1PM, 5PM – 9:30PM',
    bestTime: 'अक्टूबर–मार्च, जन्माष्टमी',
    location: 'द्वारका, गुजरात',
    mapQuery: 'Dwarkadhish+Temple+Dwarka+Gujarat',
    color: '#A5D6A7',
    gradient:
      'linear-gradient(135deg, rgba(165,214,167,0.15), rgba(27,94,32,0.08))',
  },
  {
    id: 'krishna_janmabhoomi',
    name: 'श्री कृष्ण जन्मभूमि मंदिर',
    nameEn: 'Shri Krishna Janmabhoomi Temple',
    state: 'उत्तर प्रदेश',
    deity: 'कृष्ण',
    type: 'Vaishnava',
    emoji: '🪷',
    desc: 'भगवान कृष्ण का जन्मस्थान — मथुरा का अत्यंत पवित्र तीर्थ।',
    history:
      'यह स्थल प्राचीन काल से कृष्ण जन्मस्थली के रूप में पूजित है और समय-समय पर मंदिर का पुनर्निर्माण हुआ।',
    timings: '5AM – 12PM, 4PM – 9:30PM',
    bestTime: 'जन्माष्टमी, अक्टूबर–मार्च',
    location: 'मथुरा, उत्तर प्रदेश',
    mapQuery: 'Shri+Krishna+Janmabhoomi+Temple+Mathura',
    color: '#64B5F6',
    gradient:
      'linear-gradient(135deg, rgba(100,181,246,0.15), rgba(25,118,210,0.08))',
  },
  {
    id: 'banke_bihari',
    name: 'बांके बिहारी मंदिर',
    nameEn: 'Banke Bihari Temple',
    state: 'उत्तर प्रदेश',
    deity: 'कृष्ण',
    type: 'Vaishnava',
    emoji: '🎵',
    desc: 'वृंदावन का अत्यंत प्रसिद्ध राधा-कृष्ण मंदिर।',
    history:
      'यह मंदिर स्वामी हरिदास की परंपरा से जुड़ा है और ठाकुरजी की मनमोहक सेवा-परंपरा के लिए प्रसिद्ध है।',
    timings: '7:45AM – 12PM, 5:30PM – 9:30PM',
    bestTime: 'जन्माष्टमी, होली, कार्तिक मास',
    location: 'वृंदावन, उत्तर प्रदेश',
    mapQuery: 'Banke+Bihari+Temple+Vrindavan',
    color: '#9575CD',
    gradient:
      'linear-gradient(135deg, rgba(149,117,205,0.15), rgba(81,45,168,0.08))',
  },
  {
    id: 'udupi_krishna',
    name: 'उडुपी श्री कृष्ण मंदिर',
    nameEn: 'Udupi Sri Krishna Temple',
    state: 'कर्नाटक',
    deity: 'कृष्ण',
    type: 'Vaishnava',
    emoji: '🌺',
    desc: 'दक्षिण भारत का प्रमुख कृष्ण मंदिर और माध्व परंपरा का महत्वपूर्ण केंद्र।',
    history:
      '13वीं शताब्दी में श्री माध्वाचार्य से जुड़ी परंपरा में यह मंदिर विशेष महत्व रखता है।',
    timings: '5AM – 9PM',
    bestTime: 'नवंबर–फरवरी, कृष्ण जन्माष्टमी',
    location: 'उडुपी, कर्नाटक',
    mapQuery: 'Udupi+Sri+Krishna+Temple+Karnataka',
    color: '#4DB6AC',
    gradient:
      'linear-gradient(135deg, rgba(77,182,172,0.15), rgba(0,121,107,0.08))',
  },
  {
    id: 'guruvayur_krishna',
    name: 'गुरुवायूर श्री कृष्ण मंदिर',
    nameEn: 'Guruvayur Sri Krishna Temple',
    state: 'केरल',
    deity: 'कृष्ण',
    type: 'Vaishnava',
    emoji: '🪔',
    desc: '“दक्षिण का द्वारका” कहलाने वाला प्राचीन और विख्यात कृष्ण धाम।',
    history:
      'गुरुवायूरप्पन की पूजा-परंपरा के कारण यह मंदिर सदियों से भक्ति का प्रमुख केंद्र रहा है।',
    timings: '3AM – 1:30PM, 4:30PM – 9:15PM',
    bestTime: 'नवंबर–फरवरी, एकादशी उत्सव',
    location: 'गुरुवायूर, त्रिशूर, केरल',
    mapQuery: 'Guruvayur+Sri+Krishna+Temple+Kerala',
    color: '#AED581',
    gradient:
      'linear-gradient(135deg, rgba(174,213,129,0.15), rgba(85,139,47,0.08))',
  },
  {
    id: 'iskcon_bengaluru',
    name: 'इस्कॉन मंदिर बेंगलुरु',
    nameEn: 'ISKCON Bangalore',
    state: 'कर्नाटक',
    deity: 'कृष्ण',
    type: 'Vaishnava',
    emoji: '🏙️',
    desc: 'आधुनिक और भव्य कृष्ण मंदिर, बेंगलुरु का प्रमुख आध्यात्मिक स्थल।',
    history:
      'ISKCON द्वारा विकसित यह मंदिर आधुनिक वास्तुशैली और भक्तिमय गतिविधियों के लिए प्रसिद्ध है।',
    timings: '4:15AM – 1PM, 4:15PM – 8:20PM',
    bestTime: 'जन्माष्टमी, वर्ष भर',
    location: 'राजाजीनगर, बेंगलुरु, कर्नाटक',
    mapQuery: 'ISKCON+Temple+Bangalore',
    color: '#90CAF9',
    gradient:
      'linear-gradient(135deg, rgba(144,202,249,0.15), rgba(21,101,192,0.08))',
  },
  {
    id: 'iskcon_london',
    name: 'ISKCON श्री श्री राधा लंदन मंदिर',
    nameEn: 'ISKCON Sri Sri Radha London Temple',
    state: 'UK',
    deity: 'Krishna',
    type: 'Vaishnava',
    emoji: '🇬🇧',
    desc: 'लंदन क्षेत्र का प्रसिद्ध कृष्ण मंदिर और वैश्विक ISKCON केंद्रों में प्रमुख।',
    history:
      'यूरोप में कृष्ण भक्ति के प्रसार में इस मंदिर की महत्वपूर्ण भूमिका रही है।',
    timings: 'Daily: 4:30AM – 8:30PM',
    bestTime: 'Janmashtami, Sunday festivals',
    location: 'London, United Kingdom',
    mapQuery: 'ISKCON+Sri+Sri+Radha+London+Temple',
    color: '#F48FB1',
    gradient:
      'linear-gradient(135deg, rgba(244,143,177,0.15), rgba(173,20,87,0.08))',
  },
  {
    id: 'bhaktivedanta_manor',
    name: 'भक्तिवेदांत मैनर',
    nameEn: 'Bhaktivedanta Manor',
    state: 'England',
    deity: 'Krishna',
    type: 'Vaishnava',
    emoji: '🏰',
    desc: 'इंग्लैंड का प्रमुख कृष्ण धाम, यूरोप में कृष्ण भक्तों का महत्वपूर्ण केंद्र।',
    history:
      'यह परिसर यूरोप में गौड़ीय वैष्णव परंपरा के विस्तार में ऐतिहासिक रूप से अत्यंत महत्वपूर्ण रहा है।',
    timings: 'Daily: 4:30AM – 8:30PM',
    bestTime: 'Janmashtami, summer festivals',
    location: 'Watford, England',
    mapQuery: 'Bhaktivedanta+Manor+Watford',
    color: '#CE93D8',
    gradient:
      'linear-gradient(135deg, rgba(206,147,216,0.15), rgba(123,31,162,0.08))',
  },
  {
    id: 'iskcon_usa',
    name: 'ISKCON श्री श्री राधा कृष्ण मंदिर',
    nameEn: 'ISKCON Sri Sri Radha Krishna Temple (USA)',
    state: 'USA',
    deity: 'Krishna',
    type: 'Vaishnava',
    emoji: '🇺🇸',
    desc: 'अमेरिका में प्रसिद्ध ISKCON राधा-कृष्ण मंदिर परंपरा का प्रतिनिधि केंद्र।',
    history:
      'USA में ISKCON केंद्रों ने श्रीकृष्ण भक्ति, कीर्तन और गीता प्रचार को व्यापक रूप से स्थापित किया।',
    timings: 'Daily: varies by center',
    bestTime: 'Janmashtami, weekend festivals',
    location: 'Spanish Fork, Utah, USA',
    mapQuery: 'ISKCON+Sri+Sri+Radha+Krishna+Temple+Spanish+Fork+Utah',
    color: '#81D4FA',
    gradient:
      'linear-gradient(135deg, rgba(129,212,250,0.15), rgba(2,136,209,0.08))',
  },
  {
    id: 'radha_radhanath_sa',
    name: 'श्री श्री राधा राधानाथ मंदिर',
    nameEn: 'Sri Sri Radha Radhanath Temple',
    state: 'South Africa',
    deity: 'Krishna',
    type: 'Vaishnava',
    emoji: '🇿🇦',
    desc: 'दक्षिण अफ्रीका का प्रसिद्ध राधा-कृष्ण मंदिर।',
    history:
      'दक्षिण अफ्रीका में वैष्णव भक्ति और कीर्तन परंपरा के प्रसार में इस केंद्र का उल्लेखनीय योगदान है।',
    timings: 'Daily: 4:30AM – 8:30PM',
    bestTime: 'Janmashtami, major Vaishnava festivals',
    location: 'Durban, South Africa',
    mapQuery: 'Sri+Sri+Radha+Radhanath+Temple+Durban',
    color: '#FFAB91',
    gradient:
      'linear-gradient(135deg, rgba(255,171,145,0.15), rgba(216,67,21,0.08))',
  },
  {
    id: 'wat_kanchanapisek',
    name: 'श्री कृष्ण मंदिर (वाट कंचनापिसेक)',
    nameEn: 'Sri Krishna Mandir (Wat Kanchanapisek)',
    state: 'Thailand',
    deity: 'Krishna',
    type: 'Vaishnava',
    emoji: '🇹🇭',
    desc: 'थाईलैंड में स्थित प्रसिद्ध कृष्ण मंदिर, अंतरराष्ट्रीय भक्त समुदाय का केंद्र।',
    history:
      'यह मंदिर दक्षिण-पूर्व एशिया में कृष्ण भक्ति के प्रसार का महत्वपूर्ण स्थल माना जाता है।',
    timings: 'Daily: 5AM – 8:30PM',
    bestTime: 'Janmashtami, major festival days',
    location: 'Bangkok, Thailand',
    mapQuery: 'Sri+Krishna+Mandir+Wat+Kanchanapisek+Thailand',
    color: '#FFCC80',
    gradient:
      'linear-gradient(135deg, rgba(255,204,128,0.15), rgba(239,108,0,0.08))',
  },
  {
    id: 'iskcon_australia',
    name: 'ISKCON श्री श्री राधा कृष्ण मंदिर',
    nameEn: 'ISKCON Sri Sri Radha Krishna Temple (Australia)',
    state: 'Australia',
    deity: 'Krishna',
    type: 'Vaishnava',
    emoji: '🇦🇺',
    desc: 'ऑस्ट्रेलिया का प्रमुख ISKCON राधा-कृष्ण मंदिर।',
    history:
      'ऑस्ट्रेलिया में कृष्ण भक्ति, संकीर्तन और वैदिक संस्कृति के प्रसार में ISKCON मंदिरों की महत्वपूर्ण भूमिका रही है।',
    timings: 'Daily: varies by center',
    bestTime: 'Janmashtami, Gaura Purnima',
    location: 'Sydney, New South Wales, Australia',
    mapQuery: 'ISKCON+Sri+Sri+Radha+Krishna+Temple+Sydney',
    color: '#B39DDB',
    gradient:
      'linear-gradient(135deg, rgba(179,157,219,0.15), rgba(94,53,177,0.08))',
  },
  {
    id: 'shirdi',
    name: 'साईं बाबा शिर्डी',
    nameEn: 'Shirdi Sai Baba Temple',
    state: 'महाराष्ट्र',
    deity: 'साईं',
    type: 'Saint Shrine',
    emoji: '✨',
    desc: 'साईं बाबा की समाधि — लाखों भक्तों की आस्था का केंद्र।',
    history:
      'साईं बाबा 1918 में शिर्डी में समाधि लिए। उनकी समाधि के ऊपर मंदिर बनाया गया।',
    timings: '4AM – 11:15PM',
    bestTime: 'सितंबर–मार्च, गुरु पूर्णिमा पर',
    location: 'शिर्डी, अहमदनगर, महाराष्ट्र',
    mapQuery: 'Shirdi+Sai+Baba+Temple+Maharashtra',
    color: '#FFE082',
    gradient:
      'linear-gradient(135deg, rgba(255,224,130,0.15), rgba(245,127,23,0.08))',
  },
  {
    id: 'meenakshi',
    name: 'मीनाक्षी अम्मन मंदिर',
    nameEn: 'Meenakshi Amman Temple',
    state: 'तमिलनाडु',
    deity: 'दुर्गा',
    type: 'Shakti Peeth',
    emoji: '🏛️',
    desc: 'मदुरई की देवी मीनाक्षी को समर्पित विशाल द्रविड़ वास्तुकला का अद्भुत मंदिर।',
    history:
      '14 गोपुरम और 33,000 मूर्तियों वाला यह मंदिर 2,500 वर्ष पुराना है।',
    timings: '5AM – 12:30PM, 4PM – 10PM',
    bestTime: 'अक्टूबर–मार्च, मीनाक्षी तिरुकल्याणम उत्सव',
    location: 'मदुरई, तमिलनाडु',
    mapQuery: 'Meenakshi+Amman+Temple+Madurai',
    color: '#F48FB1',
    gradient:
      'linear-gradient(135deg, rgba(244,143,177,0.15), rgba(136,14,79,0.08))',
  },
  {
    id: 'siddhivinayak',
    name: 'सिद्धिविनायक मंदिर',
    nameEn: 'Siddhivinayak Temple',
    state: 'महाराष्ट्र',
    deity: 'गणेश',
    type: 'Ganesh Temple',
    emoji: '🐘',
    desc: 'मुंबई का प्रसिद्ध गणेश मंदिर — सिद्धि–बुद्धि दाता भगवान गणपति का धाम।',
    history:
      '1801 में लक्ष्मण विठू और देउबाई पाटिल ने इसे बनवाया। मूर्ति की सूड दाईं ओर है।',
    timings: '5:30AM – 10PM',
    bestTime: 'पूरे वर्ष, गणेश चतुर्थी पर',
    location: 'प्रभादेवी, मुंबई, महाराष्ट्र',
    mapQuery: 'Siddhivinayak+Temple+Mumbai',
    color: '#FFCC80',
    gradient:
      'linear-gradient(135deg, rgba(255,204,128,0.15), rgba(230,81,0,0.08))',
  },
  {
    id: 'badrinath',
    name: 'बद्रीनाथ धाम',
    nameEn: 'Badrinath Temple',
    state: 'उत्तराखंड',
    deity: 'विष्णु',
    type: 'Char Dham',
    emoji: '🏔️',
    desc: 'चार धामों में से एक — अलकनंदा नदी के तट पर भगवान विष्णु का पावन धाम।',
    history: 'आदि शंकराचार्य ने 8वीं शताब्दी में इस मंदिर की स्थापना की थी।',
    timings: 'मई–नवंबर: 4:30AM – 9PM',
    bestTime: 'मई–जून, सितंबर–अक्टूबर',
    location: 'चमोली, उत्तराखंड',
    mapQuery: 'Badrinath+Temple+Uttarakhand',
    color: '#B39DDB',
    gradient:
      'linear-gradient(135deg, rgba(179,157,219,0.15), rgba(69,39,160,0.08))',
  },
  {
    id: 'khajuraho',
    name: 'खजुराहो मंदिर',
    nameEn: 'Khajuraho Temples',
    state: 'मध्य प्रदेश',
    deity: 'शिव',
    type: 'Heritage',
    emoji: '🏯',
    desc: 'चंदेल राजाओं द्वारा निर्मित यूनेस्को विश्व धरोहर — अद्भुत मूर्तिकला का खजाना।',
    history: '950-1050 ई. में बने इन 85 मंदिरों में से 25 आज भी सुरक्षित हैं।',
    timings: 'सूर्योदय से सूर्यास्त',
    bestTime: 'अक्टूबर–मार्च, फरवरी में नृत्य महोत्सव',
    location: 'छतरपुर, मध्य प्रदेश',
    mapQuery: 'Khajuraho+Temples+Madhya+Pradesh',
    color: '#BCAAA4',
    gradient:
      'linear-gradient(135deg, rgba(188,170,164,0.15), rgba(78,52,46,0.08))',
  },
  {
    id: 'golden_temple',
    name: 'स्वर्ण मंदिर (हरमंदिर साहिब)',
    nameEn: 'Golden Temple',
    state: 'पंजाब',
    deity: 'Sikh Shrine',
    type: 'Heritage',
    emoji: '✨',
    desc: 'सिख धर्म का सबसे पवित्र स्थल — अमृत सरोवर में स्वर्णिम धाम।',
    history:
      '1577 में गुरु राम दास जी ने तालाब बनवाया। 1604 में मंदिर स्थापित हुआ।',
    timings: '24 घंटे खुला',
    bestTime: 'अक्टूबर–मार्च, गुरुपर्व पर',
    location: 'अमृतसर, पंजाब',
    mapQuery: 'Golden+Temple+Amritsar+Punjab',
    color: '#FFD700',
    gradient:
      'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(184,134,11,0.1))',
  },
  {
    id: 'konark',
    name: 'कोणार्क सूर्य मंदिर',
    nameEn: 'Konark Sun Temple',
    state: 'ओडिशा',
    deity: 'सूर्य',
    type: 'Heritage',
    emoji: '☀️',
    desc: 'यूनेस्को विश्व धरोहर — सूर्यदेव को समर्पित 13वीं शताब्दी का विशाल रथाकार मंदिर।',
    history:
      '1250 ई. में राजा नरसिम्हदेव प्रथम ने बनवाया। 12 जोड़ी पहियों वाला विशाल रथ।',
    timings: '6AM – 8PM',
    bestTime: 'नवंबर–फरवरी, कोणार्क नृत्य महोत्सव',
    location: 'पुरी, ओडिशा',
    mapQuery: 'Konark+Sun+Temple+Odisha',
    color: '#FFAB40',
    gradient:
      'linear-gradient(135deg, rgba(255,171,64,0.15), rgba(230,81,0,0.08))',
  },
  {
    id: 'dagdusheth',
    name: 'दगडूशेठ हलवाई गणपति मंदिर',
    nameEn: 'Dagdusheth Halwai Ganapati Temple',
    state: 'महाराष्ट्र',
    deity: 'गणेश',
    type: 'Ganesh Temple',
    emoji: '🐘',
    desc: 'पुणे का अत्यंत प्रसिद्ध गणपति मंदिर, भव्य उत्सव और सजावट के लिए विख्यात।',
    history:
      '19वीं शताब्दी में स्थापित यह मंदिर गणेश भक्तों की प्रमुख आस्था स्थली है।',
    timings: '6AM – 10:30PM',
    bestTime: 'गणेशोत्सव, अगस्त–सितंबर',
    location: 'पुणे, महाराष्ट्र',
    mapQuery: 'Dagdusheth+Halwai+Ganapati+Temple+Pune',
    color: '#FFCC80',
    gradient:
      'linear-gradient(135deg, rgba(255,204,128,0.15), rgba(230,81,0,0.08))',
  },
  {
    id: 'mayureshwar_morgaon',
    name: 'श्री मयूरेश्वर मंदिर',
    nameEn: 'Shri Mayureshwar Temple',
    state: 'महाराष्ट्र',
    deity: 'गणेश',
    type: 'Ganesh Temple',
    emoji: '🦚',
    desc: 'मोरगांव का अष्टविनायक में प्रमुख मयूरेश्वर गणपति मंदिर।',
    history: 'अष्टविनायक परंपरा में यह मंदिर अत्यंत महत्वपूर्ण माना जाता है।',
    timings: '5AM – 10PM',
    bestTime: 'गणेश चतुर्थी, वर्ष भर',
    location: 'मोरगांव, पुणे, महाराष्ट्र',
    mapQuery: 'Mayureshwar+Temple+Morgaon',
    color: '#FFE082',
    gradient:
      'linear-gradient(135deg, rgba(255,224,130,0.15), rgba(245,127,23,0.08))',
  },
  {
    id: 'maha_vallabha_ny',
    name: 'श्री महा वल्लभ गणपति देवस्थानम',
    nameEn: 'Sri Maha Vallabha Ganapati Devasthanam',
    state: 'USA',
    deity: 'गणेश',
    type: 'Ganesh Temple',
    emoji: '🇺🇸',
    desc: 'न्यूयॉर्क का प्रसिद्ध गणपति मंदिर और उत्तर अमेरिका का प्रमुख गणेश धाम।',
    history: 'अमेरिका में गणेश भक्ति के प्रमुख केंद्रों में से एक।',
    timings: 'Daily: 8AM – 8PM',
    bestTime: 'Ganesh Chaturthi, weekend darshan',
    location: 'Flushing, New York, USA',
    mapQuery: 'Sri+Maha+Vallabha+Ganapati+Devasthanam+New+York',
    color: '#90CAF9',
    gradient:
      'linear-gradient(135deg, rgba(144,202,249,0.15), rgba(21,101,192,0.08))',
  },
  {
    id: 'pashupatinath',
    name: 'पशुपतिनाथ मंदिर',
    nameEn: 'Pashupatinath Temple',
    state: 'नेपाल',
    deity: 'शिव',
    type: 'Heritage',
    emoji: '🔱',
    desc: 'काठमांडू में बागमती नदी तट पर स्थित विश्वप्रसिद्ध शिव मंदिर।',
    history:
      'यह प्राचीन मंदिर यूनेस्को धरोहर क्षेत्र का हिस्सा है और शैव परंपरा में अत्यंत पूजनीय है।',
    timings: '4AM – 9PM',
    bestTime: 'महाशिवरात्रि, अक्टूबर–मार्च',
    location: 'काठमांडू, नेपाल',
    mapQuery: 'Pashupatinath+Temple+Kathmandu',
    color: '#B39DDB',
    gradient:
      'linear-gradient(135deg, rgba(179,157,219,0.15), rgba(94,53,177,0.08))',
  },
  {
    id: 'kamakhya',
    name: 'कामाख्या मंदिर',
    nameEn: 'Kamakhya Temple',
    state: 'असम',
    deity: 'दुर्गा',
    type: 'Shakti Peeth',
    emoji: '🌺',
    desc: 'नीलकंठ पहाड़ी पर स्थित भारत के प्रमुख शक्ति पीठों में से एक।',
    history:
      'कामाख्या देवी का यह मंदिर तांत्रिक साधना और शक्ति उपासना का प्राचीन केंद्र है।',
    timings: '5:30AM – 10PM',
    bestTime: 'अंबुबाची मेला, अक्टूबर–मार्च',
    location: 'गुवाहाटी, असम',
    mapQuery: 'Kamakhya+Temple+Guwahati+Assam',
    color: '#F06292',
    gradient:
      'linear-gradient(135deg, rgba(240,98,146,0.15), rgba(173,20,87,0.08))',
  },
  {
    id: 'durgiana',
    name: 'दुर्गियाना मंदिर',
    nameEn: 'Durgiana Temple',
    state: 'पंजाब',
    deity: 'दुर्गा',
    type: 'Shakti Peeth',
    emoji: '🪷',
    desc: 'अमृतसर का प्रसिद्ध दुर्गा मंदिर, सरोवर और स्वर्णिम वास्तु शैली के लिए प्रसिद्ध।',
    history:
      'यह मंदिर हिंदू श्रद्धालुओं के लिए पंजाब का महत्वपूर्ण शक्तिपीठ स्थल माना जाता है।',
    timings: '5AM – 10PM',
    bestTime: 'नवरात्रि, अक्टूबर–मार्च',
    location: 'अमृतसर, पंजाब',
    mapQuery: 'Durgiana+Temple+Amritsar',
    color: '#FF8A80',
    gradient:
      'linear-gradient(135deg, rgba(255,138,128,0.15), rgba(198,40,40,0.08))',
  },
  {
    id: 'mahalaxmi_kolhapur',
    name: 'महालक्ष्मी मंदिर',
    nameEn: 'Mahalaxmi Temple Kolhapur',
    state: 'महाराष्ट्र',
    deity: 'लक्ष्मी',
    type: 'Vaishnava',
    emoji: '💰',
    desc: 'कोल्हापुर की अंबाबाई महालक्ष्मी का प्राचीन और अत्यंत पूजनीय मंदिर।',
    history:
      'यह मंदिर करवीर क्षेत्र का प्रमुख तीर्थ है और शक्ति-वैष्णव दोनों परंपराओं में मान्य है।',
    timings: '4AM – 10:30PM',
    bestTime: 'नवरात्रि, वर्ष भर',
    location: 'कोल्हापुर, महाराष्ट्र',
    mapQuery: 'Mahalaxmi+Temple+Kolhapur',
    color: '#FFD54F',
    gradient:
      'linear-gradient(135deg, rgba(255,213,79,0.15), rgba(255,160,0,0.08))',
  },
  {
    id: 'ashtalakshmi_chennai',
    name: 'अष्टलक्ष्मी मंदिर',
    nameEn: 'Ashtalakshmi Temple',
    state: 'तमिलनाडु',
    deity: 'लक्ष्मी',
    type: 'Vaishnava',
    emoji: '🪙',
    desc: 'चेन्नई का समुद्र तट स्थित अष्ट रूपों वाली देवी लक्ष्मी को समर्पित मंदिर।',
    history:
      'अष्ट लक्ष्मी की उपासना के लिए यह आधुनिक काल का प्रसिद्ध मंदिर है।',
    timings: '6:30AM – 12PM, 4PM – 9PM',
    bestTime: 'शुक्रवार, त्योहार और वर्ष भर',
    location: 'बेसेंट नगर, चेन्नई, तमिलनाडु',
    mapQuery: 'Ashtalakshmi+Temple+Chennai',
    color: '#FFCC80',
    gradient:
      'linear-gradient(135deg, rgba(255,204,128,0.15), rgba(239,108,0,0.08))',
  },
  {
    id: 'sharda_peeth',
    name: 'शारदा पीठ',
    nameEn: 'Sharda Peeth',
    state: 'Pakistan',
    deity: 'सरस्वती',
    type: 'Heritage',
    emoji: '🎓',
    desc: 'प्राचीन शारदा देवी (सरस्वती) से जुड़ा ऐतिहासिक और आध्यात्मिक स्थल।',
    history:
      'कश्मीर क्षेत्र का यह प्राचीन विद्यापीठ भारतीय ज्ञान परंपरा में महत्वपूर्ण माना जाता है।',
    timings: 'स्थानीय नियमों के अनुसार',
    bestTime: 'मौसम अनुसार यात्रा',
    location: 'नीलम वैली, पाकिस्तान प्रशासित कश्मीर',
    mapQuery: 'Sharda+Peeth+Neelum+Valley',
    color: '#B39DDB',
    gradient:
      'linear-gradient(135deg, rgba(179,157,219,0.15), rgba(69,39,160,0.08))',
  },
  {
    id: 'basara_saraswati',
    name: 'बसरा सरस्वती मंदिर',
    nameEn: 'Basara Saraswati Temple',
    state: 'तेलंगाना',
    deity: 'सरस्वती',
    type: 'Shakti Peeth',
    emoji: '📚',
    desc: 'ज्ञान की देवी सरस्वती का प्रसिद्ध मंदिर, बच्चों के अक्षरारंभ संस्कार के लिए विख्यात।',
    history:
      'गोदावरी तट पर स्थित यह मंदिर विद्यारंभ परंपरा के कारण अत्यधिक लोकप्रिय है।',
    timings: '4AM – 8:30PM',
    bestTime: 'वसंत पंचमी, नवंबर–फरवरी',
    location: 'बसरा, निर्मल, तेलंगाना',
    mapQuery: 'Gnana+Saraswati+Temple+Basar+Telangana',
    color: '#80DEEA',
    gradient:
      'linear-gradient(135deg, rgba(128,222,234,0.15), rgba(0,151,167,0.08))',
  },
  {
    id: 'srirangam',
    name: 'श्री रंगनाथस्वामी मंदिर',
    nameEn: 'Sri Ranganathaswamy Temple',
    state: 'तमिलनाडु',
    deity: 'विष्णु',
    type: 'Vaishnava',
    emoji: '🐚',
    desc: 'श्रीरंगम का विश्वप्रसिद्ध वैष्णव मंदिर और श्रीवैष्णव परंपरा का प्रमुख केंद्र।',
    history:
      'यह मंदिर भारत के सबसे बड़े क्रियाशील मंदिर परिसरों में से एक माना जाता है।',
    timings: '6AM – 9PM',
    bestTime: 'दिसंबर–फरवरी, वैकुंठ एकादशी',
    location: 'श्रीरंगम, तिरुचिरापल्ली, तमिलनाडु',
    mapQuery: 'Sri+Ranganathaswamy+Temple+Srirangam',
    color: '#A5D6A7',
    gradient:
      'linear-gradient(135deg, rgba(165,214,167,0.15), rgba(46,125,50,0.08))',
  },
  {
    id: 'ram_janmabhoomi',
    name: 'श्री राम जन्मभूमि मंदिर',
    nameEn: 'Shri Ram Janmabhoomi Mandir',
    state: 'उत्तर प्रदेश',
    deity: 'राम',
    type: 'Char Dham',
    emoji: '🏹',
    desc: 'अयोध्या में स्थित भगवान श्रीराम जन्मभूमि पर निर्मित भव्य मंदिर।',
    history:
      'यह स्थल रामायण परंपरा में प्रभु श्रीराम का जन्मस्थान माना जाता है।',
    timings: '6AM – 10PM',
    bestTime: 'राम नवमी, अक्टूबर–मार्च',
    location: 'अयोध्या, उत्तर प्रदेश',
    mapQuery: 'Shri+Ram+Janmabhoomi+Mandir+Ayodhya',
    color: '#FFAB91',
    gradient:
      'linear-gradient(135deg, rgba(255,171,145,0.15), rgba(230,74,25,0.08))',
  },
  {
    id: 'kalaram_nashik',
    name: 'काला राम मंदिर',
    nameEn: 'Kala Ram Temple',
    state: 'महाराष्ट्र',
    deity: 'राम',
    type: 'Heritage',
    emoji: '🏛️',
    desc: 'नासिक का प्रसिद्ध राम मंदिर, काले पाषाण की श्रीराम प्रतिमा के लिए विख्यात।',
    history:
      '18वीं शताब्दी में निर्मित यह मंदिर रामभक्ति परंपरा का प्रमुख स्थल है।',
    timings: '5AM – 10PM',
    bestTime: 'राम नवमी, वर्ष भर',
    location: 'पंचवटी, नासिक, महाराष्ट्र',
    mapQuery: 'Kala+Ram+Temple+Nashik',
    color: '#BCAAA4',
    gradient:
      'linear-gradient(135deg, rgba(188,170,164,0.15), rgba(78,52,46,0.08))',
  },
  {
    id: 'hanumangarhi_ayodhya',
    name: 'हनुमानगढ़ी मंदिर',
    nameEn: 'Hanumangarhi Temple',
    state: 'उत्तर प्रदेश',
    deity: 'हनुमान',
    type: 'Heritage',
    emoji: '🐒',
    desc: 'अयोध्या का प्रमुख हनुमान मंदिर, रामनगरी का महत्वपूर्ण तीर्थ।',
    history:
      'परंपरा के अनुसार अयोध्या की रक्षा हनुमानगढ़ी से होती है; यह सदियों पुराना श्रद्धा केंद्र है।',
    timings: '5AM – 10PM',
    bestTime: 'हनुमान जयंती, अक्टूबर–मार्च',
    location: 'अयोध्या, उत्तर प्रदेश',
    mapQuery: 'Hanumangarhi+Temple+Ayodhya',
    color: '#FFCC80',
    gradient:
      'linear-gradient(135deg, rgba(255,204,128,0.15), rgba(230,81,0,0.08))',
  },
  {
    id: 'salasar_balaji',
    name: 'सालासर बालाजी मंदिर',
    nameEn: 'Salasar Balaji Temple',
    state: 'राजस्थान',
    deity: 'हनुमान',
    type: 'Heritage',
    emoji: '🛕',
    desc: 'राजस्थान का प्रसिद्ध बालाजी (हनुमान) मंदिर, दूर-दूर से भक्त दर्शन हेतु आते हैं।',
    history: 'सालासर धाम हनुमान भक्ति की अनूठी लोक परंपरा के लिए जाना जाता है।',
    timings: '4AM – 10PM',
    bestTime: 'हनुमान जयंती, आश्विन/चैत्र मेले',
    location: 'सालासर, चूरू, राजस्थान',
    mapQuery: 'Salasar+Balaji+Temple+Rajasthan',
    color: '#FFE082',
    gradient:
      'linear-gradient(135deg, rgba(255,224,130,0.15), rgba(245,127,23,0.08))',
  },
  {
    id: 'sankatmochan_varanasi',
    name: 'श्री संकटमोचन हनुमान मंदिर',
    nameEn: 'Sankat Mochan Hanuman Temple',
    state: 'उत्तर प्रदेश',
    deity: 'हनुमान',
    type: 'Heritage',
    emoji: '🚩',
    desc: 'वाराणसी का विख्यात संकटमोचन मंदिर, हनुमान भक्तों का प्रमुख तीर्थ।',
    history:
      'मान्यता है कि गोस्वामी तुलसीदास जी से जुड़ी परंपरा में यह मंदिर स्थापित हुआ।',
    timings: '5AM – 10PM',
    bestTime: 'मंगलवार-शनिवार, हनुमान जयंती',
    location: 'वाराणसी, उत्तर प्रदेश',
    mapQuery: 'Sankat+Mochan+Hanuman+Temple+Varanasi',
    color: '#FFAB91',
    gradient:
      'linear-gradient(135deg, rgba(255,171,145,0.15), rgba(216,67,21,0.08))',
  },
  {
    id: 'modhera_sun',
    name: 'मोडेरा सूर्य मंदिर',
    nameEn: 'Modhera Sun Temple',
    state: 'गुजरात',
    deity: 'सूर्य',
    type: 'Heritage',
    emoji: '☀️',
    desc: 'गुजरात का ऐतिहासिक सूर्य मंदिर, सोलंकी युग की अद्भुत वास्तुकला का उदाहरण।',
    history:
      '11वीं शताब्दी में राजा भीमदेव प्रथम द्वारा निर्मित यह मंदिर स्थापत्य कला के लिए प्रसिद्ध है।',
    timings: '6AM – 6PM',
    bestTime: 'अक्टूबर–फरवरी, मोढेरा नृत्य महोत्सव',
    location: 'मोडेरा, गुजरात',
    mapQuery: 'Modhera+Sun+Temple+Gujarat',
    color: '#FFB74D',
    gradient:
      'linear-gradient(135deg, rgba(255,183,77,0.15), rgba(230,81,0,0.08))',
  },
  {
    id: 'kalighat_kali',
    name: 'कालीघाट काली मंदिर',
    nameEn: 'Kalighat Kali Temple',
    state: 'पश्चिम बंगाल',
    deity: 'काली',
    type: 'Shakti Peeth',
    emoji: '⚫',
    desc: 'कोलकाता का प्रसिद्ध काली मंदिर और प्रमुख शक्तिपीठों में से एक।',
    history:
      'काली उपासना की बंगाल परंपरा में कालीघाट का ऐतिहासिक महत्व अत्यंत गहरा है।',
    timings: '5AM – 2PM, 5PM – 10:30PM',
    bestTime: 'काली पूजा, नवरात्रि',
    location: 'कोलकाता, पश्चिम बंगाल',
    mapQuery: 'Kalighat+Kali+Temple+Kolkata',
    color: '#BA68C8',
    gradient:
      'linear-gradient(135deg, rgba(186,104,200,0.15), rgba(106,27,154,0.08))',
  },
  {
    id: 'dakshineswar_kali',
    name: 'दक्षिणेश्वर काली मंदिर',
    nameEn: 'Dakshineswar Kali Temple',
    state: 'पश्चिम बंगाल',
    deity: 'काली',
    type: 'Shakti Peeth',
    emoji: '🌙',
    desc: 'हुगली तट पर स्थित विख्यात काली मंदिर, रामकृष्ण परमहंस से जुड़ा पावन स्थल।',
    history:
      'रानी रासमणि द्वारा स्थापित यह मंदिर बंगाल की भक्ति परंपरा में विशिष्ट स्थान रखता है।',
    timings: '6AM – 12:30PM, 3PM – 8:30PM',
    bestTime: 'काली पूजा, सर्दियों में दर्शन',
    location: 'दक्षिणेश्वर, कोलकाता, पश्चिम बंगाल',
    mapQuery: 'Dakshineswar+Kali+Temple+Kolkata',
    color: '#9575CD',
    gradient:
      'linear-gradient(135deg, rgba(149,117,205,0.15), rgba(81,45,168,0.08))',
  },
  {
    id: 'khatu_shyam',
    name: 'खाटू श्याम मंदिर',
    nameEn: 'Khatu Shyam Temple',
    state: 'राजस्थान',
    deity: 'खाटू श्याम',
    type: 'Vaishnava',
    emoji: '🎠',
    desc: 'राजस्थान का प्रसिद्ध खाटू श्याम धाम, लाखों श्रद्धालुओं की आस्था का केंद्र।',
    history:
      'बर्बरीक रूप में पूजित खाटू श्याम जी का यह धाम फाल्गुन मेले के लिए विशेष प्रसिद्ध है।',
    timings: '4:30AM – 10PM',
    bestTime: 'फाल्गुन मेला, वर्ष भर',
    location: 'खाटू, सीकर, राजस्थान',
    mapQuery: 'Khatu+Shyam+Ji+Temple+Rajasthan',
    color: '#CE93D8',
    gradient:
      'linear-gradient(135deg, rgba(206,147,216,0.15), rgba(123,31,162,0.08))',
  },
  {
    id: 'shani_shingnapur',
    name: 'शनि शिंगणापुर मंदिर',
    nameEn: 'Shani Shingnapur Temple',
    state: 'महाराष्ट्र',
    deity: 'शनि',
    type: 'Heritage',
    emoji: '🪐',
    desc: 'महाराष्ट्र का प्रसिद्ध शनि धाम, खुले शनि शिला स्वरूप के लिए विख्यात।',
    history:
      'यह स्थल शनि उपासना की अनूठी परंपरा और ग्राम-आस्था के लिए प्रसिद्ध है।',
    timings: '24 घंटे खुला',
    bestTime: 'शनिवार, शनि अमावस्या',
    location: 'शिंगणापुर, अहमदनगर, महाराष्ट्र',
    mapQuery: 'Shani+Shingnapur+Temple+Maharashtra',
    color: '#90A4AE',
    gradient:
      'linear-gradient(135deg, rgba(144,164,174,0.15), rgba(55,71,79,0.08))',
  },
  {
    id: 'shani_kokilavan',
    name: 'शनि मंदिर (कोकिलावन)',
    nameEn: 'Shani Temple Kokilavan',
    state: 'उत्तर प्रदेश',
    deity: 'शनि',
    type: 'Heritage',
    emoji: '⚫',
    desc: 'कोकिलावन धाम का प्रसिद्ध शनि मंदिर, ब्रज क्षेत्र का महत्वपूर्ण तीर्थ।',
    history:
      'यह धाम शनि और राधा-कृष्ण भक्ति परंपरा से जुड़े दर्शन हेतु श्रद्धालुओं में लोकप्रिय है।',
    timings: '5AM – 9PM',
    bestTime: 'शनिवार, अमावस्या',
    location: 'कोकिलावन, मथुरा, उत्तर प्रदेश',
    mapQuery: 'Shani+Temple+Kokilavan+Mathura',
    color: '#78909C',
    gradient:
      'linear-gradient(135deg, rgba(120,144,156,0.15), rgba(38,50,56,0.08))',
  },
];

// ============ TEMPLES PAGE ============
const templeCategories = [
  { id: 'all', label: '✨ सभी', emoji: '🛕' },
  { id: 'india', label: '🇮🇳 भारत', emoji: '🇮🇳' },
  { id: 'outside_india', label: '🌍 विदेश', emoji: '🌍' },
  { id: 'Jyotirlinga', label: '🔱 ज्योतिर्लिंग', emoji: '🔱' },
  { id: 'Char Dham', label: '🙏 चार धाम', emoji: '🙏' },
  { id: 'Shakti Peeth', label: '🌺 शक्ति पीठ', emoji: '🌺' },
  { id: 'Vaishnava', label: '🦚 वैष्णव', emoji: '🦚' },
  { id: 'Heritage', label: '🏛️ धरोहर', emoji: '🏛️' },
];
let activeTempleFilter = 'all';

function isOutsideIndiaTemple(temple) {
  const text = `${temple.state || ''} ${temple.location || ''}`.toLowerCase();
  return (
    text.includes('usa') ||
    text.includes('uk') ||
    text.includes('england') ||
    text.includes('australia') ||
    text.includes('south africa') ||
    text.includes('thailand') ||
    text.includes('nepal') ||
    text.includes('pakistan') ||
    text.includes('united kingdom') ||
    text.includes('नेपाल') ||
    text.includes('पाकिस्तान')
  );
}

function buildTemplesPage() {
  // Build filters
  const filtersEl = document.getElementById('templeFilters');
  if (!filtersEl || filtersEl.innerHTML !== '') return; // Already built
  filtersEl.innerHTML = templeCategories
    .map(
      (cat) => `
    <button
      class="temple-filter-btn ${cat.id === 'all' ? 'active' : ''}"
      onclick="filterTemples('${cat.id}', this)"
      data-category="${cat.id}"
    >${cat.label}</button>
  `,
    )
    .join('');

  renderTemples('all');
}

function renderTemples(filter) {
  activeTempleFilter = filter;
  const grid = document.getElementById('templesGrid');
  const filtered =
    filter === 'all'
      ? templesData
      : filter === 'india'
        ? templesData.filter((t) => !isOutsideIndiaTemple(t))
        : filter === 'outside_india'
          ? templesData.filter((t) => isOutsideIndiaTemple(t))
          : templesData.filter((t) => t.type === filter);
  grid.innerHTML = filtered
    .map(
      (temple, idx) => `
    <div class="temple-card" onclick="openTempleModal('${temple.id}')" style="animation-delay:${idx * 0.06}s; background:${temple.gradient}; --temple-color:${temple.color};">
      <div class="temple-card-top">
        <div class="temple-emoji-badge">${temple.emoji}</div>
        <div class="temple-type-badge">${temple.type}</div>
      </div>
      <div class="temple-card-body">
        <h3 class="temple-name">${temple.name}</h3>
        <p class="temple-name-en">${temple.nameEn}</p>
        <div class="temple-location-row">
          <span class="temple-location-pin">📍</span>
          <span class="temple-state">${temple.location}</span>
        </div>
        <p class="temple-desc">${temple.desc}</p>
        <div class="temple-deity-badge">
          <span>🙏 ${temple.deity}</span>
        </div>
      </div>
      <div class="temple-card-footer">
        <span class="temple-map-cta">ℹ️ विवरण देखें</span>
        <span class="temple-arrow">→</span>
      </div>
    </div>
  `,
    )
    .join('');
}

function filterTemples(category, btn) {
  document
    .querySelectorAll('.temple-filter-btn')
    .forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('templesGrid');
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(12px)';
  setTimeout(() => {
    renderTemples(category);
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }, 200);
}

function openTempleModal(id) {
  const temple = templesData.find((t) => t.id === id);
  if (!temple) return;
  document.getElementById('templeModalHeader').innerHTML = `
    <div class="temple-modal-hero" style="--temple-color:${temple.color}">
      <div class="temple-modal-emoji">${temple.emoji}</div>
      <div>
        <h2>${temple.name}</h2>
        <p>${temple.nameEn}</p>
        <span class="temple-modal-type">${temple.type}</span>
      </div>
    </div>`;
  document.getElementById('templeModalInfo').innerHTML = `
    <div class="temple-info-grid">
      <div class="temple-info-card">
        <div class="temple-info-icon">📍</div>
        <div><div class="temple-info-label">स्थान</div><div class="temple-info-val">${temple.location}</div></div>
      </div>
      <div class="temple-info-card">
        <div class="temple-info-icon">🙏</div>
        <div><div class="temple-info-label">देवता</div><div class="temple-info-val">${temple.deity}</div></div>
      </div>
      <div class="temple-info-card">
        <div class="temple-info-icon">🕐</div>
        <div><div class="temple-info-label">दर्शन समय</div><div class="temple-info-val">${temple.timings}</div></div>
      </div>
      <div class="temple-info-card">
        <div class="temple-info-icon">📅</div>
        <div><div class="temple-info-label">सर्वश्रेष्ठ समय</div><div class="temple-info-val">${temple.bestTime}</div></div>
      </div>
    </div>
    <div class="temple-history">
      <div class="temple-history-title">📜 इतिहास</div>
      <p>${temple.history}</p>
    </div>
    <a class="temple-gmaps-btn" href="https://www.google.com/maps/search/${temple.mapQuery}" target="_blank" rel="noopener">
      🗺️ Google Maps पर खोलें
    </a>`;
  const modal = document.getElementById('templeMapModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeTempleModal(e) {
  if (e && e.target !== document.getElementById('templeMapModal')) return;
  const modal = document.getElementById('templeMapModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

for (const key in aartiData) {
  if (deities[key]) deities[key].aarti = aartiData[key];
}
for (const key in chalisaData) {
  if (deities[key]) deities[key].chalisa = chalisaData[key];
}
for (const key in mantraData) {
  if (deities[key]) deities[key].mantras = mantraData[key];
}

// ============ ACCESSIBILITY ============
let currentFontSizeMultiplier = 1;

function cycleFontSize() {
  const btn = document.querySelector('.font-size-btn');

  if (currentFontSizeMultiplier === 1) {
    currentFontSizeMultiplier = 1.2;
    if (btn) btn.classList.add('active-scaling');
  } else if (currentFontSizeMultiplier === 1.2) {
    currentFontSizeMultiplier = 1.4;
    if (btn) btn.classList.add('active-scaling');
  } else {
    currentFontSizeMultiplier = 1;
    if (btn) btn.classList.remove('active-scaling');
  }

  document.documentElement.style.setProperty(
    '--font-size-multiplier',
    currentFontSizeMultiplier,
  );
  localStorage.setItem(
    'bhaktiFontSizeMultiplier',
    currentFontSizeMultiplier.toString(),
  );
}

function scrollDirectTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollDirectBottom() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth',
  });
}

// ============ INIT ============
window.addEventListener('load', () => {
  // Load saved font size
  const savedMultiplier = localStorage.getItem('bhaktiFontSizeMultiplier');
  if (savedMultiplier) {
    currentFontSizeMultiplier = parseFloat(savedMultiplier);
    document.documentElement.style.setProperty(
      '--font-size-multiplier',
      currentFontSizeMultiplier,
    );

    // Set active state if scaled
    if (currentFontSizeMultiplier > 1) {
      const btn = document.querySelector('.font-size-btn');
      if (btn) btn.classList.add('active-scaling');
    }
  }

  createParticles();
  setupHomeSearch();
  buildHomeGrid();
  updateArrowVisibility();
  updateSiteTitleByLang();

  const htmlObserver = new MutationObserver(updateSiteTitleByLang);
  htmlObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });

  const navWrapper = document.querySelector('.nav-inner-wrapper');
  if (navWrapper) {
    navWrapper.addEventListener('scroll', updateArrowVisibility);
  }

  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1800);
});

window.addEventListener('popstate', () => {
  applyUrlState();
});

window.addEventListener('DOMContentLoaded', () => {
  applyUrlState();
  updateUrlState({
    typeId: activeHomeType,
    deityKey: activeDeityKey,
    tabId: activeDeityTab,
    replace: true,
  });
});
