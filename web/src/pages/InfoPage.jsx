import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInfo } from '../lib/infoContent';

export default function InfoPage() {
  const { slug } = useParams();
  const page = getInfo(slug);

  useEffect(() => {
    document.title = `${page ? page.title : 'اطلاعات'} | YAS SPORTS`;
  }, [page]);

  if (!page) {
    return (
      <div className="page">
        <div className="container page-block">
          <div className="empty-state">
            <strong>این صفحه پیدا نشد.</strong>
            <div style={{ marginTop: 18 }}>
              <Link to="/" className="btn btn-dark btn-sm">
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">خانه</Link>
          <span>/</span>
          <span style={{ opacity: 1, color: 'var(--ink)' }}>{page.title}</span>
        </div>

        <article className="prose" style={{ paddingTop: 'clamp(24px,3vw,44px)' }}>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>

          {page.table && (
            <table>
              <thead>
                <tr>
                  {page.table.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.table.rows.map((row) => (
                  <tr key={row.join('-')}>
                    {row.map((cell) => (
                      <td key={cell}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {page.sections?.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {page.faq?.map((item) => (
            <section key={item.q}>
              <h2>{item.q}</h2>
              <p>{item.a}</p>
            </section>
          ))}

          <p style={{ marginTop: 32 }}>
            <Link to="/contact" className="link-arrow">
              پرسش دیگری داری؟ با پشتیبانی تماس بگیر
            </Link>
          </p>
        </article>
      </div>
    </div>
  );
}
