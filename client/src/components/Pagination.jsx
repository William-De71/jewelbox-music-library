import { ChevronLeft, ChevronRight } from 'lucide-preact';
import { useI18n } from '../config/i18n/index.js';

export function Pagination({ page, limit, total, onChange }) {
  const { t } = useI18n();
  const totalPages = Math.ceil(total / limit);

  const pages = [];
  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  return (
    <ul class="pagination m-0">
      <li class={`page-item ${page === 1 ? 'disabled' : ''}`}>
        <button class="page-link" onClick={() => onChange(page - 1)}>
          <ChevronLeft size={16} />
          <span class="visually-hidden">{t('pagination.previous')}</span>
        </button>
      </li>

      {left > 1 && (
        <>
          <li class="page-item">
            <button class="page-link" onClick={() => onChange(1)}>1</button>
          </li>
          {left > 2 && <li class="page-item disabled"><span class="page-link">…</span></li>}
        </>
      )}

      {pages.map((p) => (
        <li key={p} class={`page-item ${p === page ? 'active' : ''}`}>
          <button class="page-link" onClick={() => onChange(p)}>{p}</button>
        </li>
      ))}

      {right < totalPages && (
        <>
          {right < totalPages - 1 && <li class="page-item disabled"><span class="page-link">…</span></li>}
          <li class="page-item">
            <button class="page-link" onClick={() => onChange(totalPages)}>{totalPages}</button>
          </li>
        </>
      )}

      <li class={`page-item ${page === totalPages ? 'disabled' : ''}`}>
        <button class="page-link" onClick={() => onChange(page + 1)}>
          <ChevronRight size={16} />
          <span class="visually-hidden">{t('pagination.next')}</span>
        </button>
      </li>
    </ul>
  );
}
