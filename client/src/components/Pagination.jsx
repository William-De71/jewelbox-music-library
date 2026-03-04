export function Pagination({ page, limit, total, onChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  return (
    <ul class="pagination justify-content-center m-0">
      <li class={`page-item ${page === 1 ? 'disabled' : ''}`}>
        <button class="page-link" onClick={() => onChange(page - 1)}>
          <i class="ti ti-chevron-left"></i>
          <span class="sr-only">Précédent</span>
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
          <i class="ti ti-chevron-right"></i>
          <span class="sr-only">Suivant</span>
        </button>
      </li>
    </ul>
  );
}
