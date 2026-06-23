// ── CONSTANTS ──
const DISTRICTS = Object.keys(DIST_AVG);

const IND_KEYS = ['score_4_5','gia9_rus','gia9_math','ege11_rus','ege11_math','att9_honor','att11_honor','olymp_reg','olymp_fed','olymp_intl'];
const IND_LABELS = ['Успев. 4 и 5','ГИА 9 Рус','ГИА 9 Мат','ЕГЭ 11 Рус','ЕГЭ 11 Мат','Отличники 9','Отличники 11','Олимп. рег','Олимп. фед','Олимп. межд'];
const IND_LONG = [
  'Успевающие на «4» и «5»',
  'ГИА 9 — Русский язык',
  'ГИА 9 — Математика',
  'ЕГЭ 11 — Русский язык',
  'ЕГЭ 11 — Математика',
  'Аттестаты с отличием (9 кл.)',
  'Аттестаты с отличием (11 кл.)',
  'Олимпиады — региональный',
  'Олимпиады — федеральный',
  'Олимпиады — международный',
];
const BALL_KEYS = ['score_4_5_ball','gia9_rus_ball','gia9_math_ball','ege11_rus_ball','ege11_math_ball','att9_honor_ball','att11_honor_ball','olymp_reg_ball','olymp_fed_ball','olymp_intl_ball'];
const VAL_KEYS  = ['score_4_5_val','gia9_rus_val','gia9_math_val','ege11_rus_val','ege11_math_val','att9_honor_val','att11_honor_val','olymp_reg_val','olymp_fed_val','olymp_intl_val'];

// ── NAV ──
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

// ── POPULATE FILTERS ──
const df = document.getElementById('districtFilter');
const rd = document.getElementById('radarDistSelect');
DISTRICTS.forEach(d => {
  df.innerHTML += `<option value="${d}">${d}</option>`;
  if (rd) rd.innerHTML += `<option value="${d}">${d}</option>`;
});

// ── SEARCH ──
let searchTimeout;

function renderSchools(list) {
  const el = document.getElementById('searchResults');
  if (!list.length) {
    el.innerHTML = '<div class="no-results">Школы не найдены. Попробуйте другой запрос.</div>';
    return;
  }
  el.innerHTML = list.slice(0, 48).map((s, i) => {
    const g = s.rating_group || 3;
    const score = s.total_score !== null ? s.total_score : '—';
    const bars = BALL_KEYS.map((k, idx) => {
      const b = s[k];
      return `<div class="sc-bar-item">
        <div class="sc-bar-label">${IND_LABELS[idx]}</div>
        <div class="sc-bar-track"><div class="sc-bar-fill" style="width:${b === null ? 5 : b / 3 * 100}%"></div></div>
      </div>`;
    }).join('');
    return `<div class="school-card" style="animation-delay:${i * 0.03}s" onclick='openModal(${JSON.stringify(s)})'>
      <div class="sc-header">
        <div>
          <div class="sc-name">${s.name}</div>
          <div class="sc-district">${s.district}</div>
        </div>
        <div class="group-badge g${g}">${g}</div>
      </div>
      <div class="sc-score-row">
        <div>
          <div class="sc-total">${score}</div>
          <div class="sc-total-label">из 30 баллов</div>
        </div>
      </div>
      <div class="sc-bars">${bars}</div>
    </div>`;
  }).join('');
}

function doSearch() {
  const q    = document.getElementById('schoolSearch').value.toLowerCase();
  const dist = document.getElementById('districtFilter').value;
  const grp  = document.getElementById('groupFilter').value;
  if (!q && !dist && !grp) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }
  let list = SCHOOLS.filter(s => {
    if (dist && s.district !== dist) return false;
    if (grp  && s.rating_group !== +grp) return false;
    if (q    && !s.name.toLowerCase().includes(q)) return false;
    return true;
  });
  list.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
  renderSchools(list);
}

document.getElementById('schoolSearch').addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(doSearch, 200);
});
document.getElementById('districtFilter').addEventListener('change', doSearch);
document.getElementById('groupFilter').addEventListener('change', doSearch);
//doSearch();

