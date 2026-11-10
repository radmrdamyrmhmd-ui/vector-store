import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { query } from '../db.js';
import { productRow, orderRow } from '../mappers.js';
import { requireAdmin } from '../auth.js';

const router = express.Router();
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads';
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|avif|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error('فقط فایل تصویری مجاز است.'), ok);
  },
});

router.use(requireAdmin);

router.get('/stats', async (_req, res, next) => {
  try {
    const [{ rows: products }, { rows: orders }, { rows: users }, { rows: revenue }] = await Promise.all([
      query('select count(*)::int as count from products'),
      query("select count(*)::int as count, count(*) filter (where status = 'pending')::int as pending from orders"),
      query("select count(*)::int as count from users where role = 'customer'"),
      query("select coalesce(sum(total),0)::int as sum from orders where status <> 'cancelled'"),
    ]);
    res.json({
      products: products[0].count,
      orders: orders[0].count,
      pendingOrders: orders[0].pending,
      customers: users[0].count,
      revenue: revenue[0].sum,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/products', async (_req, res, next) => {
  try {
    const { rows } = await query('select * from products order by id desc');
    res.json({ items: rows.map(productRow) });
  } catch (error) {
    next(error);
  }
});

function slugify(value, fallback) {
  const base = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `${fallback}-${Date.now().toString(36)}`;
}

function payloadFromBody(body) {
  const asArray = (value) => (Array.isArray(value) ? value.map((v) => String(v).trim()).filter(Boolean) : []);
  return {
    slug: slugify(body.slug || body.nameEn || body.nameFa, 'yas'),
    nameEn: String(body.nameEn || '').trim(),
    nameFa: String(body.nameFa || '').trim(),
    category: String(body.category || 'lifestyle'),
    gender: ['male', 'female', 'unisex'].includes(body.gender) ? body.gender : 'unisex',
    price: Math.max(0, Math.round(Number(body.price) || 0)),
    oldPrice: body.oldPrice ? Math.max(0, Math.round(Number(body.oldPrice))) : null,
    shortDesc: String(body.shortDesc || '').trim(),
    description: String(body.description || '').trim(),
    images: asArray(body.images),
    sizes: asArray(body.sizes),
    colors: asArray(body.colors),
    stock: Math.max(0, Math.round(Number(body.stock) || 0)),
    isNew: Boolean(body.isNew),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}

router.post('/products', async (req, res, next) => {
  try {
    const data = payloadFromBody(req.body);
    if (!data.nameFa || !data.nameEn) return res.status(400).json({ error: 'نام فارسی و لاتین محصول الزامی است.' });
    if (!data.price) return res.status(400).json({ error: 'قیمت محصول را وارد کنید.' });
    const { rows } = await query(
      `insert into products (slug, name_en, name_fa, category, gender, price, old_price, short_desc, description, images, sizes, colors, stock, is_new, is_active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13,$14,$15) returning *`,
      [
        data.slug,
        data.nameEn,
        data.nameFa,
        data.category,
        data.gender,
        data.price,
        data.oldPrice,
        data.shortDesc,
        data.description,
        JSON.stringify(data.images),
        JSON.stringify(data.sizes),
        JSON.stringify(data.colors),
        data.stock,
        data.isNew,
        data.isActive,
      ],
    );
    res.status(201).json({ product: productRow(rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'این شناسه محصول قبلاً استفاده شده است.' });
    next(error);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const data = payloadFromBody(req.body);
    const { rows } = await query(
      `update products set slug=$1, name_en=$2, name_fa=$3, category=$4, gender=$5, price=$6, old_price=$7,
        short_desc=$8, description=$9, images=$10::jsonb, sizes=$11::jsonb, colors=$12::jsonb,
        stock=$13, is_new=$14, is_active=$15 where id=$16 returning *`,
      [
        data.slug,
        data.nameEn,
        data.nameFa,
        data.category,
        data.gender,
        data.price,
        data.oldPrice,
        data.shortDesc,
        data.description,
        JSON.stringify(data.images),
        JSON.stringify(data.sizes),
        JSON.stringify(data.colors),
        data.stock,
        data.isNew,
        data.isActive,
        Number(req.params.id),
      ],
    );
    if (!rows[0]) return res.status(404).json({ error: 'محصول پیدا نشد.' });
    res.json({ product: productRow(rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'این شناسه محصول قبلاً استفاده شده است.' });
    next(error);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    await query('delete from products where id = $1', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'فایل تصویری ارسال نشد.' });
  res.status(201).json({ url: `/api/uploads/${req.file.filename}` });
});

router.get('/orders', async (_req, res, next) => {
  try {
    const { rows } = await query('select * from orders order by id desc limit 200');
    res.json({ items: rows.map(orderRow) });
  } catch (error) {
    next(error);
  }
});

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

router.patch('/orders/:id', async (req, res, next) => {
  try {
    const status = String(req.body.status || '');
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'وضعیت سفارش معتبر نیست.' });
    const { rows } = await query('update orders set status = $1 where id = $2 returning *', [
      status,
      Number(req.params.id),
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'سفارش پیدا نشد.' });
    res.json({ order: orderRow(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.get('/customers', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `select u.id, u.name, u.email, u.created_at,
              count(o.id)::int as orders_count,
              coalesce(sum(o.total), 0)::int as total_spent
       from users u left join orders o on o.user_id = u.id
       where u.role = 'customer'
       group by u.id order by u.id desc`,
    );
    res.json({
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.created_at,
        ordersCount: row.orders_count,
        totalSpent: row.total_spent,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `select c.slug, c.name, c.sort, count(p.id)::int as products_count
       from categories c left join products p on p.category = c.slug
       group by c.slug, c.name, c.sort order by c.sort asc`,
    );
    res.json({ items: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const slug = slugify(req.body.slug || req.body.name, 'category');
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'نام دسته‌بندی الزامی است.' });
    const { rows } = await query(
      'insert into categories (slug, name, sort) values ($1,$2,$3) returning *',
      [slug, name, Number(req.body.sort) || 99],
    );
    res.status(201).json({ category: rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'این دسته‌بندی قبلاً ثبت شده است.' });
    next(error);
  }
});

router.delete('/categories/:slug', async (req, res, next) => {
  try {
    const { rows } = await query('select count(*)::int as count from products where category = $1', [
      req.params.slug,
    ]);
    if (rows[0].count > 0) {
      return res.status(409).json({ error: 'این دسته‌بندی محصول دارد و حذف نمی‌شود.' });
    }
    await query('delete from categories where slug = $1', [req.params.slug]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
