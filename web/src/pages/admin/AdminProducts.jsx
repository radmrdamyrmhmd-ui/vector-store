import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { CATEGORY_LABELS, faNum, formatPrice, toEnglishDigits } from '../../lib/format';
import { CloseIcon, EditIcon, PlusIcon, TrashIcon } from '../../components/icons';

const EMPTY_FORM = {
  nameFa: '',
  nameEn: '',
  slug: '',
  category: 'running',
  gender: 'unisex',
  price: '',
  oldPrice: '',
  stock: '',
  shortDesc: '',
  description: '',
  images: [],
  sizes: '39,40,41,42,43,44,45',
  colors: '',
  isNew: true,
  isActive: true,
};

function toForm(product) {
  return {
    nameFa: product.nameFa || '',
    nameEn: product.nameEn || '',
    slug: product.slug || '',
    category: product.category || 'running',
    gender: product.gender || 'unisex',
    price: String(product.price ?? ''),
    oldPrice: product.oldPrice ? String(product.oldPrice) : '',
    stock: String(product.stock ?? ''),
    shortDesc: product.shortDesc || '',
    description: product.description || '',
    images: product.images || [],
    sizes: (product.sizes || []).join(','),
    colors: (product.colors || []).join(','),
    isNew: Boolean(product.isNew),
    isActive: product.isActive !== false,
  };
}

