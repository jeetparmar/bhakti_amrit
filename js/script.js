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
let activeKathaSlug = '';
const validDeityTabs = [
  'about',
  'aarti',
  'chalisa',
  'katha',
  'mantra',
  'temples',
];

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
  const raw = String(typeId || 'all');
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch (error) {
      return raw;
    }
  })();

  const normalized = decoded
    .replace(/\+/g, ' ')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (Object.prototype.hasOwnProperty.call(homeTypeToNavId, normalized)) {
    return normalized;
  }

  const aliasMap = {
    grah: 'ग्रह देव',
    'grah dev': 'ग्रह देव',
    'lok dev': 'लोक देव',
    lok: 'लोक देव',
    dev: 'देव',
    devi: 'देवी',
    avatar: 'अवतार',
    ग्रहदेव: 'ग्रह देव',
    लोकदेव: 'लोक देव',
  };

  return aliasMap[normalized.toLowerCase()] || 'all';
}

function getHomeSearchPlaceholder(typeId = activeHomeType) {
  const placeholders = {
    all: 'देव-देवी का नाम लिखें...',
    देव: 'देव का नाम लिखें...',
    देवी: 'देवी का नाम लिखें...',
    अवतार: 'अवतार का नाम लिखें...',
    'ग्रह देव': 'ग्रह देव का नाम लिखें...',
    'लोक देव': 'लोक देव का नाम लिखें...',
  };
  const safeType = getSafeHomeType(typeId);
  return placeholders[safeType] || placeholders.all;
}

function getSafeDeityTab(tabId = 'about') {
  return validDeityTabs.includes(tabId) ? tabId : 'about';
}

function getPathState() {
  const segments = window.location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  if (segments.length === 3) {
    const [deityKey, tabId, kathaSlug] = segments;
    const safeTab = getSafeDeityTab(tabId);
    if (deities[deityKey] && safeTab === 'katha') {
      return { deityKey, tabId: safeTab, kathaSlug };
    }
  }

  if (segments.length === 2) {
    const [deityKey, tabId] = segments;
    const safeTab = getSafeDeityTab(tabId);
    if (deities[deityKey] && safeTab === tabId) {
      return { deityKey, tabId: safeTab, kathaSlug: '' };
    }
  }

  return { deityKey: '', tabId: 'about', kathaSlug: '' };
}

function getKathaEntries(data = null, deityKey = '') {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items.filter(Boolean);
  if (Array.isArray(data)) return data.filter(Boolean);

  if (typeof data === 'object') {
    const entries = [];
    const marker = '<div class="title-line">॥ १६ सोमवार व्रत कथा ॥</div>';
    let primaryContent = data.content || '';

    if (
      deityKey === 'shiva' &&
      typeof primaryContent === 'string' &&
      primaryContent.includes(marker)
    ) {
      primaryContent = primaryContent
        .split(marker)[0]
        .replace(/<br\/><br\/>$/, '');
    }

    if (
      typeof primaryContent === 'string' &&
      primaryContent.trim().length > 0
    ) {
      entries.push({
        slug: data.slug || 'somvar-vrat-katha',
        title: data.title || '',
        content: primaryContent,
      });
    }

    if (Array.isArray(data.extraKathas)) {
      data.extraKathas.forEach((item) => {
        if (!item || typeof item !== 'object') return;
        if (typeof item.content !== 'string' || !item.content.trim().length)
          return;
        entries.push(item);
      });
    }

    if (entries.length) return entries;
  }

  if (typeof data === 'string' && data.trim().length > 0) {
    return [{ slug: 'katha', title: '', content: data }];
  }

  if (
    data &&
    typeof data === 'object' &&
    typeof data.content === 'string' &&
    data.content.trim().length > 0
  ) {
    return [{ slug: 'katha', title: data.title || '', content: data.content }];
  }

  return [];
}

function getSafeKathaSlug(deityKey = '', requestedSlug = '') {
  const entries = getKathaEntries(deities[deityKey]?.katha, deityKey);
  if (!entries.length) return '';
  const raw = String(requestedSlug || '').trim();
  const selected = entries.find((item) => item.slug === raw);
  return selected ? selected.slug : entries[0].slug;
}

