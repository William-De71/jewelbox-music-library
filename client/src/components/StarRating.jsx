import { useI18n } from '../config/i18n/index.js';

export function StarRating({ value, onChange, readOnly = false }) {
  const { t } = useI18n();
  
  return (
    <div class="d-flex gap-2 align-items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (value || 0);
        return (
          <button
            key={star}
            type="button"
            class={`star-button ${isFilled ? 'star-filled' : 'star-empty'} ${readOnly ? 'star-readonly' : ''}`}
            onClick={() => !readOnly && onChange && onChange(star)}
            disabled={readOnly}
            title={`${star} ${star > 1 ? t('common.stars') : t('common.star')}`}
          >
            {isFilled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
}
