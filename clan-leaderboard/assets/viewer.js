(() => {
  const qs = new URLSearchParams(location.search);
  const source = qs.get('source') || '../clan-leaderboard.html';
  const mode = qs.get('mode') || 'graphic';
  const root = document.querySelector('#viewer');
  if (!root) return;
  const isBaseline = source.includes('2026-09-12-1900');
  const config = isBaseline ? {
    title:'ثبت اولیه ۴۷ عضو', date:'۲۱ شهریور ۱۴۰۵', time:'۱۹:۰۰', period:'دوره ۰۱', sourceLabel:'Baseline',
    prev:null, next:'../index.html?source=../clan-leaderboard.html&mode=graphic', archive:'../archive.html'
  } : {
    title:'جدول جامع عملکرد و تغییرات اعضا', date:'۲۱ شهریور ۱۴۰۵', time:'۲۳:۳۰', period:'دوره ۰۲', sourceLabel:'Latest / Delta Report',
    prev:'reports/2026-09-12-1900-view.html?source=2026-09-12-1900.html&mode=graphic', next:null, archive:'archive.html'
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = el => el ? el.textContent.trim() : '';
  const nav = `<nav class="nav"><a class="btn" href="${config.prev || '#'}" ${config.prev?'':'aria-disabled="true"'}>← دوره قبل</a><a class="btn" href="${config.archive}">آرشیو</a><a class="btn" href="${config.next || '#'}" ${config.next?'':'aria-disabled="true"'}>دوره بعد →</a></nav>`;
  fetch(source).then(r => { if(!r.ok) throw new Error('source'); return r.text(); }).then(html => {
    const doc = new DOMParser().parseFromString(html,'text/html');
    const members = [];
    const cards = [...doc.querySelectorAll('.member')];
    if(cards.length) cards.forEach(card => {
      const stats = {};
      card.querySelectorAll('.stat').forEach(s => { const k=text(s.querySelector('span')); stats[k]=text(s.querySelector('strong')); });
      const rankText=text(card.querySelector('.rank')); const rank=(rankText.match(/^\d+/)||[''])[0];
      members.push({rank,name:text(card.querySelector('h3')),role:text(card.querySelector('.role')),movement:text(card.querySelector('.movement')),stats});
    });
    else doc.querySelectorAll('tbody tr').forEach(tr => {
      const c=[...tr.children].map(text); if(c.length>=10) members.push({rank:c[0],name:c[1],role:c[2],movement:'',stats:{'استیج':c[3],'مدال لیگ جاری':c[4],'مدال کل کلن':c[5],'مجموع کیل 💀':c[6],'لول سلاح‌ها (توپ / هیدرا / هل‌فایر)':c[7],'مدال‌های افتخار (طلا / نقره / برنز)':c[8],'آخرین آنلاین':c[9]}});
    });
    const keys = isBaseline ? ['استیج','مدال لیگ جاری','مدال کل کلن','مجموع کیل 💀','لول سلاح‌ها (توپ / هیدرا / هل‌فایر)','مدال‌های افتخار (طلا / نقره / برنز)','آخرین آنلاین'] : ['استیج','مدال لیگ جاری','تغییرات مدال لیگ','مدال کل کلن','مجموع کیل 💀','افزایش کیل 💀','لول سلاح‌ها (توپ / هیدرا / هل‌فایر)','آخرین آنلاین'];
    const sortableStats = new Set(['استیج','مدال لیگ جاری','تغییرات مدال لیگ','مدال کل کلن','مجموع کیل 💀','افزایش کیل 💀','آخرین آنلاین']);
    const parseNumber = value => {
      const digits = String(value ?? '').replace(/[٬,]/g,'').match(/-?\d+(?:\.\d+)?/);
      return digits ? Number(digits[0]) : null;
    };
    const parseLastOnline = value => {
      const v=String(value ?? '').trim().toLowerCase();
      if (!v) return null;
      if (v.includes('<1m') || v.includes('کمتر')) return 0;
      const n=parseNumber(v); if (n === null) return null;
      if (v.includes('d') || v.includes('روز')) return n*1440;
      if (v.includes('h') || v.includes('ساعت')) return n*60;
      return n;
    };
    const valueForSort = (m, key, index) => {
      if (index === 0) return parseNumber(m.rank);
      if (index === 1) return m.name.toLocaleLowerCase('fa');
      if (index === 2) return m.role.toLocaleLowerCase('fa');
      const value = m.stats[key] || '';
      if (key === 'آخرین آنلاین') return parseLastOnline(value);
      return parseNumber(value);
    };
    const cardView = m => `<article class="member"><header><div><span class="rank">${esc(m.rank)}</span><div><h3>${esc(m.name)}</h3><small>${esc(m.role)}</small></div></div><b>${esc(m.movement||'')}</b></header><div class="stats">${keys.map(k=>`<div class="stat"><span>${esc(k)}</span><strong>${esc(m.stats[k]||'—')}</strong></div>`).join('')}</div></article>`;
    let sortIndex = null;
    let sortDirection = 1;
    const sortButton = (label, index, sortable) => sortable ? `<button type="button" class="sort-button" data-sort-index="${index}" aria-label="مرتب‌سازی بر اساس ${esc(label)}">${esc(label)}<span class="sort-indicator" aria-hidden="true">↕</span></button>` : esc(label);
    const table = list => `<div class="table-wrap"><table><thead><tr>${sortButton('رتبه',0,true)}${sortButton('نام کاربری',1,true)}${sortButton('سمت',2,true)}${keys.map((k,i)=>`<th>${sortButton(k,i+3,sortableStats.has(k))}</th>`).join('')}</tr></thead><tbody>${list.map(m=>`<tr><td>${esc(m.rank)}</td><td>${esc(m.name)}</td><td>${esc(m.role)}</td>${keys.map(k=>`<td>${esc(m.stats[k]||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    root.innerHTML = `<section class="hero"><span class="badge">PERSIA · ${esc(config.period)}</span><h1>${esc(config.title)}</h1><p>${esc(config.date)} · ساعت ${esc(config.time)} · ${esc(config.sourceLabel)}</p><div class="meta"><span>${members.length} عضو</span><span>داده از یک منبع واحد</span><span>نمایش ساده و گرافیکی از همان داده</span></div></section><section class="toolbar"><input id="search" class="search" type="search" placeholder="جست‌وجوی نام کاربری، سمت یا مقدار..."><div class="switch"><button data-mode="simple">نمایش ساده</button><button data-mode="graphic">نمایش گرافیکی</button></div></section><div id="results"></div>${nav}`;
    const results=root.querySelector('#results'), input=root.querySelector('#search'), sb=root.querySelector('[data-mode="simple"]'), gb=root.querySelector('[data-mode="graphic"]');
    let current=mode;
    const render=()=>{
      const q=input.value.trim().toLowerCase();
      let list=members.filter(m=>([m.rank,m.name,m.role,m.movement,...Object.values(m.stats)].join(' ').toLowerCase()).includes(q));
      if (sortIndex !== null) {
        const key = keys[sortIndex-3];
        list = [...list].sort((a,b)=>{
          const av=valueForSort(a,key,sortIndex), bv=valueForSort(b,key,sortIndex);
          if (av === bv) return 0;
          if (av === null) return 1;
          if (bv === null) return -1;
          return (av < bv ? -1 : 1) * sortDirection;
        });
      }
      results.innerHTML=`<div class="count">${list.length} نتیجه</div>`+(current==='simple'?table(list):`<div class="members">${list.map(cardView).join('')}</div>`);
      sb.classList.toggle('active',current==='simple');gb.classList.toggle('active',current==='graphic');
      root.querySelectorAll('[data-sort-index]').forEach(btn=>btn.addEventListener('click',()=>{
        const index=Number(btn.dataset.sortIndex);
        if(sortIndex===index) sortDirection*=-1; else {sortIndex=index;sortDirection=1;}
        render();
      }));
      if (sortIndex !== null) {
        const active=root.querySelector(`[data-sort-index="${sortIndex}"] .sort-indicator`);
        if(active) active.textContent=sortDirection===1?'↑':'↓';
      }
    };
    input.addEventListener('input',render); sb.addEventListener('click',()=>{current='simple';render()}); gb.addEventListener('click',()=>{current='graphic';render()}); render();
  }).catch(()=>{root.innerHTML='<p class="error">منبع داده قابل بارگذاری نیست.</p>'+nav;});
})();
