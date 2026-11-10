export function productRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameFa: row.name_fa,
    category: row.category,
    gender: row.gender,
    price: row.price,
    oldPrice: row.old_price,
    shortDesc: row.short_desc,
    description: row.description,
    images: row.images || [],
    sizes: row.sizes || [],
    colors: row.colors || [],
    stock: row.stock,
    isNew: row.is_new,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function orderRow(row) {
  return {
    id: row.id,
    code: row.code,
    userId: row.user_id,
    customer: row.customer,
    items: row.items || [],
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
  };
}
