(() => {
'use strict';
const cards=[
{name:'Clan Medal Spotter',kind:'Clan / Frenzy',rarity:'Clan card',effect:'شانس پیدا شدن دشمن‌های دارای مارک طلایی را افزایش می‌دهد.',use:'بهترین انتخاب برای افزایش تعداد Targetهای مدال‌دار در Frenzy؛ مستقل از سلاح کشتن، روی فرصت امتیازگیری اثر می‌گذارد.',with:'Frenzy + Stage پرتراکم',value:'خیلی بالا برای کلن'},
{name:'Clan Medal Bonus',kind:'Clan / 25mm',rarity:'Clan card',effect:'امتیاز دریافت‌شده از دشمن طلایی که با 25mm Gun کشته شود را افزایش می‌دهد.',use:'برای Stageهایی که 25mm می‌تواند دشمن‌های طلایی را سریع پاک کند.',with:'25mm Gun',value:'خیلی بالا در Frenzy'},
{name:'Clan Medal Buster',kind:'Clan / Hydra',rarity:'Clan card',effect:'امتیاز دشمن طلایی کشته‌شده با Hydra-70 را افزایش می‌دهد.',use:'برای موج‌های متراکم و اهدافی که Hydra سریع‌تر جمع می‌کند.',with:'Hydra-70',value:'بالا در Frenzy'},
{name:'Clan Medal Breaker',kind:'Clan / Hellfire',rarity:'Clan card',effect:'امتیاز دشمن طلایی کشته‌شده با Hellfire را افزایش می‌دهد.',use:'برای اهداف زرهی/ارزشمند که با Hellfire حذف می‌شوند.',with:'Hellfire',value:'بالا در Frenzy'},
{name:'MKII 25mm Gun',kind:'Weapon Buff',rarity:'Weapon card',effect:'در داده‌های تصویری به‌عنوان کارت ارتقای 25mm و افزایش Damage دیده شده است.',use:'Progress، Stage سخت و بالا بردن توان سلاح اصلی.',with:'25mm Gun',value:'هسته‌ای'},
{name:'Large Linkless Mag',kind:'Ammo Buff',rarity:'Weapon card',effect:'کارت مرتبط با ظرفیت/مهمات 25mm؛ Level کارت در ویدیوی Stage 66 دیده شده است.',use:'Runهای طولانی و Stageهایی که کمبود Ammo عامل شکست است.',with:'25mm Gun',value:'بالا'},
{name:'MKII Hydra-70',kind:'Weapon Buff',rarity:'Weapon card',effect:'تقویت Hydra-70؛ برای پاکسازی گروه‌ها و موج‌های متراکم مهم است.',use:'Progress و Crowd clearing.',with:'Hydra-70',value:'بالا'},
{name:'MKII Hellfire',kind:'Weapon Buff',rarity:'Weapon card',effect:'تقویت Hellfire برای اهداف سنگین و زرهی.',use:'تانک، APC و اهدافی که 25mm/Hydra زمان زیادی برای حذفشان می‌خواهند.',with:'Hellfire',value:'بالا'},
{name:'Water Buster / Water Breaker',kind:'Mission Buff',rarity:'Situational',effect:'در داده ویدیویی Stage 42 برای تهدیدهای دریایی توصیه شده‌اند.',use:'مراحل آبی و موج‌های دریایی.',with:'Loadout دریایی',value:'بسیار بالا در Stage مناسب'},
{name:'Third Time Lucky',kind:'Survival Buff',rarity:'Situational',effect:'در تحلیل ویدیویی Stage 42 به‌عنوان کارت مفید برای بقا مطرح شده است.',use:'Stageهای سخت که شکست در موج‌های پایانی رخ می‌دهد.',with:'Deck دفاعی',value:'موقعیتی'},
{name:'Nuke It From Orbit',kind:'Mythic / Superweapon',rarity:'Mythic',effect:'کارت Mythic مشاهده‌شده در Gold Supply Drop؛ در داده ویدیویی با قابلیت مرتبط با حمله هسته‌ای معرفی شده است.',use:'موج‌های بسیار سخت؛ به‌عنوان کارت کمیاب، Gold را فقط برای Chase کردن یک کارت خاص هدر نده.',with:'Superweapon',value:'بسیار کمیاب'},
{name:'Raptor',kind:'Reinforcement',rarity:'Rare/upgradeable',effect:'کارت Reinforcement؛ Level 7 در ویدیوی Stage 66 دیده شده و در Stage 42 برای مقابله با تهدیدهای هوایی/موشکی مفید گزارش شده است.',use:'پشتیبانی هوایی و Stageهای دارای تهدید هوایی.',with:'Support / Reinforcement',value:'بالا در مأموریت مناسب'},
{name:'Harrier',kind:'Reinforcement',rarity:'Reinforcement',effect:'در Stage 42 به‌عنوان پشتیبانی مهم برای مقابله با تهدیدهای دریایی/هوایی استفاده شده است.',use:'Stageهای چندتهدیدی.',with:'Raptor / Support deck',value:'بالا در مأموریت مناسب'}
];
const grid=document.getElementById('cardGrid');
if(!grid)return;
grid.innerHTML=cards.map(c=>`<article class="card-intel"><div class="card-top"><span>${c.rarity}</span><b>${c.kind}</b></div><h3>${c.name}</h3><p>${c.effect}</p><dl><div><dt>کاربرد پیشنهادی</dt><dd>${c.use}</dd></div><div><dt>ترکیب با</dt><dd>${c.with}</dd></div><div><dt>ارزش</dt><dd>${c.value}</dd></div></dl></article>`).join('');
})();