(()=>{
const base='assets/images/guides/';
const legacy={
'65144':'01-resources-cash-gold.jpg',
'65145':'02-pilot-lounge.jpg',
'65148':'04-farm-stage-28.jpg',
'65150':'06-difficulty-experimental-armor.jpg',
'65152':'07-gold-supply-drop.jpg',
'65155':'09-clan-chest-purple.jpg',
'65156':'11-weapon-upgrade-costs.jpg'
};

document.querySelectorAll('[data-guide-image]').forEach(img=>{
  const ref=img.getAttribute('data-guide-image');
  if(legacy[ref]) img.src=base+legacy[ref];
});

const image=(file,alt,caption)=>{
  const fig=document.createElement('figure');
  fig.className='inline-shot';
  const img=document.createElement('img');
  img.src=base+file; img.alt=alt; img.loading='lazy';
  const cap=document.createElement('figcaption'); cap.textContent=caption;
  fig.append(img,cap); return fig;
};
const gallery=(items,label)=>{
  const wrap=document.createElement('div');
  wrap.className='inline-gallery';
  if(label){const t=document.createElement('div');t.className='inline-gallery-title';t.textContent=label;wrap.append(t);}
  const grid=document.createElement('div');grid.className='inline-gallery-grid';
  items.forEach(x=>grid.append(image(x[0],x[1],x[2])));wrap.append(grid);return wrap;
};

const guides=[...document.querySelectorAll('#academy .guide-card')];
const guide=n=>guides.find(x=>x.querySelector('.guide-no')?.textContent.trim()===String(n).padStart(2,'0'));
const place=(n,items,label,after=1)=>{
  const card=guide(n); if(!card)return;
  card.classList.remove('visual-guide');
  card.querySelectorAll(':scope > .guide-media,:scope > .guide-media-pair').forEach(el=>el.remove());
  const body=card.querySelector('.guide-body'); if(!body)return;
  const paragraphs=body.querySelectorAll('p,.mini-list,.tip');
  const anchor=paragraphs[Math.min(after-1,paragraphs.length-1)] || body.querySelector('h3');
  const g=gallery(items,label);
  anchor?.insertAdjacentElement('afterend',g);
};

place(1,[
 ['01-resources-cash-gold.jpg','Cash و Gold در فروشگاه War Drone','Cash سبزرنگ و Gold طلایی؛ دو منبع اصلی بازی.']
],'منابع بازی',1);

place(2,[
 ['02-pilot-lounge.jpg','Pilot Lounge','از صفحه اصلی وارد Pilot Lounge شوید.'],
 ['03-daily-rewards.jpg','Daily Rewards','نمونه صفحه Daily Rewards؛ Cash، Gold، Chest، Energy و Ticket در چرخه پاداش دیده می‌شوند.']
],'دریافت منابع روزانه',1);

place(3,[
 ['04-farm-stage-28.jpg','فارم Stage 28','نمونه پایان 99٪ و دریافت Cash در Stage 28.'],
 ['05-farm-stage-39.jpg','فارم Stage 39','نمونه دیگر از توقف 99٪ و گزینه ویدئویی +50٪.']
],'ترفند فارم 99٪ در عمل',1);

place(4,[
 ['06-difficulty-experimental-armor.jpg','Experimental Armor','پیام خود بازی درباره جهش زره دشمن و Level پیشنهادی 25mm Gun.']
],'هشدار جهش سختی',1);

place(5,[
 ['07-gold-supply-drop.jpg','Gold Supply Drop','این همان Gold Supply Drop است؛ نسخه 50x، Mythic تضمینی دارد.'],
 ['08-gold-supply-drop-contents.jpg','محتویات Gold Supply Drop','نمونه کارت‌های Mythic و Legendary موجود در Gold Supply Drop.'],
 ['09-clan-chest-purple.jpg','Clan Chest بنفش','منظور از چست بنفش یا Clan Chest همین جعبه 2,000 Gold است.'],
 ['10-clan-chest-card-contents.jpg','کارت‌های Clan Chest','نمونه کارت‌های داخل Clan Chest؛ کارت‌های اختصاصی Clan Medal نیز در این مجموعه دیده می‌شوند.']
],'جعبه‌ها را از روی ظاهرشان بشناس',1);

place(6,[
 ['11-weapon-upgrade-costs.jpg','هزینه ارتقای سلاح‌ها','نمونه واقعی هزینه Upgrade برای 25mm Gun، Hydra-70 و Hellfire.']
],'تعادل ارتقای سه سلاح اصلی',1);

place(7,[
 ['12-daily-missions.jpg','Daily Missions','نمونه مأموریت‌های روزانه شامل Upgrade کردن سلاح‌ها.']
],'نمونه Daily Mission',1);

place(8,[
 ['13-buff-loadout-progress.jpg','Buff برای Progression','چیدمان پیشنهادی برای Stage سخت؛ تمرکز روی Damage و توان عبور.'],
 ['14-buff-loadout-farm.jpg','Buff برای Farming','چیدمان پیشنهادی برای Stage فارم؛ تمرکز روی سرعت و بازده Run.']
],'دو Loadout برای دو هدف متفاوت',1);

place(9,[
 ['15-clan-frenzy.jpg','Clan Frenzy','توضیح داخل بازی: Killهای Campaign نوار Frenzy را پر می‌کنند و در Frenzy دشمنان مدال‌دار بیشتر ظاهر می‌شوند.']
],'Frenzy داخل بازی',1);

place(10,[
 ['16-clan-strike.jpg','Clan Strike','صفحه Mission Briefing؛ Reward per Kill و گزینه Play With Ticket مشخص است.'],
 ['17-clan-strike-reward.jpg','Clan Strike Reward','نمونه Reward پایان Clan Strike و گزینه افزایش +25٪ با ویدئو.'],
 ['09-clan-chest-purple.jpg','Ticket از Clan Chest','Clan Chest علاوه بر کارت و Clan Medal، سه Ticket هم می‌دهد.']
],'چرخه Ticket و Clan Strike',1);

const cards=document.querySelector('#cards .card-intro');
if(cards){
  cards.insertAdjacentElement('afterend',gallery([
    ['10-clan-chest-card-contents.jpg','کارت‌های اختصاصی Clan Medal','چهار کارت Clan Medal در همین مجموعه قرار دارند: Spotter، Bonus، Buster و Breaker.'],
    ['13-buff-loadout-progress.jpg','نمونه صفحه Buff','نمونه انتخاب کارت‌ها و Slotهای Buff برای ساخت Loadout.']
  ],'مرجع تصویری کارت‌ها و Buff'));
}
})();