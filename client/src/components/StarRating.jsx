export function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div class="d-flex gap-2 align-items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (value || 0);
        return (
          <button
            key={star}
            type="button"
            class="btn p-0 border-0 bg-transparent"
            style={{
              cursor: readOnly ? 'default' : 'pointer',
              fontSize: '1.5rem',
              lineHeight: 1,
              color: isFilled ? '#f59f00' : '#6c757d',
              opacity: readOnly ? 0.7 : 1,
            }}
            onClick={() => !readOnly && onChange && onChange(star)}
            disabled={readOnly}
            title={`${star} étoile${star > 1 ? 's' : ''}`}
          >
            {isFilled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
}
