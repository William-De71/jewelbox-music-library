import { CoverImage } from './CoverImage.jsx';
import { StarRating } from './StarRating.jsx';
import { useI18n } from '../config/i18n/index.js';

export function AlbumCard({ album, onClick, onEdit, onDelete, onLend, onRate }) {
  const { t } = useI18n();
  
  return (
    <div class="album-card card shadow-sm border-0">
      <div class="album-card-cover position-relative" onClick={() => onClick(album)}>
        <CoverImage src={album.cover_url} title={album.title} />
        {album.is_lent && (
          <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
            <i class="ti ti-user-share me-1"></i>
            {t('card.lentBadge')}{album.lent_to ? ` ${t('card.lentTo', { name: album.lent_to })}` : ''}
          </span>
        )}
      </div>
      <div class="album-card-body card-body p-3" onClick={() => onClick(album)}>
        <h3 class="album-card-title card-title mb-1 text-truncate">{album.title}</h3>
        <p class="text-muted small mb-2 text-truncate">
          <i class="ti ti-user me-1"></i>
          {album.artist?.name || album.artist}
        </p>
        {album.year && (
          <p class="text-muted small mb-0">
            <i class="ti ti-calendar me-1"></i>
            {album.year}
          </p>
        )}
      </div>
      <div class="album-card-footer card-footer border-0 p-3 pt-0">
        <div class="mb-3" onClick={(e) => e.stopPropagation()}>
          <StarRating value={album.rating} onChange={(rating) => onRate && onRate(album, rating)} />
        </div>
        <div class="d-grid gap-2">
          <button class="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); onEdit(album); }}>
            <i class="ti ti-pencil me-1"></i>
            {t('card.modify')}
          </button>
          <button class="btn btn-sm btn-info" onClick={(e) => { e.stopPropagation(); onLend(album); }}>
            <i class="ti ti-user-share me-1"></i>
            {t('card.lend')}
          </button>
          <button class="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(album); }}>
            <i class="ti ti-trash me-1"></i>
            {t('card.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