function updateUrlState({
  typeId = activeHomeType,
  deityKey = '',
  tabId = activeDeityTab,
  kathaSlug = activeKathaSlug,
  replace = false,
} = {}) {
  const url = new URL(window.location.href);
  const safeType = getSafeHomeType(typeId);
  const safeDeity = deityKey && deities[deityKey] ? deityKey : '';
  const safeTab = getSafeDeityTab(tabId);
  const safeKathaSlug =
    safeDeity && safeTab === 'katha'
      ? getSafeKathaSlug(safeDeity, kathaSlug)
      : '';

  if (safeDeity) {
    url.pathname =
      safeTab === 'katha' && safeKathaSlug
        ? `/${encodeURIComponent(safeDeity)}/${encodeURIComponent(safeTab)}/${encodeURIComponent(safeKathaSlug)}`
        : `/${encodeURIComponent(safeDeity)}/${encodeURIComponent(safeTab)}`;
    url.search = '';
  } else {
    url.pathname = '/';
    url.search = '';
    if (safeType !== 'all') url.searchParams.set('type', safeType);
  }

  const method = replace ? 'replaceState' : 'pushState';
  history[method](
    {
      typeId: safeType,
      deityKey: safeDeity || null,
      tabId: safeDeity ? safeTab : null,
      kathaSlug: safeDeity && safeTab === 'katha' ? safeKathaSlug : null,
    },
    '',
    `${url.pathname}${url.search}`,
  );
}