// ── MODAL ──
function openModal(s) {
  const g      = s.rating_group || 3;
  const gColor = ['','var(--g1)','var(--g2)','var(--g3)'][g];
  const indicators = BALL_KEYS.map((k, idx) => {
    const ball   = s[k];
    const val    = s[VAL_KEYS[idx]];
    const cls    = ball === null ? 'ni' : ball;
    const valStr = val !== null && val !== undefined
      ? (val > 1 ? val.toFixed(1) : (val * 100).toFixed(1) + '%')
      : '—';
    return `<div class="ind-row">
      <div class="ind-label">${IND_LONG[idx]}</div>
      <div class="ind-track"><div class="ind-fill fill-${cls}"></div></div>
      <div class="ind-ball ball-${cls}">${ball === null ? 'НИ' : ball}</div>
    </div>`;
  }).join('');

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-school-name">${s.name}</div>
    <div class="modal-district">📍 ${s.district} район</div>
    <div class="modal-summary">
      <div class="modal-stat-box">
        <div class="modal-stat-val" style="color:var(--gold)">${s.total_score !== null ? s.total_score : '—'}</div>
        <div class="modal-stat-lbl">Итоговый балл<br>из 30</div>
      </div>
      <div class="modal-stat-box">
        <div class="modal-stat-val" style="color:${gColor}">${g}</div>
        <div class="modal-stat-lbl">Группа</div>
      </div>
      <div class="modal-stat-box">
        <div class="modal-stat-val" style="color:var(--blue)">${s.rank_all !== null ? '#' + s.rank_all : '—'}</div>
        <div class="modal-stat-lbl">Место<br>в районе</div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:14px;font-weight:500;letter-spacing:1px;text-transform:uppercase">Показатели (0–3 балла)</div>
    <div class="modal-indicators">${indicators}</div>
    ${s.skips > 0 ? `<div style="margin-top:16px;padding:12px 16px;background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.2);border-radius:10px;font-size:12px;color:#ff8f8f">⚠️ Пропущено показателей: ${s.skips}</div>` : ''}
  `;
  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal')) {
    document.getElementById('modal').classList.remove('open');
  }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── DISTRICT TABLE ──
let currentDistKey = 'total';

function renderDistTable(key) {
  const sorted = [...DISTRICTS]
    .map(d => ({ name: d, val: key === 'total' ? DIST_AVG[d].total : DIST_AVG[d][key] }))
    .sort((a, b) => b.val - a.val);
  const maxVal = Math.max(...sorted.map(d => d.val));
  const table  = document.getElementById('distTable');

  table.innerHTML = `<thead><tr>
    <th>Место</th><th>Район</th><th>Балл</th>
    <th>Кол-во школ 1 группы</th><th>Кол-во школ 2 группы</th><th>Кол-во школ 3 группы</th>
  </tr></thead>`;

  const tbody = document.createElement('tbody');
  sorted.forEach((d, i) => {
    const grp     = DIST_GRP[d.name] || {};
    const pct     = ((d.val / maxVal) * 100).toFixed(0);
    const rankCls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const tr      = document.createElement('tr');
    tr.innerHTML  = `
      <td><span class="rank-num ${rankCls}">${i + 1}</span></td>
      <td class="dist-name-cell">${d.name}</td>
      <td class="score-cell">${d.val.toFixed(2)}</td>

      <td><span style="color:var(--g1);font-weight:600">${grp.g1_count || 0}</span></td>
      <td><span style="color:var(--g2);font-weight:600">${grp.g2_count || 0}</span></td>
      <td><span style="color:var(--g3);font-weight:600">${grp.g3_count || 0}</span></td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}
renderDistTable('total');

document.querySelectorAll('#distTabs .tab-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#distTabs .tab-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDistKey = btn.dataset.key;
    renderDistTable(currentDistKey);
  });
});

// ── CHARTS ──
Chart.defaults.color       = '#8a96c0';
Chart.defaults.borderColor = 'rgba(100,130,255,0.1)';

const distsSorted = [...DISTRICTS].sort((a, b) => DIST_AVG[b].total - DIST_AVG[a].total);

