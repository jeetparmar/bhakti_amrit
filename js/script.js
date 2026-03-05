// ============ PARTICLES ============
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const symbols = ['🕉️', '✨', '🌸', '⭐', '🪔', '🏹', '🌺', '🌼'];
  const particleCount = window.matchMedia('(max-width: 768px)').matches ? 8 : 15;
  for (let i = 0; i < particleCount; i++) {
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
  tirupati_balaji: 'देव',
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
let deityReturnHomeType = 'all';
let deityReturnHomeNavId = 'home';
let activeHomeSearchQuery = '';
let activeDeityKey = '';
let activeDeityTab = 'about';
let activeKathaSlug = '';
let activeExtraIndex = 0;
let activeTempleDetailId = '';
let activeFestivalDetailId = '';
const HOME_BATCH_SIZE = 60;
const HOME_VIEW_MODE_STORAGE_KEY = 'bhaktiHomeViewMode';
let homeFilteredEntries = [];
let renderedHomeCount = 0;
let homeRenderCycleId = 0;
let homeRenderTimer = null;
let activeHomeViewMode = 'card';
const homeTempleCountCache = new Map();
const validDeityTabs = [
  'about',
  'aarti',
  'chalisa',
  'katha',
  'mantra',
  'extra',
  'temples',
];

function normalizeAlias(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addAlias(targetMap, alias, deityKey) {
  const normalized = normalizeAlias(alias);
  if (!normalized || !deityKey) return;
  if (!targetMap.has(normalized)) targetMap.set(normalized, deityKey);
  const compact = normalized.replace(/\s+/g, '');
  if (compact && !targetMap.has(compact)) targetMap.set(compact, deityKey);
}

function buildDeityAliasMap() {
  const aliasMap = new Map();

  Object.entries(deities).forEach(([key, deity]) => {
    addAlias(aliasMap, key, key);
    addAlias(aliasMap, key.replace(/_/g, ' '), key);
    addAlias(aliasMap, key.replace(/_/g, ''), key);

    if (deity?.english) {
      addAlias(aliasMap, deity.english, key);
      addAlias(
        aliasMap,
        deity.english.replace(/\b(shri|shree|lord)\b/gi, '').trim(),
        key,
      );
    }

    if (deity?.name) {
      addAlias(aliasMap, deity.name, key);
      addAlias(aliasMap, deity.name.replace(/^श्री\s+/, ''), key);
    }

    if (deity?.desc) {
      deity.desc
        .split(/[,,;|]/)
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => addAlias(aliasMap, part, key));
    }
  });

  // Load configurable aliases from `js/deity-aliases.js` when present.
  const configuredAliases =
    typeof window !== 'undefined' && window.deityAliases
      ? window.deityAliases
      : {};

  Object.entries(configuredAliases).forEach(([key, aliases]) => {
    if (!deities[key] || !Array.isArray(aliases)) return;
    aliases.forEach((alias) => addAlias(aliasMap, alias, key));
  });

  return aliasMap;
}

const deityAliasMap = buildDeityAliasMap();

function resolveDeityKey(rawDeityKey = '') {
  const raw = String(rawDeityKey || '').trim();
  if (!raw) return '';
  if (deities[raw]) return raw;
  const normalized = normalizeAlias(raw);
  if (!normalized) return '';
  return (
    deityAliasMap.get(normalized) ||
    deityAliasMap.get(normalized.replace(/\s+/g, '')) ||
    ''
  );
}

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

function resolveDeityTabFromPathSegment(deityKey = '', tabSegment = 'about') {
  const normalized = String(tabSegment || '')
    .trim()
    .toLowerCase();
  if (deityKey === 'ram' && (normalized === 'stuti' || normalized === 'extra'))
    return 'extra';
  return getSafeDeityTab(normalized);
}

function isValidDeityTabPathSegment(deityKey = '', tabSegment = '') {
  const normalized = String(tabSegment || '')
    .trim()
    .toLowerCase();
  if (!normalized) return false;
  if (deityKey === 'ram' && (normalized === 'stuti' || normalized === 'extra'))
    return true;
  return validDeityTabs.includes(normalized);
}

function getDeityTabPathSegment(deityKey = '', tabId = 'about') {
  const safeTab = getSafeDeityTab(tabId);
  if (deityKey === 'ram' && safeTab === 'extra') return 'stuti';
  return safeTab;
}

function getPathState() {
  const segments = window.location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  if (segments.length === 2 && segments[0] === 'temples') {
    return {
      pageId: 'temple-detail',
      templeId: segments[1],
      deityKey: '',
      tabId: 'about',
      kathaSlug: '',
    };
  }

  if (segments.length === 2 && segments[0] === 'festivals') {
    return {
      pageId: 'festival-detail',
      festivalId: segments[1],
      templeId: '',
      deityKey: '',
      tabId: 'about',
      kathaSlug: '',
    };
  }

  if (segments.length === 1 && segments[0] === 'temples') {
    return {
      pageId: 'temples',
      templeId: '',
      deityKey: '',
      tabId: 'about',
      kathaSlug: '',
    };
  }

  if (segments.length === 1 && segments[0] === 'festivals') {
    return {
      pageId: 'festivals',
      festivalId: '',
      templeId: '',
      deityKey: '',
      tabId: 'about',
      kathaSlug: '',
    };
  }

  if (segments.length === 3) {
    const [rawDeityKey, tabId, kathaSlug] = segments;
    const deityKey = resolveDeityKey(rawDeityKey);
    const safeTab = resolveDeityTabFromPathSegment(deityKey, tabId);
    if (
      deities[deityKey] &&
      isValidDeityTabPathSegment(deityKey, tabId) &&
      safeTab === 'katha'
    ) {
      return { pageId: '', templeId: '', deityKey, tabId: safeTab, kathaSlug };
    }
  }

  if (segments.length === 2) {
    const [rawDeityKey, tabId] = segments;
    const deityKey = resolveDeityKey(rawDeityKey);
    const safeTab = resolveDeityTabFromPathSegment(deityKey, tabId);
    if (deities[deityKey] && isValidDeityTabPathSegment(deityKey, tabId)) {
      return {
        pageId: '',
        templeId: '',
        deityKey,
        tabId: safeTab,
        kathaSlug: '',
      };
    }
  }

  return {
    pageId: '',
    festivalId: '',
    templeId: '',
    deityKey: '',
    tabId: 'about',
    kathaSlug: '',
  };
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
  pageId = '',
  templeId = activeTempleDetailId,
  festivalId = activeFestivalDetailId,
  replace = false,
} = {}) {
  const url = new URL(window.location.href);
  const safeType = getSafeHomeType(typeId);
  const resolvedDeity = resolveDeityKey(deityKey);
  const safeDeity =
    resolvedDeity && deities[resolvedDeity] ? resolvedDeity : '';
  const safeTab = getSafeDeityTab(tabId);
  const safeKathaSlug =
    safeDeity && safeTab === 'katha'
      ? getSafeKathaSlug(safeDeity, kathaSlug)
      : '';
  const safeTabPath = getDeityTabPathSegment(safeDeity, safeTab);

  if (safeDeity) {
    url.pathname =
      safeTab === 'katha' && safeKathaSlug
        ? `/${encodeURIComponent(safeDeity)}/${encodeURIComponent(safeTabPath)}/${encodeURIComponent(safeKathaSlug)}`
        : `/${encodeURIComponent(safeDeity)}/${encodeURIComponent(safeTabPath)}`;
    url.search = '';
  } else if (pageId === 'temple-detail') {
    const safeTempleId = templesData.some((t) => t.id === templeId)
      ? templeId
      : '';
    url.pathname = safeTempleId
      ? `/temples/${encodeURIComponent(safeTempleId)}`
      : '/temples';
    url.search = '';
  } else if (pageId === 'festival-detail') {
    const safeFestivalId = festivalsData.some((f) => f.id === festivalId)
      ? festivalId
      : '';
    url.pathname = safeFestivalId
      ? `/festivals/${encodeURIComponent(safeFestivalId)}`
      : '/festivals';
    url.search = '';
  } else if (pageId === 'temples') {
    url.pathname = '/temples';
    url.search = '';
  } else if (pageId === 'festivals') {
    url.pathname = '/festivals';
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
  const pathPageId = pathState.pageId || '';
  const pathFestivalId = pathState.festivalId || '';
  const pathTempleId = pathState.templeId || '';
  const pathDeity = pathState.deityKey;
  const pathTab = pathState.tabId;
  const pathKathaSlug = pathState.kathaSlug || '';
  const rawType = params.get('type') || 'all';
  const typeId = getSafeHomeType(rawType);
  const navId = getNavIdByHomeType(typeId);
  const queryDeity = params.get('deity') || '';
  const resolvedQueryDeity = resolveDeityKey(queryDeity);
  const queryTab = resolveDeityTabFromPathSegment(
    resolvedQueryDeity,
    params.get('tab') || 'about',
  );
  const queryKathaSlug = params.get('katha') || '';
  const deityKey = pathDeity || resolveDeityKey(queryDeity);
  const tabId = pathDeity ? pathTab : queryTab;
  const kathaSlug = pathDeity ? pathKathaSlug : queryKathaSlug;

  if (pathPageId === 'temple-detail') {
    showTempleDetailsPage(pathTempleId, { skipUrl: true });
    return;
  }

  if (pathPageId === 'festival-detail') {
    showFestivalDetailsPage(pathFestivalId, { skipUrl: true });
    return;
  }

  if (pathPageId === 'temples') {
    showTemplesMenuPage({ skipUrl: true });
    return;
  }

  if (pathPageId === 'festivals') {
    showFestivalsMenuPage({ skipUrl: true });
    return;
  }

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

function getSafeHomeViewMode(mode = 'card') {
  if (mode === 'list') return 'table';
  return mode === 'table' ? 'table' : 'card';
}

function loadHomeViewMode() {
  try {
    const savedMode = localStorage.getItem(HOME_VIEW_MODE_STORAGE_KEY);
    activeHomeViewMode = getSafeHomeViewMode(savedMode || 'card');
  } catch (error) {
    activeHomeViewMode = 'card';
  }
}

function applyHomeViewMode(mode = activeHomeViewMode) {
  const grid = document.getElementById('homeGrid');
  if (!grid) return;
  const safeMode = getSafeHomeViewMode(mode);
  grid.classList.toggle('table-view', safeMode === 'table');
}

function syncHomeViewToggleButtons() {
  const cardBtn = document.getElementById('homeViewCardBtn');
  const tableBtn = document.getElementById('homeViewTableBtn');
  if (!cardBtn || !tableBtn) return;

  const isCard = activeHomeViewMode !== 'table';
  cardBtn.classList.toggle('active', isCard);
  tableBtn.classList.toggle('active', !isCard);
  cardBtn.setAttribute('aria-pressed', isCard ? 'true' : 'false');
  tableBtn.setAttribute('aria-pressed', isCard ? 'false' : 'true');
}

function setHomeViewMode(mode = 'card') {
  const safeMode = getSafeHomeViewMode(mode);
  if (safeMode === activeHomeViewMode) {
    applyHomeViewMode(safeMode);
    syncHomeViewToggleButtons();
    return;
  }

  activeHomeViewMode = safeMode;
  try {
    localStorage.setItem(HOME_VIEW_MODE_STORAGE_KEY, safeMode);
  } catch (error) {
    // Ignore storage errors and keep in-memory preference.
  }

  applyHomeViewMode(safeMode);
  syncHomeViewToggleButtons();
  renderHomeGrid(activeHomeType, activeHomeSearchQuery);
}

function setupHomeViewToggle() {
  const cardBtn = document.getElementById('homeViewCardBtn');
  const tableBtn = document.getElementById('homeViewTableBtn');
  if (!cardBtn || !tableBtn) return;

  cardBtn.addEventListener('click', () => setHomeViewMode('card'));
  tableBtn.addEventListener('click', () => setHomeViewMode('table'));
  syncHomeViewToggleButtons();
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

function getExtraContentData(deityKey = '') {
  if (!deityKey) return null;
  const store =
    typeof extraContent !== 'undefined'
      ? extraContent
      : typeof window !== 'undefined'
        ? window.extraContent
        : null;
  const data = store?.[deityKey];
  return data && typeof data === 'object' ? data : null;
}

function getExtraEntries(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (Array.isArray(data.items)) return data.items.filter(Boolean);
  return [data];
}

function getExtraEntryLabel(entry, idx = 0) {
  if (typeof entry?.tag === 'string' && entry.tag.trim().length > 0) {
    return entry.tag;
  }
  if (typeof entry?.title === 'string' && entry.title.trim().length > 0) {
    return entry.title;
  }
  return `अतिरिक्त ${idx + 1}`;
}

function getExtraTabLabel(data) {
  const entries = getExtraEntries(data);
  if (!entries.length) return 'अतिरिक्त';
  if (entries.length === 1) return getExtraEntryLabel(entries[0], 0);
  if (typeof data?.tag === 'string' && data.tag.trim().length > 0) {
    return data.tag;
  }
  return 'अतिरिक्त';
}

function getSafeExtraIndex(data, requestedIndex = 0) {
  const entries = getExtraEntries(data);
  if (!entries.length) return 0;
  const parsed = Number.parseInt(requestedIndex, 10);
  const safeIndex = Number.isNaN(parsed) ? 0 : parsed;
  return Math.max(0, Math.min(safeIndex, entries.length - 1));
}

function getAvailableDeityTabs(key) {
  const deity = deities[key];
  if (!deity) return ['about', 'temples'];

  const extraData = getExtraContentData(key);
  const tabs = ['about'];
  if (hasLyricsContent(deity.aarti)) tabs.push('aarti');
  if (hasLyricsContent(deity.chalisa)) tabs.push('chalisa');
  if (hasLyricsContent(deity.katha)) tabs.push('katha');
  if (hasMantrasContent(deity.mantras)) tabs.push('mantra');
  if (hasLyricsContent(extraData)) tabs.push('extra');
  tabs.push('temples');
  return tabs;
}

function getFilteredHomeDeities(filter = activeHomeType, searchQuery = '') {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return Object.entries(deities).filter(
    ([key, deity]) =>
      (filter === 'all' ? true : getDeityType(key) === filter) &&
      (!normalizedQuery ||
        `${key} ${deity.name} ${deity.desc} ${getDeityType(key)}`
          .toLowerCase()
          .includes(normalizedQuery)),
  );
}

function getHomeTagsHtml(key, deity) {
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
  const extraData = getExtraContentData(key);
  if (hasLyricsContent(extraData)) {
    const extraEntries = getExtraEntries(extraData);
    extraEntries.forEach((entry, idx) => {
      const extraTag = escapeHtml(getExtraEntryLabel(entry, idx));
      tags.push(
        `<span class="tag tag-extra" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'extra', initialExtraIndex: ${idx} })">${extraTag}</span>`,
      );
    });
  }
  const templeCount = getHomeTempleCount(key);
  if (templeCount > 0) {
    tags.push(
      `<span class="tag tag-temples" onclick="event.stopPropagation(); showDeityPage('${key}', { initialTab: 'temples' })">मंदिर (${templeCount})</span>`,
    );
  }
  return tags.length ? `<div class="deity-tags">${tags.join('')}</div>` : '';
}

function getHomeCardHtml(key, deity, index) {
  const deityType = getDeityType(key);
  const imgSrc = getValidDeityImage(deity.img);
  const isPriorityImage = index < 6;
  const safeName = escapeHtml(deity?.name || 'श्री देव');
  const safeDesc = escapeHtml(deity?.desc || 'भक्ति सामग्री उपलब्ध');
  const safeEmoji = escapeHtml(deity?.emoji || '🪔');
  const imgHtml = imgSrc
    ? `<img class="deity-img" src="${imgSrc}" alt="${safeName}" loading="${isPriorityImage ? 'eager' : 'lazy'}" fetchpriority="${isPriorityImage ? 'high' : 'low'}" width="240" height="240" decoding="async" onerror="this.parentNode.querySelector('.deity-img-fallback').style.display='flex'; this.style.display='none';">
     <div class="deity-img-fallback" style="display:none">${safeEmoji}</div>`
    : `<div class="deity-img-fallback">${safeEmoji}</div>`;
  return `
    <div class="deity-card" onclick="showDeityPage('${key}')">
    ${imgHtml}
    <div class="deity-info">
      <div class="deity-title-row">
        <span class="deity-name">${safeName}</span>
        <span class="deity-type-badge">${deityType}</span>
      </div>
      <span class="deity-meta">${safeDesc}</span>
      ${getHomeTagsHtml(key, deity)}
    </div>
    </div>`;
}

function getHomeTableHtml(key, deity, index) {
  const deityType = getDeityType(key);
  const imgSrc = getValidDeityImage(deity.img);
  const isPriorityImage = index < 12;
  const safeName = escapeHtml(deity?.name || 'श्री देव');
  const safeDesc = escapeHtml(deity?.desc || 'भक्ति सामग्री उपलब्ध');
  const safeEmoji = escapeHtml(deity?.emoji || '🪔');
  const imgHtml = imgSrc
    ? `<img class="deity-img" src="${imgSrc}" alt="${safeName}" loading="${isPriorityImage ? 'eager' : 'lazy'}" fetchpriority="${isPriorityImage ? 'high' : 'low'}" width="240" height="240" decoding="async" onerror="this.parentNode.querySelector('.deity-img-fallback').style.display='flex'; this.style.display='none';">
     <div class="deity-img-fallback" style="display:none">${safeEmoji}</div>`
    : `<div class="deity-img-fallback">${safeEmoji}</div>`;

  return `
    <div class="deity-card deity-card-table" onclick="showDeityPage('${key}')">
    ${imgHtml}
    <div class="deity-info">
      <div class="deity-title-row">
        <span class="deity-name">${safeName}</span>
        <span class="deity-type-badge">${deityType}</span>
      </div>
      <span class="deity-meta">${safeDesc}</span>
      ${getHomeTagsHtml(key, deity)}
    </div>
    </div>`;
}

function getHomeTempleCount(deityKey) {
  if (homeTempleCountCache.has(deityKey)) {
    return homeTempleCountCache.get(deityKey);
  }
  const count = getRelatedTemples(deityKey).length;
  homeTempleCountCache.set(deityKey, count);
  return count;
}

function renderHomeGrid(
  filter = activeHomeType,
  searchQuery = activeHomeSearchQuery,
  options = {},
) {
  const { reset = true } = options;
  const grid = document.getElementById('homeGrid');
  if (!grid) return;

  if (reset) {
    homeRenderCycleId += 1;
    homeFilteredEntries = getFilteredHomeDeities(filter, searchQuery);
    renderedHomeCount = 0;
    grid.innerHTML = '';

    if (!homeFilteredEntries.length) {
      const normalizedQuery = searchQuery.trim().toLowerCase();
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
  }

  applyHomeViewMode(activeHomeViewMode);
  const nextBatch = homeFilteredEntries.slice(
    renderedHomeCount,
    renderedHomeCount + HOME_BATCH_SIZE,
  );
  if (!nextBatch.length) return;

  const html = nextBatch
    .map(([key, deity], idx) =>
      activeHomeViewMode === 'table'
        ? getHomeTableHtml(key, deity, renderedHomeCount + idx)
        : getHomeCardHtml(key, deity, renderedHomeCount + idx),
    )
    .join('');
  grid.insertAdjacentHTML('beforeend', html);
  renderedHomeCount += nextBatch.length;

  if (reset) fillHomeViewportIfNeeded();
}

function fillHomeViewportIfNeeded() {
  let guard = 0;
  while (
    renderedHomeCount < homeFilteredEntries.length &&
    document.documentElement.scrollHeight <= window.innerHeight + 120 &&
    guard < 8
  ) {
    renderHomeGrid(activeHomeType, activeHomeSearchQuery, { reset: false });
    guard += 1;
  }
}

function maybeLoadMoreHomeOnScroll() {
  const homePage = document.getElementById('page-home');
  if (!homePage || !homePage.classList.contains('active')) return;
  if (homeRenderTimer) return;
  if (renderedHomeCount >= homeFilteredEntries.length) return;
  const nearBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 260;
  if (!nearBottom) return;
  renderHomeGrid(activeHomeType, activeHomeSearchQuery, { reset: false });
}

function showHomeByType(typeId = 'all', navId = 'home', options = {}) {
  const safeType = getSafeHomeType(typeId);
  const safeNavId = navId || getNavIdByHomeType(safeType);
  activeHomeType = safeType;
  activeHomeNavId = safeNavId;
  activeDeityKey = '';
  activeDeityTab = 'about';
  activeTempleDetailId = '';
  activeFestivalDetailId = '';
  showPage('home', safeNavId);
  const grid = document.getElementById('homeGrid');
  const searchInput = document.getElementById('homeSearchInput');
  if (searchInput) {
    searchInput.placeholder = getHomeSearchPlaceholder(safeType);
  }
  if (!grid) return;
  applyHomeViewMode(activeHomeViewMode);
  if (homeRenderTimer) {
    clearTimeout(homeRenderTimer);
    homeRenderTimer = null;
  }
  const cycleId = homeRenderCycleId + 1;
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(12px)';
  homeRenderTimer = setTimeout(() => {
    homeRenderTimer = null;
    if (cycleId < homeRenderCycleId) return;
    renderHomeGrid(safeType, activeHomeSearchQuery);
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }, 40);

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
    if (homeRenderTimer) {
      clearTimeout(homeRenderTimer);
      homeRenderTimer = null;
    }
    activeHomeSearchQuery = event.target.value;
    renderHomeGrid(activeHomeType, activeHomeSearchQuery);
    syncClearButton();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (homeRenderTimer) {
        clearTimeout(homeRenderTimer);
        homeRenderTimer = null;
      }
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
      'showHomeByType(deityReturnHomeType, deityReturnHomeNavId)',
    );
    return;
  }

  if (pageId === 'temple-detail') {
    homeBtn.innerHTML = '<span class="nav-icon-emoji">↩️</span> वापस जाएं';
    homeBtn.setAttribute('onclick', 'showTemplesMenuPage()');
    return;
  }

  if (pageId === 'festival-detail') {
    homeBtn.innerHTML = '<span class="nav-icon-emoji">↩️</span> वापस जाएं';
    homeBtn.setAttribute('onclick', 'showFestivalsMenuPage()');
    return;
  }

  homeBtn.innerHTML = '<span class="nav-icon-emoji">🏠</span> मुख्य पृष्ठ';
  homeBtn.setAttribute('onclick', "showHomeByType('all', 'home')");
}

function updateDeityBackButton(pageId) {
  const deityBackButton = document.getElementById('deityBackButton');
  if (!deityBackButton) return;
  deityBackButton.setAttribute(
    'onclick',
    'showHomeByType(deityReturnHomeType, deityReturnHomeNavId)',
  );
  deityBackButton.style.display = pageId === 'deity' ? 'none' : '';
}

let defaultSiteHeaderMarkup = '';
let defaultSiteHeaderHeight = 0;

function syncDefaultSiteHeaderHeight() {
  const siteHeaderMount = document.getElementById('siteHeaderMount');
  if (!siteHeaderMount) return;
  let measured = 0;
  const siteHeader = siteHeaderMount.querySelector('header');
  if (siteHeader) {
    measured = Math.ceil(siteHeader.getBoundingClientRect().height);
  } else if (defaultSiteHeaderMarkup) {
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:absolute;left:-99999px;top:0;visibility:hidden;width:100%;pointer-events:none;';
    probe.innerHTML = defaultSiteHeaderMarkup;
    document.body.appendChild(probe);
    const probeHeader = probe.querySelector('header');
    if (probeHeader) {
      measured = Math.ceil(probeHeader.getBoundingClientRect().height);
    }
    document.body.removeChild(probe);
  }

  if (!measured) return;
  defaultSiteHeaderHeight = measured;
  document.documentElement.style.setProperty(
    '--site-header-height',
    `${defaultSiteHeaderHeight}px`,
  );
}

function syncSiteHeaderByPage(pageId) {
  const siteHeaderMount = document.getElementById('siteHeaderMount');
  const deityHeader = document.getElementById('deityHeader');
  if (!siteHeaderMount) return;

  if (!defaultSiteHeaderMarkup) {
    defaultSiteHeaderMarkup = siteHeaderMount.innerHTML;
    syncDefaultSiteHeaderHeight();
  }

  const useDeityHeader =
    pageId === 'deity' &&
    deityHeader &&
    deityHeader.innerHTML &&
    deityHeader.innerHTML.trim().length > 0;

  if (useDeityHeader) {
    siteHeaderMount.innerHTML = `<div class="content-header content-header-site">${deityHeader.innerHTML}
      <div class="header-divider">
        <div class="divider-line"></div>
        <div class="divider-dot"></div>
        <div class="divider-dot" style="background: var(--gold)"></div>
        <div class="divider-dot"></div>
        <div class="divider-line"></div>
      </div>
    </div>`;
    deityHeader.style.display = 'none';
    return;
  }

  if (siteHeaderMount.innerHTML !== defaultSiteHeaderMarkup) {
    siteHeaderMount.innerHTML = defaultSiteHeaderMarkup;
    syncDefaultSiteHeaderHeight();
  }
  if (deityHeader) deityHeader.style.display = '';
}

function showPage(pageId, navId) {
  if (pageId !== 'deity') closeReadingMode();
  document
    .querySelectorAll('.page')
    .forEach((p) => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');
  updateTopHomeButton(pageId);
  updateDeityBackButton(pageId);
  syncSiteHeaderByPage(pageId);
  syncNav(navId || pageId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pageId === 'temples') buildTemplesPage();
  if (pageId === 'festivals') buildFestivalsPage();
}

function showTemplesMenuPage(options = {}) {
  const { skipUrl = false } = options;
  activeDeityKey = '';
  activeDeityTab = 'about';
  activeTempleDetailId = '';
  activeFestivalDetailId = '';
  showPage('temples', 'temples');
  if (!skipUrl) {
    updateUrlState({
      typeId: activeHomeType,
      deityKey: '',
      pageId: 'temples',
    });
  }
}

function showFestivalsMenuPage(options = {}) {
  const { skipUrl = false } = options;
  activeDeityKey = '';
  activeDeityTab = 'about';
  activeTempleDetailId = '';
  activeFestivalDetailId = '';
  showPage('festivals', 'festivals');
  if (!skipUrl) {
    updateUrlState({
      typeId: activeHomeType,
      deityKey: '',
      pageId: 'festivals',
    });
  }
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
  const resolvedKey = resolveDeityKey(key);
  const deity = deities[resolvedKey];
  if (!deity) return;
  const extraData = getExtraContentData(resolvedKey);
  const extraTag = escapeHtml(getExtraTabLabel(extraData));

  // Preserve where the user came from for back navigation.
  deityReturnHomeType = getSafeHomeType(activeHomeType);
  deityReturnHomeNavId =
    activeHomeNavId || getNavIdByHomeType(deityReturnHomeType);

  // If a deity is opened directly from "मुख्य पृष्ठ", highlight its type menu.
  if (activeHomeNavId === 'home' || activeHomeType === 'all') {
    const inferredType = getDeityType(resolvedKey);
    activeHomeType = inferredType;
    activeHomeNavId = getNavIdByHomeType(inferredType);
  }

  const availableTabs = getAvailableDeityTabs(resolvedKey);
  activeDeityKey = resolvedKey;
  activeDeityTab = getSafeDeityTab(options.initialTab || 'about');
  activeTempleDetailId = '';
  activeFestivalDetailId = '';
  activeKathaSlug = getSafeKathaSlug(
    resolvedKey,
    options.initialKathaSlug || activeKathaSlug,
  );
  activeExtraIndex = getSafeExtraIndex(
    extraData,
    options.initialExtraIndex ?? activeExtraIndex,
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
    hasLyricsContent(extraData)
      ? `<button class="tab-btn ${activeDeityTab === 'extra' ? 'active' : ''}" onclick="showTab('extra', this)">✨ ${extraTag}</button>`
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
      <div class="deity-tab-content">
        <div class="lyrics-box about-content about-content-merged">
          ${renderAbout(aboutData[resolvedKey])}
        </div>
      </div>
    </div>
  </div>
  <div id="tab-aarti" class="text-content ${activeDeityTab === 'aarti' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="deity-tab-content">
        <div class="lyrics-box">
          ${getSectionReadingButtonHtml()}
          ${renderLyrics(deity.aarti)}
        </div>
      </div>
    </div>
  </div>
  <div id="tab-chalisa" class="text-content ${activeDeityTab === 'chalisa' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="deity-tab-content">
        <div class="lyrics-box">
          ${getSectionReadingButtonHtml()}
          ${renderLyrics(deity.chalisa)}
        </div>
      </div>
    </div>
  </div>
  <div id="tab-katha" class="text-content ${activeDeityTab === 'katha' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="deity-tab-content">
        <div class="lyrics-box">
          ${getSectionReadingButtonHtml()}
          ${renderKatha(resolvedKey, deity.katha)}
        </div>
      </div>
    </div>
  </div>
  <div id="tab-mantra" class="text-content ${activeDeityTab === 'mantra' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="deity-tab-content">
        <div class="lyrics-box">
          <div class="mantra-grid">${renderMantras(deity.mantras, resolvedKey)}</div>
        </div>
      </div>
    </div>
  </div>
  <div id="tab-extra" class="text-content ${activeDeityTab === 'extra' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="deity-tab-content">
        <div class="lyrics-box">
          ${getSectionReadingButtonHtml()}
          ${renderExtraContent(extraData)}
        </div>
      </div>
    </div>
  </div>
  <div id="tab-temples" class="text-content ${activeDeityTab === 'temples' ? 'active' : ''}">
    <div class="deity-tab-wrap">
      <div class="deity-tab-content">
        <div class="lyrics-box">
          ${renderDeityTemples(resolvedKey)}
        </div>
      </div>
    </div>
  </div>`;

  showPage('deity', activeHomeNavId);

  if (!options.skipUrl) {
    updateUrlState({
      typeId: activeHomeType,
      deityKey: resolvedKey,
      tabId: activeDeityTab,
      kathaSlug: activeDeityTab === 'katha' ? activeKathaSlug : '',
    });
  }
}

function renderAbout(data) {
  if (typeof data === 'string') return `<p>${data}</p>`;
  if (!Array.isArray(data)) return 'विवरण जल्द ही आ रहा है...';

  return data
    .map((section) => {
      const sectionTitle = section.title ? `<h3>${section.title}</h3>` : '';
      let sectionContent = '';

      if (section.content) {
        sectionContent = `<p>${section.content}</p>`;
      } else if (Array.isArray(section.items) && section.items.length) {
        sectionContent = `<ul>${section.items
          .map(
            (item) => `<li><strong>${item.label}:</strong> ${item.text}</li>`,
          )
          .join('')}</ul>`;
      }

      return `${sectionTitle}${sectionContent}`;
    })
    .filter(Boolean)
    .join('');
}

function getSectionReadingButtonHtml() {
  return `<div class="deity-tab-actions">
    <button class="section-reading-btn" type="button" onclick="openReadingModeFromSection(this)" title="पठन मोड" aria-label="पठन मोड">
      <span class="section-reading-icon" aria-hidden="true">📖</span>
      <span class="section-reading-label">पठन मोड</span>
    </button>
  </div>`;
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

function renderExtraContent(data) {
  const entries = getExtraEntries(data);
  if (!entries.length) return 'जल्द ही आ रहा है...';
  if (entries.length === 1) {
    activeExtraIndex = 0;
    return renderLyrics(entries[0]);
  }

  const safeIndex = getSafeExtraIndex(data, activeExtraIndex);
  const selected = entries[safeIndex];
  activeExtraIndex = safeIndex;

  const navHtml = `<div class="katha-list">${entries
    .map((entry, idx) => {
      const activeClass = idx === safeIndex ? ' active' : '';
      const label = escapeHtml(getExtraEntryLabel(entry, idx));
      return `<button class="tab-btn${activeClass}" onclick="openExtraEntry('${activeDeityKey}', ${idx})">${label}</button>`;
    })
    .join('')}</div><br/>`;

  return `${navHtml}${renderLyrics(selected)}`;
}

function openExtraEntry(deityKey, index) {
  if (!deities[deityKey]) return;
  showDeityPage(deityKey, { initialTab: 'extra', initialExtraIndex: index });
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
  const list = mantras || [];
  if (!list.length) return 'जल्द ही आ रहा है...';

  const items = list
    .map(
      (m, i) => `
  <div class="mantra-item">
    <button class="copy-btn" onclick="copyMantra(this, ${i}, '${key}')">📋 कॉपी</button>
    <div class="mantra-type">${m.type}</div>
    <div class="mantra-text">${m.text}</div>
    <div class="mantra-meaning">${m.meaning}</div>
    <div class="mantra-count">🔢 जाप संख्या: ${m.count}</div>
  </div>`,
    )
    .join('');

  return `<div class="mantra-merged">${items}</div>`;
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
  if (safeTab !== 'extra') activeExtraIndex = 0;
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
  krishna: ['कृष्ण', 'Krishna', 'जगन्नाथ', 'भगवान जगन्नाथ'],
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
  tirupati_balaji: ['तिरुपति बालाजी', 'वेंकटेश्वर'],
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
  tirupati_balaji: ['tirupati'],
  radha: [
    'iskcon_london',
    'iskcon_usa',
    'radha_radhanath_sa',
    'iskcon_australia',
  ],
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
  { id: 'jyotirlinga', label: '🔱 ज्योतिर्लिंग', emoji: '🔱' },
  { id: 'char_dham', label: '🙏 चार धाम', emoji: '🙏' },
  { id: 'shakti_peeth', label: '🌺 शक्ति पीठ', emoji: '🌺' },
  { id: 'vaishnava', label: '🦚 वैष्णव', emoji: '🦚' },
  { id: 'heritage', label: '🏛️ धरोहर', emoji: '🏛️' },
  { id: 'temple', label: '🛕 मंदिर', emoji: '🛕' },
  { id: 'pilgrimage', label: '🙏 तीर्थ', emoji: '🙏' },
  { id: 'peeth_math', label: '📿 पीठ/मठ', emoji: '📿' },
];
let activeTempleFilter = 'all';
let activeTempleSearchQuery = '';
const TEMPLE_BATCH_SIZE = 18;
let templeFilteredList = [];
let renderedTempleCount = 0;
let templeScrollTicking = false;

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

function includesKeyword(value = '', keyword = '') {
  return String(value || '')
    .toLowerCase()
    .includes(String(keyword || '').toLowerCase());
}

function matchesTempleFilter(temple, filter) {
  const type = String(temple.type || '').toLowerCase();
  const deity = String(temple.deity || '').toLowerCase();
  const name = String(temple.name || '').toLowerCase();

  if (filter === 'all') return true;
  if (filter === 'india') return !isOutsideIndiaTemple(temple);
  if (filter === 'outside_india') return isOutsideIndiaTemple(temple);

  if (filter === 'jyotirlinga') return includesKeyword(type, 'jyotirlinga');
  if (filter === 'char_dham') return includesKeyword(type, 'char dham');
  if (filter === 'shakti_peeth') return includesKeyword(type, 'shakti peeth');
  if (filter === 'vaishnava') return includesKeyword(type, 'vaishnava');
  if (filter === 'heritage') return includesKeyword(type, 'heritage');

  if (filter === 'temple')
    return includesKeyword(type, 'temple') || includesKeyword(type, 'mandir');

  if (filter === 'pilgrimage') {
    return (
      includesKeyword(type, 'pilgrimage') ||
      includesKeyword(type, 'dham') ||
      includesKeyword(type, 'teerth') ||
      includesKeyword(type, 'sacred hill') ||
      includesKeyword(type, 'char dham')
    );
  }

  if (filter === 'peeth_math') {
    return (
      includesKeyword(type, 'peeth') ||
      includesKeyword(type, 'peetham') ||
      includesKeyword(type, 'math')
    );
  }

  return type === String(filter || '').toLowerCase();
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

  setupTempleSearch();
  renderTemples('all');
}

function getFilteredTemples(filter) {
  const byCategory = templesData.filter((temple) =>
    matchesTempleFilter(temple, filter),
  );
  const normalizedQuery = activeTempleSearchQuery.trim().toLowerCase();
  if (!normalizedQuery) return byCategory;

  return byCategory.filter((temple) =>
    `${temple.name} ${temple.nameEn} ${temple.deity} ${temple.type} ${temple.state} ${temple.location}`
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

function getTempleCardHtml(temple, idx) {
  const animationDelay = Math.min(idx, 7) * 0.06;
  return `
    <div class="temple-card" onclick="showTempleDetailsPage('${temple.id}')" style="animation-delay:${animationDelay}s; background:${temple.gradient}; --temple-color:${temple.color};">
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
  `;
}

function renderTemples(filter, options = {}) {
  const { reset = true } = options;
  activeTempleFilter = filter;
  const grid = document.getElementById('templesGrid');
  if (!grid) return;

  if (reset) {
    templeFilteredList = getFilteredTemples(filter);
    renderedTempleCount = 0;
    grid.innerHTML = '';
    if (!templeFilteredList.length) {
      const queryText = activeTempleSearchQuery.trim()
        ? ` "${escapeHtml(activeTempleSearchQuery.trim())}"`
        : '';
      grid.innerHTML = `
        <div class="home-empty-state">
          <div class="home-empty-icon">🔍</div>
          <div class="home-empty-title">कोई मंदिर नहीं मिला${queryText}</div>
          <div class="home-empty-subtitle">दूसरा नाम लिखें या ऊपर का फ़िल्टर बदलकर देखें</div>
        </div>
      `;
      return;
    }
  }

  const nextBatch = templeFilteredList.slice(
    renderedTempleCount,
    renderedTempleCount + TEMPLE_BATCH_SIZE,
  );
  if (!nextBatch.length) return;

  const batchHtml = nextBatch
    .map((temple, idx) => getTempleCardHtml(temple, idx))
    .join('');
  grid.insertAdjacentHTML('beforeend', batchHtml);
  renderedTempleCount += nextBatch.length;

  if (reset) fillTemplesViewportIfNeeded();
}

function fillTemplesViewportIfNeeded() {
  let guard = 0;
  while (
    renderedTempleCount < templeFilteredList.length &&
    document.documentElement.scrollHeight <= window.innerHeight + 120 &&
    guard < 8
  ) {
    renderTemples(activeTempleFilter, { reset: false });
    guard += 1;
  }
}

function maybeLoadMoreTemplesOnScroll() {
  const templesPage = document.getElementById('page-temples');
  if (!templesPage || !templesPage.classList.contains('active')) return;
  if (renderedTempleCount >= templeFilteredList.length) return;
  const nearBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 260;
  if (!nearBottom) return;
  renderTemples(activeTempleFilter, { reset: false });
}

function filterTemples(category, btn) {
  document
    .querySelectorAll('#templeFilters .temple-filter-btn')
    .forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('templesGrid');
  if (!grid) return;
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(12px)';
  setTimeout(() => {
    renderTemples(category, { reset: true });
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }, 200);
}

function setupTempleSearch() {
  const searchInput = document.getElementById('templeSearchInput');
  const clearBtn = document.getElementById('templeSearchClear');
  if (!searchInput) return;

  const syncClearButton = () => {
    if (!clearBtn) return;
    clearBtn.classList.toggle('visible', searchInput.value.trim().length > 0);
  };

  searchInput.value = activeTempleSearchQuery;
  syncClearButton();

  searchInput.addEventListener('input', (event) => {
    activeTempleSearchQuery = event.target.value;
    renderTemples(activeTempleFilter, { reset: true });
    syncClearButton();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      activeTempleSearchQuery = '';
      searchInput.value = '';
      renderTemples(activeTempleFilter, { reset: true });
      syncClearButton();
      searchInput.focus();
    });
  }
}

function getTempleDetailHeaderHtml(temple) {
  return `
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
}

function getTempleDetailInfoHtml(temple) {
  return `
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
}

function showTempleDetailsPage(templeId, options = {}) {
  const { skipUrl = false } = options;
  const temple = templesData.find((t) => t.id === templeId);
  if (!temple) {
    showTemplesMenuPage({ skipUrl });
    return;
  }
  activeDeityKey = '';
  activeDeityTab = 'about';
  activeTempleDetailId = temple.id;
  activeFestivalDetailId = '';
  const headerEl = document.getElementById('templeDetailHeader');
  const infoEl = document.getElementById('templeDetailInfo');
  if (!headerEl || !infoEl) return;
  headerEl.innerHTML = getTempleDetailHeaderHtml(temple);
  infoEl.innerHTML = getTempleDetailInfoHtml(temple);
  showPage('temple-detail', 'temples');
  if (!skipUrl) {
    updateUrlState({
      typeId: activeHomeType,
      deityKey: '',
      pageId: 'temple-detail',
      templeId: temple.id,
    });
  }
}

function openTempleModal(id) {
  const temple = templesData.find((t) => t.id === id);
  if (!temple) return;
  document.getElementById('templeModalHeader').innerHTML =
    getTempleDetailHeaderHtml(temple);
  document.getElementById('templeModalInfo').innerHTML =
    getTempleDetailInfoHtml(temple);
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
const FESTIVAL_BATCH_SIZE = 16;
let festivalFilteredList = [];
let renderedFestivalCount = 0;

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

function getFilteredFestivals(filter) {
  return filter === 'all'
    ? festivalsData
    : festivalsData.filter((festival) => festival.type === filter);
}

function getFestivalCardHtml(festival, idx) {
  return `
    <div class="temple-card" onclick="showFestivalDetailsPage('${festival.id}')" style="animation-delay:${idx * 0.06}s; background:${festival.gradient}; --temple-color:${festival.color};">
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
  `;
}

function renderFestivals(filter, options = {}) {
  const { reset = true } = options;
  activeFestivalFilter = filter;
  const grid = document.getElementById('festivalsGrid');
  if (!grid) return;

  if (reset) {
    festivalFilteredList = getFilteredFestivals(filter);
    renderedFestivalCount = 0;
    grid.innerHTML = '';
  }

  const nextBatch = festivalFilteredList.slice(
    renderedFestivalCount,
    renderedFestivalCount + FESTIVAL_BATCH_SIZE,
  );
  if (!nextBatch.length) return;

  const html = nextBatch
    .map((festival, idx) =>
      getFestivalCardHtml(festival, renderedFestivalCount + idx),
    )
    .join('');
  grid.insertAdjacentHTML('beforeend', html);
  renderedFestivalCount += nextBatch.length;

  if (reset) fillFestivalsViewportIfNeeded();
}

function fillFestivalsViewportIfNeeded() {
  let guard = 0;
  while (
    renderedFestivalCount < festivalFilteredList.length &&
    document.documentElement.scrollHeight <= window.innerHeight + 120 &&
    guard < 8
  ) {
    renderFestivals(activeFestivalFilter, { reset: false });
    guard += 1;
  }
}

function maybeLoadMoreFestivalsOnScroll() {
  const festivalsPage = document.getElementById('page-festivals');
  if (!festivalsPage || !festivalsPage.classList.contains('active')) return;
  if (renderedFestivalCount >= festivalFilteredList.length) return;
  const nearBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 260;
  if (!nearBottom) return;
  renderFestivals(activeFestivalFilter, { reset: false });
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
    renderFestivals(category, { reset: true });
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }, 200);
}

function getFestivalDetailHeaderHtml(festival) {
  return `
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
}

function getFestivalDetailInfoHtml(festival) {
  return `
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
}

function showFestivalDetailsPage(festivalId, options = {}) {
  const { skipUrl = false } = options;
  const festival = festivalsData.find((f) => f.id === festivalId);
  if (!festival) {
    showFestivalsMenuPage({ skipUrl });
    return;
  }
  activeDeityKey = '';
  activeDeityTab = 'about';
  activeTempleDetailId = '';
  activeFestivalDetailId = festival.id;
  const headerEl = document.getElementById('festivalDetailHeader');
  const infoEl = document.getElementById('festivalDetailInfo');
  if (!headerEl || !infoEl) return;
  headerEl.innerHTML = getFestivalDetailHeaderHtml(festival);
  infoEl.innerHTML = getFestivalDetailInfoHtml(festival);
  showPage('festival-detail', 'festivals');
  if (!skipUrl) {
    updateUrlState({
      typeId: activeHomeType,
      deityKey: '',
      pageId: 'festival-detail',
      festivalId: festival.id,
    });
  }
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

function openReadingMode() {
  const page = document.getElementById('page-deity');
  if (!page || !page.classList.contains('active')) return;

  const overlay = document.getElementById('readingModeDialog');
  const body = document.getElementById('readingModeBody');
  if (!overlay || !body) return;

  const activeTab = page.querySelector('.text-content.active');
  const contentSource = activeTab
    ? activeTab.querySelector('.deity-tab-content') || activeTab
    : null;
  if (contentSource) {
    const clone = contentSource.cloneNode(true);
    clone.querySelectorAll('.deity-tab-actions').forEach((el) => el.remove());
    clone.querySelectorAll('.katha-list').forEach((el) => {
      const nextEl = el.nextElementSibling;
      if (nextEl && nextEl.tagName === 'BR') nextEl.remove();
      el.remove();
    });
    body.innerHTML = clone.innerHTML;
  } else {
    body.innerHTML = '<div class="lyrics-box">सामग्री उपलब्ध नहीं है।</div>';
  }

  overlay.classList.add('active');
  document.body.classList.add('reading-mode-open');
}

function openReadingModeFromSection(trigger) {
  const section = trigger?.closest('.text-content');
  if (!section) return openReadingMode();
  const overlay = document.getElementById('readingModeDialog');
  const body = document.getElementById('readingModeBody');
  if (!overlay || !body) return;
  const contentSource = section.querySelector('.deity-tab-content');
  if (contentSource) {
    const clone = contentSource.cloneNode(true);
    clone.querySelectorAll('.deity-tab-actions').forEach((el) => el.remove());
    clone.querySelectorAll('.katha-list').forEach((el) => {
      const nextEl = el.nextElementSibling;
      if (nextEl && nextEl.tagName === 'BR') nextEl.remove();
      el.remove();
    });
    body.innerHTML = clone.innerHTML;
  } else {
    body.innerHTML = '<div class="lyrics-box">सामग्री उपलब्ध नहीं है।</div>';
  }
  overlay.classList.add('active');
  document.body.classList.add('reading-mode-open');
}

function closeReadingMode(e) {
  const overlay = document.getElementById('readingModeDialog');
  if (!overlay) return;
  if (e && e.target && e.target.id !== 'readingModeDialog') return;
  overlay.classList.remove('active');
  document.body.classList.remove('reading-mode-open');
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
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isIOS || isMobile) {
      document.body.classList.add('reduced-effects');
    }

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
    loadHomeViewMode();
    setupHomeViewToggle();
    setupHomeSearch();
    buildHomeGrid();
    updateArrowVisibility();
    updateSiteTitleByLang();
    syncDefaultSiteHeaderHeight();

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

window.addEventListener('scroll', () => {
  if (templeScrollTicking) return;
  templeScrollTicking = true;
  window.requestAnimationFrame(() => {
    templeScrollTicking = false;
    maybeLoadMoreHomeOnScroll();
    maybeLoadMoreFestivalsOnScroll();
    maybeLoadMoreTemplesOnScroll();
  });
});

window.addEventListener('popstate', () => {
  applyUrlState();
});

window.addEventListener('resize', () => {
  syncDefaultSiteHeaderHeight();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeReadingMode();
});

window.addEventListener('DOMContentLoaded', () => {
  applyUrlState();
  const activePageEl = document.querySelector('.page.active');
  const activePageId = activePageEl?.id?.replace('page-', '') || '';
  updateUrlState({
    typeId: activeHomeType,
    deityKey: activeDeityKey,
    tabId: activeDeityTab,
    kathaSlug: activeKathaSlug,
    pageId: activeDeityKey ? '' : activePageId,
    templeId: activeTempleDetailId,
    festivalId: activeFestivalDetailId,
    replace: true,
  });
});