function applyUrlState() {
  const params = new URLSearchParams(window.location.search);
  const pathState = getPathState();
  const pathDeity = pathState.deityKey;
  const pathTab = pathState.tabId;
  const pathKathaSlug = pathState.kathaSlug || '';
  const rawType = params.get('type') || 'all';
  const typeId = getSafeHomeType(rawType);
  const navId = getNavIdByHomeType(typeId);
  const queryDeity = params.get('deity') || '';
  const queryTab = getSafeDeityTab(params.get('tab') || 'about');
  const queryKathaSlug = params.get('katha') || '';
  const deityKey = pathDeity || queryDeity;
  const tabId = pathDeity ? pathTab : queryTab;
  const kathaSlug = pathDeity ? pathKathaSlug : queryKathaSlug;

  if (deityKey && deities[deityKey]) {
    activeHomeType = typeId;
    activeHomeNavId = navId;
    showDeityPage(deityKey, {
      skipUrl: true,
      initialTab: tabId,
      initialKathaSlug: kathaSlug,
    });
    updateUrlState({
      typeId: activeHomeType,
      deityKey,
      tabId,
      kathaSlug,
      replace: true,
    });
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

function hasLyricsContent(data) {
  if (Array.isArray(data?.items) && data.items.length > 0) return true;
  if (Array.isArray(data?.extraKathas) && data.extraKathas.length > 0)
    return true;
  if (typeof data === 'string') return data.trim().length > 0;
  if (data && typeof data.content === 'string') {
    return data.content.trim().length > 0;
  }
  return Boolean(data && Array.isArray(data.lines) && data.lines.length > 0);
}

function hasMantrasContent(data) {
  return Array.isArray(data) && data.length > 0;
}

function getAvailableDeityTabs(key) {
  const deity = deities[key];
  if (!deity) return ['about', 'temples'];

  const tabs = ['about'];
  if (hasLyricsContent(deity.aarti)) tabs.push('aarti');
  if (hasLyricsContent(deity.chalisa)) tabs.push('chalisa');
  if (hasLyricsContent(deity.katha)) tabs.push('katha');
  if (hasMantrasContent(deity.mantras)) tabs.push('mantra');
  tabs.push('temples');
  return tabs;
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
      <div class="deity-title-row">
        <span class="deity-name">${deity.name}</span>
        <span class="deity-type-badge">${deityType}</span>
      </div>
      <span class="deity-meta">${deity.desc}</span>
      ${(() => {
        const tags = [];
        if (hasLyricsContent(deity.aarti)) {
          tags.push(
            `<span class="tag tag-aarti" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'aarti' })">आरती</span>`,
          );
        }
        if (hasLyricsContent(deity.chalisa)) {
          tags.push(
            `<span class="tag tag-chalisa" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'chalisa' })">चालीसा</span>`,
          );
        }
        if (hasMantrasContent(deity.mantras)) {
          tags.push(
            `<span class="tag tag-mantra" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'mantra' })">मंत्र</span>`,
          );
        }
        if (hasLyricsContent(deity.katha)) {
          const kathaCount = getKathaEntries(deity.katha, key).length;
          const kathaLabel = kathaCount > 1 ? `कथा (${kathaCount})` : 'कथा';
          tags.push(
            `<span class="tag tag-katha" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'katha' })">${kathaLabel}</span>`,
          );
        }
        const templeCount = getRelatedTemples(key).length;
        if (templeCount > 0) {
          tags.push(
            `<span class="tag tag-temples" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'temples' })">मंदिर (${templeCount})</span>`,
          );
        }
        return tags.length
          ? `<div class="deity-tags">${tags.join('')}</div>`
          : '';
      })()}
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
  const searchInput = document.getElementById('homeSearchInput');
  if (searchInput) {
    searchInput.placeholder = getHomeSearchPlaceholder(safeType);
  }
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
  searchInput.placeholder = getHomeSearchPlaceholder(activeHomeType);
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

function updateTopHomeButton(pageId) {
  const homeBtn = document.getElementById('mainHomeButton');
  if (!homeBtn) return;

  if (pageId === 'deity') {
    homeBtn.innerHTML = '<span class="nav-icon-emoji">↩️</span> वापस जाएं';
    homeBtn.setAttribute(
      'onclick',
      'showHomeByType(activeHomeType, activeHomeNavId)',
    );
    return;
  }

  homeBtn.innerHTML = '<span class="nav-icon-emoji">🏠</span> मुख्य पृष्ठ';
  homeBtn.setAttribute('onclick', "showHomeByType('all', 'home')");
}

function updateDeityBackButton(pageId) {
  const deityBackButton = document.getElementById('deityBackButton');
  if (!deityBackButton) return;
  deityBackButton.style.display = pageId === 'deity' ? 'none' : '';
}

function showPage(pageId, navId) {
  document
    .querySelectorAll('.page')
    .forEach((p) => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');
  updateTopHomeButton(pageId);
  updateDeityBackButton(pageId);
  syncNav(navId || pageId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pageId === 'temples') buildTemplesPage();
  if (pageId === 'festivals') buildFestivalsPage();
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
  const availableTabs = getAvailableDeityTabs(key);
  activeDeityKey = key;
  activeDeityTab = getSafeDeityTab(options.initialTab || 'about');
  activeKathaSlug = getSafeKathaSlug(
    key,
    options.initialKathaSlug || activeKathaSlug,
  );
  if (!availableTabs.includes(activeDeityTab)) activeDeityTab = 'about';

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
  const tabButtons = [
    `<button class="tab-btn ${activeDeityTab === 'about' ? 'active' : ''}" onclick="showTab('about', this)">🚩 परिचय</button>`,
    hasLyricsContent(deity.aarti)
      ? `<button class="tab-btn ${activeDeityTab === 'aarti' ? 'active' : ''}" onclick="showTab('aarti', this)">🪔 आरती</button>`
      : '',
    hasLyricsContent(deity.chalisa)
      ? `<button class="tab-btn ${activeDeityTab === 'chalisa' ? 'active' : ''}" onclick="showTab('chalisa', this)">📖 चालीसा</button>`
      : '',
    hasLyricsContent(deity.katha)
      ? `<button class="tab-btn ${activeDeityTab === 'katha' ? 'active' : ''}" onclick="showTab('katha', this)">📚 कथा</button>`
      : '',
    hasMantrasContent(deity.mantras)
      ? `<button class="tab-btn ${activeDeityTab === 'mantra' ? 'active' : ''}" onclick="showTab('mantra', this)">🕉️ मंत्र</button>`
      : '',
    `<button class="tab-btn ${activeDeityTab === 'temples' ? 'active' : ''}" onclick="showTab('temples', this)">🛕 मंदिर</button>`,
  ].join('');
  tabs.innerHTML = `
  ${tabButtons}`;

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
  <div id="tab-katha" class="text-content ${activeDeityTab === 'katha' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="lyrics-box">${renderKatha(key, deity.katha)}</div>
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
      kathaSlug: activeDeityTab === 'katha' ? activeKathaSlug : '',
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
  if (!data) return 'जल्द ही आ रहा है...';

  const titleHtml = data.title
    ? `<div class="title-line">${data.title}</div>`
    : '';
  if (typeof data.content === 'string' && data.content.trim().length > 0) {
    return `${titleHtml}<div class="stanza">${data.content}</div>`;
  }
  if (!Array.isArray(data.lines) || !data.lines.length)
    return 'जल्द ही आ रहा है...';

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

function renderKatha(deityKey, data) {
  const entries = getKathaEntries(data, deityKey);
  if (!entries.length) return 'जल्द ही आ रहा है...';

  const safeSlug = getSafeKathaSlug(deityKey, activeKathaSlug);
  const selected = entries.find((item) => item.slug === safeSlug) || entries[0];
  activeKathaSlug = selected.slug;

  const navHtml =
    entries.length > 1
      ? `<div class="katha-list">${entries
          .map((item) => {
            const activeClass = item.slug === selected.slug ? ' active' : '';
            return `<button class="tab-btn${activeClass}" onclick="openKatha('${deityKey}', '${item.slug}')">${item.title || item.slug}</button>`;
          })
          .join('')}</div><br/>`
      : '';

  return `${navHtml}${renderLyrics(selected)}`;
}

function openKatha(deityKey, slug) {
  if (!deities[deityKey]) return;
  showDeityPage(deityKey, { initialTab: 'katha', initialKathaSlug: slug });
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
  const availableTabs = activeDeityKey
    ? getAvailableDeityTabs(activeDeityKey)
    : validDeityTabs;
  if (!availableTabs.includes(safeTab)) return;
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
  if (safeTab !== 'katha') activeKathaSlug = '';
  if (activeDeityKey) {
    updateUrlState({
      typeId: activeHomeType,
      deityKey: activeDeityKey,
      tabId: safeTab,
      kathaSlug: safeTab === 'katha' ? activeKathaSlug : '',
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
  balaji: ['हनुमान', 'बालाजी'],
  sai: ['साईं'],
  giriraj: ['गिरिराज', 'गोवर्धन'],
  mahavir: ['महावीर'],
  parshuram: ['परशुराम'],
  ramdev: ['रामदेव'],
  pitar: ['पितर'],
  baba_gangaram: ['गंगाराम'],
  vindhyeshwari: ['विंध्यवासिनी', 'विन्ध्येश्वरी'],
  mahalakshmi: ['लक्ष्मी'],
  gayatri: ['गायत्री'],
  mahakali: ['काली'],
  sheetla: ['शीतला'],
  radha: ['राधा', 'Radha'],
  tulsi: [],
  vaishno_devi: ['वैष्णो देवी', 'दुर्गा'],
  santoshi_maa: ['संतोषी'],
  annapurna: ['अन्नपूर्णा'],
  parvati: ['शिव'],
  baglamukhi: ['बगलामुखी'],
  ganga: ['गंगा'],
  narmada: ['नर्मदा'],
  sharda: ['सरस्वती', 'शारदा'],
  shakambhari: ['शाकम्भरी'],
  lalita_shakambhari: ['शाकम्भरी', 'ललिता'],
  rani_sati: ['राणी सती', 'रानी सती', 'माता रानी सती'],
};

const deityTempleIdMap = {
  annapurna: ['annapurna-temple'],
  gayatri: ['gayatri-dham-haridwar', 'panch-gayatri-dham'],
  narmada: ['omkareshwar', 'maheshwar', 'hoshangabad', 'mandla'],
  parshuram: ['parshuram-temple-bihar'],
  pretraj_sarkar: ['mehndipur-balaji'],
  radha: ['iskcon_london', 'iskcon_usa', 'radha_radhanath_sa', 'iskcon_australia'],
};

function getDeityKeyByTempleName(deityName = '') {
  const raw = String(deityName || '')
    .trim()
    .toLowerCase();
  if (!raw) return '';

  let fallbackKey = '';
  for (const [key, aliases] of Object.entries(deityTempleMap)) {
    for (const alias of aliases) {
      const normalizedAlias = String(alias || '')
        .trim()
        .toLowerCase();
      if (!normalizedAlias) continue;
      if (raw === normalizedAlias) return key;
      if (
        !fallbackKey &&
        (raw.includes(normalizedAlias) || normalizedAlias.includes(raw))
      ) {
        fallbackKey = key;
      }
    }
  }

  return fallbackKey;
}

function openTempleDeity(deityName, event) {
  if (event) event.stopPropagation();
  const deityKey = getDeityKeyByTempleName(deityName);
  if (!deityKey || !deities[deityKey]) return;
  closeTempleModal();
  showDeityPage(deityKey, { initialTab: 'temples' });
}

function openTempleDeityByTempleId(templeId, event) {
  if (event) event.stopPropagation();
  const temple = templesData.find((t) => t.id === templeId);
  if (!temple) return;
  openTempleDeity(temple.deity);
}

function getRelatedTemples(deityKey) {
  const deityNames = deityTempleMap[deityKey] || [];
  const deityTempleIds = deityTempleIdMap[deityKey] || [];
  return templesData.filter(
    (t) =>
      deityTempleIds.includes(t.id) ||
      deityNames.some((name) => t.deity.includes(name)),
  );
}

function renderDeityTemples(deityKey) {
  const related = getRelatedTemples(deityKey);

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
          <button class="temple-deity-link-btn" type="button" onclick="openTempleDeityByTempleId('${temple.id}', event)">🙏 ${temple.deity}</button>
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
    .querySelectorAll('#templeFilters .temple-filter-btn')
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
      <div class="temple-modal-hero-main">
        <div class="temple-modal-emoji">${temple.emoji}</div>
        <div>
          <h2>${temple.name}</h2>
          <p>${temple.nameEn}</p>
          <div class="temple-modal-meta">
            <span class="temple-modal-type">${temple.type}</span>
            <a class="temple-type-link" href="https://www.google.com/maps/search/${temple.mapQuery}" target="_blank" rel="noopener">🗺️ Google Maps</a>
          </div>
        </div>
      </div>
    </div>`;
  document.getElementById('templeModalInfo').innerHTML = `
    <div class="temple-info-grid">
      <div class="temple-info-card">
        <div class="temple-info-icon">📍</div>
        <div>
          <div class="temple-info-label">स्थान</div>
          <div class="temple-info-val">${temple.location}</div>
        </div>
      </div>
      <div class="temple-info-card">
        <div class="temple-info-icon">🙏</div>
        <div><div class="temple-info-label">देवता</div><div class="temple-info-val"><button class="temple-info-deity-link" type="button" onclick="openTempleDeity('${temple.deity}', event)">${temple.deity}</button></div></div>
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
    </div>`;
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

// ============ FESTIVALS PAGE ============
const festivalCategories = [
  { id: 'all', label: '✨ सभी' },
  { id: 'Major', label: '🏵️ प्रमुख पर्व' },
  { id: 'Vaishnava', label: '🦚 वैष्णव' },
  { id: 'Shaiva', label: '🔱 शैव' },
  { id: 'Ganapatya', label: '🐘 गणपति' },
  { id: 'Family', label: '👪 परिवार' },
  { id: 'Seasonal', label: '🌾 मौसमी' },
  { id: 'Surya', label: '☀️ सूर्य उपासना' },
];
let activeFestivalFilter = 'all';

function buildFestivalsPage() {
  const filtersEl = document.getElementById('festivalFilters');
  if (!filtersEl || filtersEl.innerHTML !== '') return;

  filtersEl.innerHTML = festivalCategories
    .map(
      (cat) => `
    <button
      class="temple-filter-btn ${cat.id === 'all' ? 'active' : ''}"
      onclick="filterFestivals('${cat.id}', this)"
      data-category="${cat.id}"
    >${cat.label}</button>
  `,
    )
    .join('');

  renderFestivals('all');
}

function renderFestivals(filter) {
  activeFestivalFilter = filter;
  const grid = document.getElementById('festivalsGrid');
  if (!grid) return;

  const filtered =
    filter === 'all'
      ? festivalsData
      : festivalsData.filter((festival) => festival.type === filter);

  grid.innerHTML = filtered
    .map(
      (festival, idx) => `
    <div class="temple-card" onclick="openFestivalModal('${festival.id}')" style="animation-delay:${idx * 0.06}s; background:${festival.gradient}; --temple-color:${festival.color};">
      <div class="temple-card-top">
        <div class="temple-emoji-badge">${festival.emoji}</div>
        <div class="temple-type-badge">${festival.type}</div>
      </div>
      <div class="temple-card-body">
        <h3 class="temple-name">${festival.name}</h3>
        <p class="temple-name-en">${festival.nameEn}</p>
        <div class="temple-location-row">
          <span class="temple-location-pin">📅</span>
          <span class="temple-state">${festival.month}</span>
        </div>
        <p class="temple-desc">${festival.desc}</p>
        <div class="temple-deity-badge">
          <span>🌍 ${festival.regions}</span>
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

function filterFestivals(category, btn) {
  document
    .querySelectorAll('#festivalFilters .temple-filter-btn')
    .forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('festivalsGrid');
  if (!grid) return;
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(12px)';
  setTimeout(() => {
    renderFestivals(category);
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }, 200);
}

function openFestivalModal(id) {
  const festival = festivalsData.find((f) => f.id === id);
  if (!festival) return;

  document.getElementById('festivalModalHeader').innerHTML = `
    <div class="temple-modal-hero" style="--temple-color:${festival.color}">
      <div class="temple-modal-hero-main">
        <div class="temple-modal-emoji">${festival.emoji}</div>
        <div>
          <h2>${festival.name}</h2>
          <p>${festival.nameEn}</p>
          <div class="temple-modal-meta">
            <span class="temple-modal-type">${festival.type}</span>
            <span class="temple-modal-type">📅 ${festival.month}</span>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('festivalModalInfo').innerHTML = `
    <div class="temple-info-grid">
      <div class="temple-info-card">
        <div class="temple-info-icon">📅</div>
        <div>
          <div class="temple-info-label">समय</div>
          <div class="temple-info-val">${festival.month}</div>
        </div>
      </div>
      <div class="temple-info-card">
        <div class="temple-info-icon">🏵️</div>
        <div>
          <div class="temple-info-label">पर्व प्रकार</div>
          <div class="temple-info-val">${festival.type}</div>
        </div>
      </div>
      <div class="temple-info-card">
        <div class="temple-info-icon">🌍</div>
        <div>
          <div class="temple-info-label">मुख्य क्षेत्र</div>
          <div class="temple-info-val">${festival.regions}</div>
        </div>
      </div>
    </div>
    <div class="temple-history">
      <div class="temple-history-title">✨ महत्व</div>
      <p>${festival.significance}</p>
    </div>
    <div class="temple-history">
      <div class="temple-history-title">🪔 प्रमुख अनुष्ठान</div>
      <p>${festival.rituals}</p>
    </div>`;

  const modal = document.getElementById('festivalModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeFestivalModal(e) {
  if (e && e.target !== document.getElementById('festivalModal')) return;
  const modal = document.getElementById('festivalModal');
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
for (const key in kathaData) {
  if (deities[key]) deities[key].katha = kathaData[key];
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
let isLoaderHidden = false;

function hideLoader() {
  if (isLoaderHidden) return;
  const loader = document.getElementById('loader');
  if (!loader) return;
  loader.classList.add('hidden');
  isLoaderHidden = true;
}

window.addEventListener('load', () => {
  // Ensure the app is never stuck on the splash if any init task fails.
  setTimeout(hideLoader, 1800);

  try {
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
  } catch (error) {
    console.error('App initialization failed:', error);
    hideLoader();
  }
});

// Failsafe: hide splash even when `load` is delayed on slow/blocked networks.
window.setTimeout(hideLoader, 5000);

window.addEventListener('popstate', () => {
  applyUrlState();
});

window.addEventListener('DOMContentLoaded', () => {
  applyUrlState();
  updateUrlState({
    typeId: activeHomeType,
    deityKey: activeDeityKey,
    tabId: activeDeityTab,
    kathaSlug: activeKathaSlug,
    replace: true,
  });
});
