import { StarRating } from './StarRating.jsx';
import { useI18n } from '../config/i18n/index.js';

export function AlbumCard({ album, onClick, onEdit, onDelete, onLend, onRate }) {
  const { t } = useI18n();
  
  return (
    <div class="card shadow-sm h-100">
      {/* Header avec l'image et badge "prêté" */}
      <div class="position-relative" onClick={() => onClick(album)}>
        <div class="ratio ratio-1x1 bg-transparent d-flex align-items-center justify-content-center">
          {album.cover_url ? (
            <img 
              src={album.cover_url} 
              alt={album.title}
              class="img-fluid w-100 h-100 object-fit-cover p-3"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
  
          {/* Placeholder qui s'affiche si l'image échoue */}
          <div class="d-flex align-items-center justify-content-center w-100 h-100" 
            style={{display: album.cover_url ? 'none' : 'flex'}}>
            <div class="position-relative">
              <i class="ti ti-disc text-muted opacity-50" style={{fontSize: '3rem'}}></i>
              <i class="ti ti-x text-danger position-absolute top-0 start-100 translate-middle" style={{fontSize: '1.5rem'}}></i>
            </div>
          </div>
          
      </div>

        {album.is_lent && (
          <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
            <i class="ti ti-user-share me-1"></i>
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
          <i class="ti ti-user me-1"></i>
          {album.artist?.name || album.artist}
        </p>
        {album.year && (
          <p class="card-text text-muted small mb-0">
            <i class="ti ti-calendar me-1"></i>
            {album.year}
          </p>
        )}
      </div>


    </div>
  );
}