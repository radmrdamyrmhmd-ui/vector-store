import bcrypt from 'bcryptjs';
import { query } from './db.js';

const SCHEMA = `
create table if not exists users (
  id serial primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists categories (
  slug text primary key,
  name text not null,
  sort int not null default 0
);

create table if not exists products (
  id serial primary key,
  slug text unique not null,
  name_en text not null,
  name_fa text not null,
  category text not null,
  gender text not null default 'unisex',
  price int not null,
  old_price int,
  short_desc text default '',
  description text default '',
  images jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  stock int not null default 0,
  is_new boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id serial primary key,
  code text unique not null,
  user_id int references users(id) on delete set null,
  customer jsonb not null,
  items jsonb not null,
  subtotal int not null,
  shipping int not null default 0,
  total int not null,
  status text not null default 'pending',
  note text default '',
  created_at timestamptz not null default now()
);

create table if not exists newsletter (
  id serial primary key,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id serial primary key,
  name text not null,
  email text not null,
  phone text default '',
  subject text default '',
  body text not null,
  created_at timestamptz not null default now()
);
`;

const CATEGORIES = [
  { slug: 'running', name: 'کفش دویدن', sort: 1 },
  { slug: 'training', name: 'کفش تمرینی', sort: 2 },
  { slug: 'lifestyle', name: 'کفش روزمره', sort: 3 },
  { slug: 'walking', name: 'کفش پیاده‌روی', sort: 4 },
  { slug: 'apparel', name: 'پوشاک ورزشی', sort: 5 },
];

const SHOE_SIZES = ['39', '40', '41', '42', '43', '44', '45'];
const CLOTH_SIZES = ['S', 'M', 'L', 'XL'];