// Stacked groups bar
new Chart(document.getElementById('groupsChart'), {
  type: 'bar',
  data: {
    labels: distsSorted.map(d => d.length > 25 ? d.substring(0, 25) + '…' : d),
    datasets: [
      { label: 'Группа 1', data: distsSorted.map(d => Math.round((DIST_GRP[d]?.g1_share || 0) * 100)), backgroundColor: 'rgba(61,220,132,0.75)' },
      { label: 'Группа 2', data: distsSorted.map(d => Math.round((DIST_GRP[d]?.g2_share || 0) * 100)), backgroundColor: 'rgba(245,200,66,0.75)' },
      { label: 'Группа 3', data: distsSorted.map(d => Math.round((DIST_GRP[d]?.g3_share || 0) * 100)), backgroundColor: 'rgba(255,107,107,0.75)' },
    ]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true, max: 100, ticks: { callback: v => v + '%', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { stacked: true, ticks: { font: { size: 10 } }, grid: { display: false } }
    },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 10, padding: 16 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%` } }
    }
  }
});

// Radar chart
let radarChart;
function buildRadar(dist) {
  const vals = IND_KEYS.map(k => DIST_AVG[dist][k] || 0);
  if (radarChart) radarChart.destroy();
  radarChart = new Chart(document.getElementById('radarChart'), {
    type: 'radar',
    data: {
      labels: IND_LABELS,
      datasets: [{
        label: dist,
        data: vals,
        backgroundColor: 'rgba(74,127,255,0.15)',
        borderColor: 'rgba(74,127,255,0.8)',
        borderWidth: 2,
        pointBackgroundColor: '#4a7fff',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0, max: 3,
          ticks: { stepSize: 1, font: { size: 10 }, backdropColor: 'transparent' },
          grid: { color: 'rgba(255,255,255,0.08)' },
          angleLines: { color: 'rgba(255,255,255,0.08)' },
          pointLabels: { font: { size: 10 }, color: '#8a96c0' }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}
buildRadar(DISTRICTS[0]);
if (rd) rd.addEventListener('change', e => buildRadar(e.target.value));

// District totals bar
new Chart(document.getElementById('distBarChart'), {
  type: 'bar',
  data: {
    labels: distsSorted,
    datasets: [{
      label: 'Средний итоговый балл',
      data: distsSorted.map(d => DIST_AVG[d].total),
      backgroundColor: distsSorted.map((_, i) => `rgba(74,127,255,${0.4 + i / distsSorted.length * 0.5})`),
      borderColor: 'rgba(74,127,255,0.8)',
      borderWidth: 1,
      borderRadius: 6,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 25, ticks: { font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      x: { ticks: { font: { size: 11 }, maxRotation: 40 }, grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.raw.toFixed(2)} баллов` } }
    }
  }
});

// ── TOP SCHOOLS ──
const topSchools = SCHOOLS
  .filter(s => s.total_score !== null)
  .sort((a, b) => b.total_score - a.total_score)
  .slice(0, 20);

document.getElementById('topSchools').innerHTML = topSchools.map((s, i) => {
  const rankCls = i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : 'rn';
  const rankStr = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
  const g = s.rating_group || 1;
  return `<div class="top-card" onclick='openModal(${JSON.stringify(s)})'>
    <div class="top-rank ${rankCls}">${rankStr}</div>
    <div class="top-info">
      <div class="top-name">${s.name}</div>
      <div class="top-dist">📍 ${s.district}</div>
      <div class="top-score">
        <div class="top-score-val">${s.total_score}</div>
        <div class="top-score-max">/ 30 баллов</div>
        <div class="group-badge g${g}" style="width:24px;height:24px;font-size:11px;margin-left:6px">${g}</div>
      </div>
    </div>
  </div>`;
}).join('');

// ── SCROLL SPY ──
const sections = ['methodology','search','districts','top'];
const navBtns  = document.querySelectorAll('.nav-btn');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const idx = sections.indexOf(e.target.id);
      if (idx >= 0) {
        navBtns.forEach(b => b.classList.remove('active'));
        navBtns[idx].classList.add('active');
      }
    }
  });
}, { threshold: 0.3 });
sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