const toPersianList = (value) =>
  String(value || '')
    .split(/[,،]/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageDraft, setImageDraft] = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/categories'),
      ]);
      setProducts(productData.items || []);
      setCategories(categoryData.items || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'مدیریت محصولات | YAS SPORTS';
    load();
  }, []);

  const openNew = () => {
    setForm({ ...EMPTY_FORM, category: categories[0]?.slug || 'running' });
    setEditing('new');
    setError('');
  };

  const openEdit = (product) => {
    setForm(toForm(product));
    setEditing(product);
    setError('');
  };

  const closeForm = () => {
    setEditing(null);
    setError('');
  };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.nameFa.trim() || !form.nameEn.trim()) {
      setError('نام فارسی و لاتین محصول را وارد کنید.');
      return;
    }
    if (!Number(form.price)) {
      setError('قیمت محصول را وارد کنید.');
      return;
    }

    const payload = {
      nameFa: form.nameFa.trim(),
      nameEn: form.nameEn.trim(),
      slug: form.slug.trim() || form.nameEn.trim(),
      category: form.category,
      gender: form.gender,
      price: Number(toEnglishDigits(form.price)),
      oldPrice: form.oldPrice ? Number(toEnglishDigits(form.oldPrice)) : null,
      stock: Number(toEnglishDigits(form.stock)) || 0,
      shortDesc: form.shortDesc,
      description: form.description,
      images: form.images,
      sizes: toPersianList(form.sizes).map((size) => toEnglishDigits(size)),
      colors: toPersianList(form.colors),
      isNew: form.isNew,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editing === 'new') await api.post('/admin/products', payload);
      else await api.put(`/admin/products/${editing.id}`, payload);
      await load();
      closeForm();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`محصول «${product.nameFa}» حذف شود؟`)) return;
    try {
      await api.del(`/admin/products/${product.id}`);
      await load();
    } catch (removeError) {
      window.alert(removeError.message);
    }
  };

  const addImage = () => {
    const value = imageDraft.trim();
    if (!value) return;
    setField('images', [...form.images, value]);
    setImageDraft('');
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await api.upload(file);
      setField('images', [...form.images, data.url]);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>مدیریت محصولات</h1>
          <p>افزودن، ویرایش و حذف محصولات، مدیریت قیمت، موجودی و سایزبندی.</p>
        </div>
        <button type="button" className="btn btn-dark btn-sm" onClick={openNew}>
          <PlusIcon size={15} /> محصول جدید
        </button>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>فهرست محصولات ({faNum(products.length)})</h2>
        </div>

        {loading ? (
          <p className="admin-empty">در حال بارگذاری…</p>
        ) : products.length === 0 ? (
          <p className="admin-empty">هنوز محصولی ثبت نشده است.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>محصول</th>
                  <th>دسته‌بندی</th>
                  <th>قیمت</th>
                  <th>موجودی</th>
                  <th>وضعیت</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="cell-product">
                        <img src={product.images?.[0]} alt="" />
                        <div>
                          <b>{product.nameFa}</b>
                          <small>{product.nameEn}</small>
                        </div>
                      </div>
                    </td>
                    <td>{CATEGORY_LABELS[product.category] || product.category}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{faNum(product.stock)}</td>
                    <td>
                      {product.isActive ? (
                        <span className="status status--delivered">فعال</span>
                      ) : (
                        <span className="status">غیرفعال</span>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="icon-action" onClick={() => openEdit(product)} aria-label="ویرایش">
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="icon-action is-danger"
                          onClick={() => remove(product)}
                          aria-label="حذف"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="slideover">
          <div className="slideover__backdrop" onClick={closeForm} />
          <div className="slideover__panel">
            <div className="slideover__head">
              <h2>{editing === 'new' ? 'محصول جدید' : `ویرایش ${editing.nameFa}`}</h2>
              <button type="button" className="icon-btn" onClick={closeForm} aria-label="بستن">
                <CloseIcon />
              </button>
            </div>

            <form className="admin-form" onSubmit={save}>
              <div className="admin-form__grid">
                <div>
                  <label className="admin-label" htmlFor="nameFa">
                    نام فارسی
                  </label>
                  <input id="nameFa" className="admin-input" value={form.nameFa} onChange={(e) => setField('nameFa', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label" htmlFor="nameEn">
                    نام لاتین
                  </label>
                  <input id="nameEn" className="admin-input" dir="ltr" value={form.nameEn} onChange={(e) => setField('nameEn', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label" htmlFor="category">
                    دسته‌بندی
                  </label>
                  <select id="category" className="admin-select" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-label" htmlFor="gender">
                    جنسیت
                  </label>
                  <select id="gender" className="admin-select" value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                    <option value="unisex">یونیسکس</option>
                    <option value="male">مردانه</option>
                    <option value="female">زنانه</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label" htmlFor="price">
                    قیمت (تومان)
                  </label>
                  <input id="price" className="admin-input" dir="ltr" inputMode="numeric" value={form.price} onChange={(e) => setField('price', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label" htmlFor="oldPrice">
                    قیمت پیش از تخفیف
                  </label>
                  <input id="oldPrice" className="admin-input" dir="ltr" inputMode="numeric" value={form.oldPrice} onChange={(e) => setField('oldPrice', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label" htmlFor="stock">
                    موجودی انبار
                  </label>
                  <input id="stock" className="admin-input" dir="ltr" inputMode="numeric" value={form.stock} onChange={(e) => setField('stock', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label" htmlFor="slug">
                    شناسه (slug)
                  </label>
                  <input id="slug" className="admin-input" dir="ltr" value={form.slug} onChange={(e) => setField('slug', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="admin-label" htmlFor="shortDesc">
                  توضیح کوتاه
                </label>
                <input id="shortDesc" className="admin-input" value={form.shortDesc} onChange={(e) => setField('shortDesc', e.target.value)} />
              </div>

              <div>
                <label className="admin-label" htmlFor="description">
                  توضیحات کامل
                </label>
                <textarea id="description" className="admin-textarea" value={form.description} onChange={(e) => setField('description', e.target.value)} />
              </div>

              <div className="admin-form__grid">
                <div>
                  <label className="admin-label" htmlFor="sizes">
                    سایزبندی (با کاما جدا کنید)
                  </label>
                  <input id="sizes" className="admin-input" dir="ltr" value={form.sizes} onChange={(e) => setField('sizes', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label" htmlFor="colors">
                    رنگ‌ها (با کاما جدا کنید)
                  </label>
                  <input id="colors" className="admin-input" value={form.colors} onChange={(e) => setField('colors', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="admin-label">تصاویر محصول</label>
                <div className="image-list">
                  {form.images.map((image, index) => (
                    <div className="image-row" key={`${image}-${index}`}>
                      <img src={image} alt="" />
                      <input className="admin-input" dir="ltr" value={image} readOnly />
                      <button
                        type="button"
                        className="icon-action is-danger"
                        onClick={() => setField('images', form.images.filter((_, i) => i !== index))}
                        aria-label="حذف تصویر"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="image-row" style={{ marginTop: 8 }}>
                  <input
                    className="admin-input"
                    dir="ltr"
                    placeholder="/images/product.jpg یا آدرس کامل"
                    value={imageDraft}
                    onChange={(event) => setImageDraft(event.target.value)}
                  />
                  <button type="button" className="btn btn-outline btn-sm" onClick={addImage}>
                    افزودن
                  </button>
                </div>
                <div className="image-row" style={{ marginTop: 8 }}>
                  <input ref={fileRef} type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0])} />
                  {uploading && <span className="form-note">در حال بارگذاری…</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <label className="admin-check">
                  <input type="checkbox" checked={form.isNew} onChange={(e) => setField('isNew', e.target.checked)} />
                  نمایش برچسب «جدید»
                </label>
                <label className="admin-check">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} />
                  محصول فعال است
                </label>
              </div>

              {error && <p className="form-alert">{error}</p>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-dark btn-sm" disabled={saving}>
                  {saving ? 'در حال ذخیره…' : 'ذخیره محصول'}
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={closeForm}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