const PRODUCTS = [
  {
    slug: 'yas-runner-pro',
    name_en: 'YAS RUNNER PRO',
    name_fa: 'یاس رانر پرو',
    category: 'running',
    gender: 'male',
    price: 2990000,
    old_price: 3290000,
    short_desc: 'کتانی رانینگ حرفه‌ای خاکستری و سفید',
    description:
      'یاس رانر پرو برای دویدن‌های طولانی و تمرین‌های روزانه طراحی شده است. فوم میانی سبک با بازگشت انرژی بالا، شوک‌های پا را جذب می‌کند و رویه بافت‌دار آن تنفس‌پذیری کاملی در مسیرهای شهری ایجاد می‌کند. زیره لاستیکی با آج چندلایه، چسبندگی مطمئنی روی آسفالت خشک و خیس دارد.',
    images: ['/images/product-runner-pro.jpg'],
    sizes: SHOE_SIZES,
    colors: ['خاکستری', 'سفید'],
    stock: 24,
    is_new: true,
  },
  {
    slug: 'yas-force',
    name_en: 'YAS FORCE',
    name_fa: 'یاس فورس',
    category: 'training',
    gender: 'unisex',
    price: 2790000,
    short_desc: 'کتانی تمرینی مشکی با طراحی مدرن',
    description:
      'یاس فورس با زیره پهن و پایه‌ی ثابت، برای تمرین‌های قدرتی و حرکات چندجهته ساخته شده است. قسمت پاشنه با یک قاب سخت پشتیبانی می‌شود تا در اسکات و ددلیفت پا ثابت بماند. رویه‌ی مشبک مشکی، وزن را پایین نگه می‌دارد و تهویه‌ی مناسبی دارد.',
    images: ['/images/product-force.jpg'],
    sizes: SHOE_SIZES,
    colors: ['مشکی', 'خاکستری تیره'],
    stock: 18,
    is_new: true,
  },
  {
    slug: 'yas-urban',
    name_en: 'YAS URBAN',
    name_fa: 'یاس اوربان',
    category: 'lifestyle',
    gender: 'female',
    price: 2490000,
    short_desc: 'کتانی کرم و بژ با طراحی مینیمال',
    description:
      'یاس اوربان یک کتانی روزمره با خطوط ساده و پالت رنگی کرم و بژ است. رویه‌ی جیر مصنوعی با دوخت تمیز، ترکیبی آرام با استایل شهری می‌سازد. کفی نرم و قابل تعویض، راحتی تمام‌روز را در پیاده‌روی‌های کوتاه و بلند فراهم می‌کند.',
    images: ['/images/product-urban.jpg'],
    sizes: SHOE_SIZES,
    colors: ['کرم', 'بژ'],
    stock: 31,
    is_new: true,
  },
  {
    slug: 'yas-aero-wind',
    name_en: 'YAS AERO WIND',
    name_fa: 'یاس ایرو ویند',
    category: 'running',
    gender: 'unisex',
    price: 3190000,
    short_desc: 'کتانی دویدن سبک با رویه تنفس‌پذیر',
    description:
      'ایرو ویند سبک‌ترین مدل کالکشن یاس است. رویه‌ی تک‌لایه و پنجره‌های تهویه، گرمای پا را در دویدن‌های سریع تخلیه می‌کنند و فوم میانی با ضخامت متغیر، انتقال وزن را نرم می‌کند.',
    images: ['/images/product-aero.jpg'],
    sizes: SHOE_SIZES,
    colors: ['سفید', 'نقره‌ای'],
    stock: 12,
    is_new: false,
  },
  {
    slug: 'yas-night-run',
    name_en: 'YAS NIGHT RUN',
    name_fa: 'یاس نایت ران',
    category: 'running',
    gender: 'male',
    price: 3490000,
    short_desc: 'کتانی دویدن شب با جزئیات بازتابنده',
    description:
      'نایت ران برای دویدن در ساعات کم‌نور ساخته شده است؛ نوارهای بازتابنده روی پاشنه و پهلو، دید راننده‌ها را در شب افزایش می‌دهند. زیره‌ی ضدلغزش و کفی پرشدت، حس اطمینان را در مسیرهای ناهموار بیشتر می‌کند.',
    images: ['/images/product-night.jpg'],
    sizes: SHOE_SIZES,
    colors: ['مشکی', 'سفید'],
    stock: 9,
    is_new: false,
  },
  {
    slug: 'yas-pulse-court',
    name_en: 'YAS PULSE COURT',
    name_fa: 'یاس پالس کورت',
    category: 'lifestyle',
    gender: 'unisex',
    price: 2890000,
    short_desc: 'کتانی استریت با سیلوئت کلاسیک',
    description:
      'پالس کورت از کفش‌های بسکتبال دهه هشتاد الهام گرفته و با نسبت‌های امروزی بازطراحی شده است. ساق کوتاه، زیره‌ی مسطح و دوخت دوبل، ترکیبی از دوام و استایل روزمره است.',
    images: ['/images/product-pulse.jpg'],
    sizes: SHOE_SIZES,
    colors: ['سفید', 'مشکی'],
    stock: 21,
    is_new: true,
  },
  {
    slug: 'yas-cloud-walk',
    name_en: 'YAS CLOUD WALK',
    name_fa: 'یاس کلود واک',
    category: 'walking',
    gender: 'female',
    price: 2290000,
    short_desc: 'کتانی پیاده‌روی با کفی نرم و سبک',
    description:
      'کلود واک برای ساعت‌های طولانی راه‌رفتن طراحی شده است. فوم میانی ضخیم، ضربه‌ها را پخش می‌کند و رویه‌ی کشباف، فشار روی پنجه را کاهش می‌دهد. مناسب استفاده‌ی روزمره، سفر و پیاده‌روی شهری.',
    images: ['/images/product-cloud.jpg'],
    sizes: SHOE_SIZES,
    colors: ['سفید', 'کرم'],
    stock: 27,
    is_new: false,
  },
  {
    slug: 'yas-bold-trainer',
    name_en: 'YAS BOLD TRAINER',
    name_fa: 'یاس بولد ترینر',
    category: 'training',
    gender: 'unisex',
    price: 3090000,
    short_desc: 'کتانی تمرینی با سیلوئت حجیم',
    description:
      'بولد ترینر برای تمرین‌های ترکیبی و کراس‌فیت ساخته شده است. زیره‌ی چندلایه با پایداری بالا، در حرکات انفجاری کنترل بهتری می‌دهد و رویه‌ی تقویت‌شده در برابر سایش مقاوم است.',
    images: ['/images/product-bold.jpg'],
    sizes: SHOE_SIZES,
    colors: ['خاکستری', 'سفید'],
    stock: 14,
    is_new: false,
  },
  {
    slug: 'yas-grid-trainer',
    name_en: 'YAS GRID TRAINER',
    name_fa: 'یاس گرید ترینر',
    category: 'training',
    gender: 'male',
    price: 2690000,
    short_desc: 'کتانی تمرینی روزمره با دوخت مقاوم',
    description:
      'گرید ترینر کفش تمرینی همه‌کاره‌ی یاس است. ساختار سبک، پنجه‌ی منعطف و پایداری جانبی متناسب، آن را برای تمرین در باشگاه و استفاده‌ی روزمره مناسب می‌کند.',
    images: ['/images/product-grid.jpg'],
    sizes: SHOE_SIZES,
    colors: ['سفید', 'خاکستری'],
    stock: 16,
    is_new: false,
  },
  {
    slug: 'yas-sport-tee',
    name_en: 'YAS SPORT TEE',
    name_fa: 'تیشرت ورزشی یاس',
    category: 'apparel',
    gender: 'male',
    price: 890000,
    short_desc: 'تیشرت ورزشی نخی با برش راحت',
    description:
      'تیشرت ورزشی یاس از نخ پنبه‌ی سنگین با دوخت تقویت‌شده تولید شده است. برش راحت و شانه‌های افتاده، آزادی حرکت را در تمرین حفظ می‌کند و بافت پارچه بعد از شست‌وشو فرم خود را نگه می‌دارد.',
    images: ['/images/apparel-tee.jpg'],
    sizes: CLOTH_SIZES,
    colors: ['مشکی', 'سفید'],
    stock: 40,
    is_new: false,
  },
  {
    slug: 'yas-tech-hoodie',
    name_en: 'YAS TECH HOODIE',
    name_fa: 'هودی تکنیکال یاس',
    category: 'apparel',
    gender: 'unisex',
    price: 1590000,
    short_desc: 'هودی ورزشی با پارچه تکنیکال',
    description:
      'هودی تکنیکال یاس برای روزهای خنک طراحی شده است. پارچه‌ی دولایه با مدیریت رطوبت، در طول تمرین خشک می‌ماند و کلاه دوبل با بند مخفی، فرم سرم را ثابت نگه می‌دارد.',
    images: ['/images/apparel-hoodie.jpg'],
    sizes: CLOTH_SIZES,
    colors: ['مشکی', 'خاکستری'],
    stock: 22,
    is_new: true,
  },
];

