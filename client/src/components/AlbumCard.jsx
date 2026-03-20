import { StarRating } from './StarRating.jsx';
import { useI18n } from '../config/i18n/index.js';
import { Share } from 'lucide-preact';

// Placeholder
function getPlaceholderHTML() {
  return `
    <div class="position-relative">
      <svg class="text-muted opacity-50" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
      <svg class="text-danger position-absolute top-0 start-100 translate-middle" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </div>
  `;
}

export function AlbumCard({ album, onClick, onEdit, onDelete, onLend, onRate }) {
  const { t } = useI18n();
  
  return (
    <div class="card shadow-sm h-100">
      {/* Header avec l'image et badge "prêté" */}
      <div class="position-relative" onClick={() => onClick(album)}>
        <div class="ratio ratio-1x1 bg-transparent d-flex align-items-center justify-content-center">
          {album.cover_url ? (
            <>
              <img 
                src={album.cover_url} 
                alt={album.title}
                class="img-fluid w-100 h-100 object-fit-cover p-3"
                onError={(e) => {
                  e.target.style.display = 'none';
                  // Show placeholder by replacing the img
                  const placeholder = document.createElement('div');
                  placeholder.className = 'd-flex align-items-center justify-content-center w-100 h-100';
                  placeholder.innerHTML = getPlaceholderHTML();
                  e.target.parentNode.replaceChild(placeholder, e.target);
                }}
              />
            </>
          ) : (
            <div class="d-flex align-items-center justify-content-center w-100 h-100" 
                dangerouslySetInnerHTML={{__html: getPlaceholderHTML()}}>
            </div>
          )}
          
      </div>

        {album.is_lent && (
          <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
            <Share size={16} class="me-1" />
            {t('card.lentBadge')}{album.lent_to ? ` ${t('card.lentTo', { name: album.lent_to })}` : ''}
          </span>
        )}
      </div>

      {/* Corps avec Rating */}
      <div class="card-body p-3" onClick={(e) => e.stopPropagation()}>
        <StarRating value={album.rating} onChange={(rating) => onRate && onRate(album, rating)} />
      </div>
      
      {/* Footer avec informations albums */}
      <div class="card-footer bg-transparent border-0 p-3 pt-0" onClick={() => onClick(album)}>
        <h5 class="card-title mb-1 text-truncate">{album.title}</h5>
        <p class="card-text text-muted small mb-2 text-truncate">
          {album.artist?.name || album.artist}
        </p>
      </div>


    </div>
  );
}