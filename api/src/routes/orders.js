import express from 'express';
import { query, withTransaction } from '../db.js';
import { orderRow } from '../mappers.js';
import { requireAuth } from '../auth.js';

const router = express.Router();
const SHIPPING_FEE = Number(process.env.SHIPPING_FEE || 49000);

function orderCode() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `YS-${stamp}${rand}`;
}

function validateCustomer(customer = {}) {
  const fields = {
    fullName: 'نام و نام خانوادگی',
    mobile: 'شماره موبایل',
    province: 'استان',
    city: 'شهر',
    address: 'آدرس',
    postalCode: 'کد پستی',
  };
  for (const [key, label] of Object.entries(fields)) {
    if (!String(customer[key] || '').trim()) return `${label} را وارد کنید.`;
  }
  if (!/^09\d{9}$/.test(String(customer.mobile).replace(/\s/g, ''))) {
    return 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.';
  }
  if (!/^\d{10}$/.test(String(customer.postalCode).replace(/\s/g, ''))) {
    return 'کد پستی باید ۱۰ رقم باشد.';
  }
  return null;
}

router.post('/', async (req, res, next) => {
  try {
    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    if (!rawItems.length) return res.status(400).json({ error: 'سبد خرید شما خالی است.' });

    const error = validateCustomer(req.body.customer);
    if (error) return res.status(400).json({ error });

    const order = await withTransaction(async (client) => {
      const items = [];
      let subtotal = 0;

      for (const raw of rawItems) {
        const productId = Number(raw.productId);
        const quantity = Math.max(1, Math.min(Number(raw.quantity) || 1, 10));
        const { rows } = await client.query('select * from products where id = $1 for update', [productId]);
        const product = rows[0];
        if (!product || !product.is_active) {
          throw Object.assign(new Error('یکی از محصولات سبد خرید دیگر موجود نیست.'), { status: 400 });
        }
        const size = String(raw.size || '');
        if (!(product.sizes || []).includes(size)) {
          throw Object.assign(new Error(`سایز انتخاب‌شده برای ${product.name_fa} معتبر نیست.`), { status: 400 });
        }
        const color = raw.color ? String(raw.color) : '';
        if (color && !(product.colors || []).includes(color)) {
          throw Object.assign(new Error(`رنگ انتخاب‌شده برای ${product.name_fa} معتبر نیست.`), { status: 400 });
        }
        if (product.stock < quantity) {
          throw Object.assign(new Error(`موجودی ${product.name_fa} کافی نیست.`), { status: 409 });
        }

        await client.query('update products set stock = stock - $1 where id = $2', [quantity, product.id]);

        items.push({
          productId: product.id,
          slug: product.slug,
          name: product.name_fa,
          nameEn: product.name_en,
          image: (product.images || [])[0] || '',
          size,
          color,
          quantity,
          price: product.price,
          lineTotal: product.price * quantity,
        });
        subtotal += product.price * quantity;
      }

      const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
      const total = subtotal + shipping;
      const code = orderCode();

      const { rows } = await client.query(
        `insert into orders (code, user_id, customer, items, subtotal, shipping, total, status, note)
         values ($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7,'pending',$8) returning *`,
        [
          code,
          req.user?.id || null,
          JSON.stringify(req.body.customer),
          JSON.stringify(items),
          subtotal,
          shipping,
          total,
          String(req.body.note || '').slice(0, 1000),
        ],
      );
      return orderRow(rows[0]);
    });

    res.status(201).json({ order });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
});

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('select * from orders where user_id = $1 order by id desc', [req.user.id]);
    res.json({ items: rows.map(orderRow) });
  } catch (error) {
    next(error);
  }
});

router.get('/code/:code', async (req, res, next) => {
  try {
    const { rows } = await query('select * from orders where code = $1', [req.params.code]);
    const order = rows[0];
    if (!order) return res.status(404).json({ error: 'سفارش پیدا نشد.' });
    if (order.user_id && (!req.user || req.user.id !== order.user_id) && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'دسترسی به این سفارش مجاز نیست.' });
    }
    res.json({ order: orderRow(order) });
  } catch (error) {
    next(error);
  }
});

export default router;
