import proverbs from '../seed/proverbs.seed.js';

const flags     = { en:'🇬🇧', es:'🇪🇸', fr:'🇫🇷', nl:'🇳🇱', de:'🇩🇪', pt:'🇵🇹' };
const langNames = { en:'English', es:'Spanish', fr:'French', nl:'Dutch', de:'German', pt:'Portuguese' };
const langs     = ['en', 'es', 'fr', 'nl', 'de', 'pt'];

let activeLang  = 'all';
let searchQuery = '';

function renderCards(filtered) {
  const container = document.getElementById('proverbsContainer');
  const noResults = document.getElementById('noResults');
  const count     = document.getElementById('resultCount');

  if (!filtered.length) {
    container.innerHTML = '';
    noResults.classList.add('show');
    count.textContent = 'No results';
    return;
  }
  noResults.classList.remove('show');
s
  if (activeLang === 'all') {
    let html = '';
    langs.forEach(code => {
      const group = filtered.filter(p => p.code === code);
      if (!group.length) return;
      html += `
        <div class="lang-heading">
          <div class="lang-pill ${code}">${flags[code]} ${langNames[code]}</div>
          <div class="lang-divider"></div>
          <small class="text-muted">${group.length} proverb${group.length > 1 ? 's' : ''}</small>
        </div>
        <div class="row">
          ${group.map((p, i) => cardHTML(p, i + 1)).join('')}
        </div>
      `;
    });
    container.innerHTML = html;
  } else {
    container.innerHTML = `
      <div class="row">
        ${filtered.map((p, i) => cardHTML(p, i + 1)).join('')}
      </div>
    `;
  }

  count.textContent = `${filtered.length} proverb${filtered.length !== 1 ? 's' : ''}`;
}

function cardHTML(p, num) {
  return `
    <div class="col-md-6 col-lg-4">
      <div class="proverb-card ${p.code}">
        <div class="proverb-num">#${String(num).padStart(2, '0')}</div>
        <div class="proverb-text">${p.text}</div>
        <div class="proverb-meaning"><strong>Meaning</strong>${p.meaning}</div>
      </div>
    </div>
  `;
}

function applyFilters() {
  let filtered = proverbs;
  if (activeLang !== 'all') filtered = filtered.filter(p => p.code === activeLang);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.text.toLowerCase().includes(q) || p.meaning.toLowerCase().includes(q)
    );
  }
  renderCards(filtered);
}

// Tab clicks
document.querySelectorAll('#langTabs .nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('#langTabs .nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    activeLang = link.dataset.lang;
    applyFilters();
  });
});

// Search
document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value.trim();
  applyFilters();
});

// Init
applyFilters();
