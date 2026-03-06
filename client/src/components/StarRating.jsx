export function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div class="d-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          class="btn btn-sm p-0 border-0"
          style={readOnly ? 'cursor:default' : 'cursor:pointer'}
          onClick={() => !readOnly && onChange && onChange(star)}
          disabled={readOnly}
          title={`${star} étoile${star > 1 ? 's' : ''}`}
        >
          <i class={`ti ${star <= (value || 0) ? 'ti-star-filled text-yellow' : 'ti-star text-muted'}`}></i>
        </button>
      ))}
    </div>
  );
}
