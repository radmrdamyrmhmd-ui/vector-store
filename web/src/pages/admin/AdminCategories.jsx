import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { faNum } from '../../lib/format';
import { TrashIcon } from '../../components/icons';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/categories');
      setCategories(data.items || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'دسته‌بندی‌ها | YAS SPORTS';
    load();
  }, []);

  const add = async (event) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError('نام دسته‌بندی را وارد کنید.');
      return;
    }
    try {
      await api.post('/admin/categories', { name: name.trim(), sort: categories.length + 1 });
      setName('');
      setError('');
      await load();
    } catch (addError) {
      setError(addError.message);
    }
  };

  const remove = async (slug) => {
    if (!window.confirm('این دسته‌بندی حذف شود؟')) return;
    try {
      await api.del(`/admin/categories/${slug}`);
      await load();
    } catch (removeError) {
      window.alert(removeError.message);
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>دسته‌بندی‌ها</h1>
          <p>دسته‌بندی محصولات فروشگاه را مدیریت کنید.</p>
        </div>
      </div>

      <div className="admin-panel" style={{ marginBottom: 16 }}>
        <div className="admin-panel__head">
          <h2>افزودن دسته‌بندی</h2>
        </div>
        <form onSubmit={add} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="admin-input"
            style={{ maxWidth: 280 }}
            placeholder="نام دسته‌بندی جدید"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button type="submit" className="btn btn-dark btn-sm">
            افزودن
          </button>
        </form>
        {error && <p className="form-alert" style={{ marginTop: 12 }}>{error}</p>}
      </div>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>دسته‌بندی‌های موجود</h2>
        </div>
        {loading ? (
          <p className="admin-empty">در حال بارگذاری…</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>نام</th>
                  <th>شناسه</th>
                  <th>تعداد محصول</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.slug}>
                    <td>{category.name}</td>
                    <td dir="ltr" style={{ textAlign: 'end' }}>{category.slug}</td>
                    <td>{faNum(category.products_count)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-action is-danger"
                          onClick={() => remove(category.slug)}
                          aria-label="حذف دسته‌بندی"
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
    </>
  );
}