export async function bootstrap() {
  await query(SCHEMA);

  for (const category of CATEGORIES) {
    await query(
      'insert into categories (slug, name, sort) values ($1, $2, $3) on conflict (slug) do nothing',
      [category.slug, category.name, category.sort],
    );
  }

  const { rows: productCount } = await query('select count(*)::int as count from products');
  if (productCount[0].count === 0) {
    for (const product of PRODUCTS) {
      await query(
        `insert into products
          (slug, name_en, name_fa, category, gender, price, old_price, short_desc, description, images, sizes, colors, stock, is_new)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13,$14)`,
        [
          product.slug,
          product.name_en,
          product.name_fa,
          product.category,
          product.gender,
          product.price,
          product.old_price || null,
          product.short_desc,
          product.description,
          JSON.stringify(product.images),
          JSON.stringify(product.sizes),
          JSON.stringify(product.colors),
          product.stock,
          product.is_new,
        ],
      );
    }
    console.log(`[yas] seeded ${PRODUCTS.length} products`);
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@yas-sports.ir').toLowerCase();
  const { rows: adminRows } = await query('select id from users where email = $1', [adminEmail]);
  if (!adminRows[0]) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'yasadmin1405', 10);
    await query(
      'insert into users (name, email, password_hash, role) values ($1,$2,$3,$4)',
      [process.env.ADMIN_NAME || 'مدیر یاس اسپورت', adminEmail, passwordHash, 'admin'],
    );
    console.log(`[yas] created admin account ${adminEmail}`);
  }
}
