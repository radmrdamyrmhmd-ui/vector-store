import express from 'express';
import { query } from '../db.js';
import { productRow } from '../mappers.js';

const router = express.Router();
const SORTS = {
  newest: 'created_at desc, id desc',
  'price-asc': 'price asc',
  'price-desc': 'price desc',
  popular: 'id asc',
};

router.get('/', async (req, res, next) => {
  try {
    const { category, gender, q, min, max, size, color, sort, limit } = req.query;
    const where = ['is_active = true'];
    const params = [];

    if (category) {
      params.push(String(category));
      where.push(`category = $${params.length}`);
    }
    if (gender && gender !== 'all') {
      params.push(String(gender));
      where.push(`(gender = $${params.length} or gender = 'unisex')`);
    }
    if (q) {
      params.push(`%${String(q).trim()}%`);
      where.push(
        `(name_fa ilike $${params.length} or name_en ilike $${params.length} or short_desc ilike $${params.length})`,
      );
    }
    if (min !== undefined && min !== '') {
      params.push(Number(min));
      where.push(`price >= $${params.length}`);
    }
    if (max !== undefined && max !== '') {
      params.push(Number(max));
      where.push(`price <= $${params.length}`);
    }
    if (size) {
      params.push(JSON.stringify([String(size)]));
      where.push(`sizes @> $${params.length}::jsonb`);
    }
    if (color) {
      params.push(JSON.stringify([String(color)]));
      where.push(`colors @> $${params.length}::jsonb`);
    }

    const orderBy = SORTS[String(sort)] || SORTS.newest;
    const maxRows = Math.min(Number(limit) || 60, 120);
    params.push(maxRows);

    const sql = `select * from products where ${where.join(' and ')} order by ${orderBy} limit $${params.length}`;
    const { rows } = await query(sql, params);
    const countSql = `select count(*)::int as count from products where ${where.join(' and ')}`;
    const { rows: countRows } = await query(countSql, params.slice(0, params.length - 1));

    res.json({ items: rows.map(productRow), total: countRows[0].count });
  } catch (error) {
    next(error);
  }
});

router.get('/filters', async (_req, res, next) => {
  try {
    const { rows: categories } = await query('select slug, name from categories order by sort asc');
    const { rows: stats } = await query(
      `select coalesce(min(price), 0)::int as min, coalesce(max(price), 0)::int as max from products where is_active = true`,
    );
    const { rows: facets } = await query(
      `select sizes, colors from products where is_active = true`,
    );
    const sizes = new Set();
    const colors = new Set();
    for (const row of facets) {
      (row.sizes || []).forEach((size) => sizes.add(size));
      (row.colors || []).forEach((color) => colors.add(color));
    }
    const sizeOrder = ['S', 'M', 'L', 'XL'];
    const sortedSizes = [...sizes].sort((a, b) => {
      const ai = sizeOrder.indexOf(a);
      const bi = sizeOrder.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return Number(a) - Number(b);
    });
    res.json({
      categories,
      priceRange: stats[0],
      sizes: sortedSizes,
      colors: [...colors],
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await query('select * from products where slug = $1 and is_active = true', [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: 'این محصول پیدا نشد.' });
    const product = productRow(rows[0]);

    const { rows: relatedRows } = await query(
      `select * from products
        where is_active = true and category = $1 and id <> $2
        order by is_new desc, id asc limit 4`,
      [product.category, product.id],
    );
    res.json({ product, related: relatedRows.map(productRow) });
  } catch (error) {
    next(error);
  }
});

export default router;
