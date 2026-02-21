
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
    font-size: ${8 + Math.random() * 12}px;
    animation-duration: ${15 + Math.random() * 25}s;
    animation-delay: ${Math.random() * 20}s;
  `;
    container.appendChild(p);
  }
}

// ============ BUILD HOME GRID ============
function buildHomeGrid() {
  const grid = document.getElementById('homeGrid');
  for (const [key, deity] of Object.entries(deities)) {
    const card = document.createElement('div');
    card.className = 'deity-card';
    card.onclick = () => showDeityPage(key);
    const imgHtml = deity.img
      ? `<img class="deity-img" src="${deity.img}" alt="${deity.name}" onerror="this.parentNode.querySelector('.deity-img-fallback').style.display='flex'; this.style.display='none';">
     <div class="deity-img-fallback" style="display:none">${deity.emoji}</div>`
      : `<div class="deity-img-fallback">${deity.emoji}</div>`;
    card.innerHTML = `
    ${imgHtml}
    <div class="deity-info">
      <span class="deity-name">${deity.name}</span>
      <span class="deity-meta">${deity.desc}</span>
      <div class="deity-tags">
        <span class="tag tag-aarti">आरती</span>
        <span class="tag tag-chalisa">चालीसा</span>
        <span class="tag tag-mantra">मंत्र</span>
      </div>
    </div>`;
    grid.appendChild(card);
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

  leftArrow.style.display = container.scrollLeft > 5 ? 'flex' : 'none';
  rightArrow.style.display =
    container.scrollLeft + container.clientWidth < container.scrollWidth - 5
      ? 'flex'
      : 'none';
}

function showPage(pageId, navId) {
  document
    .querySelectorAll('.page')
    .forEach((p) => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');
  syncNav(navId || pageId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

function showDeityPage(key) {
  const deity = deities[key];
  if (!deity) return;

  // Build header
  const imgHtml = deity.img
    ? `<img class="deity-portrait" src="${deity.img}" alt="${deity.name}" onerror="this.nextElementSibling.style.display='flex'; this.style.display='none';">
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
  <button class="tab-btn active" onclick="showTab('about', this)">🚩 परिचय</button>
  <button class="tab-btn" onclick="showTab('aarti', this)">🪔 आरती</button>
  <button class="tab-btn" onclick="showTab('chalisa', this)">📖 चालीसा</button>
  <button class="tab-btn" onclick="showTab('mantra', this)">🕉️ मंत्र</button>`;

  // Render contents
  const content = document.getElementById('deityContent');
  if (!content) return;

  content.innerHTML = `
  <div id="tab-about" class="text-content active">
    <div class="lyrics-box about-content">${renderAbout(deity.about)}</div>
  </div>
  <div id="tab-aarti" class="text-content">
    <div class="lyrics-box">${renderLyrics(deity.aarti)}</div>
  </div>
  <div id="tab-chalisa" class="text-content">
    <div class="lyrics-box">${renderLyrics(deity.chalisa)}</div>
  </div>
  <div id="tab-mantra" class="text-content">
    <div class="mantra-grid">${renderMantras(deity.mantras, key)}</div>
  </div>`;

  showPage('deity', key);
}

function renderAbout(data) {
  if (typeof data === 'string') return data;
  if (!Array.isArray(data)) return 'विवरण जल्द ही आ रहा है...';

  return data.map(section => {
    let contentHtml = '';
    if (section.content) {
      contentHtml = `<p>${section.content}</p>`;
    } else if (section.items) {
      contentHtml = `<ul>${section.items.map(item => `
        <li><strong>${item.label}:</strong> ${item.text}</li>
      `).join('')}</ul>`;
    }
    return `
      <div class="info-section">
        <h3>${section.title}</h3>
        ${contentHtml}
      </div>`;
  }).join('');
}

function renderLyrics(data) {
  if (typeof data === 'string') return data;
  if (!data || !data.lines) return 'जल्द ही आ रहा है...';

  const titleHtml = data.title ? `<div class="title-line">${data.title}</div>` : '';
  const linesHtml = data.lines.map(line => {
    if (line.type === 'refrain') {
      return `<div class="refrain">${line.text}</div>`;
    } else if (line.type === 'stanza') {
      const refrainHtml = line.refrain ? `<div class="refrain">${line.refrain}</div>` : '';
      return `<div class="stanza">${line.text}${refrainHtml}</div>`;
    }
    return line.text;
  }).join('');

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
  const content = document.getElementById('deityContent');
  if (!content) return;
  content
    .querySelectorAll('.text-content')
    .forEach((t) => t.classList.remove('active'));
  document
    .querySelectorAll('.tabs .tab-btn')
    .forEach((b) => b.classList.remove('active'));
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');
  btn.classList.add('active');
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

// ============ INIT ============
window.addEventListener('load', () => {
  createParticles();
  buildHomeGrid();
  updateArrowVisibility();

  const navWrapper = document.querySelector('.nav-inner-wrapper');
  if (navWrapper) {
    navWrapper.addEventListener('scroll', updateArrowVisibility);
  }

  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1800);
});
