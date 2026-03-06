import { CoverImage } from './CoverImage.jsx';
import { StarRating } from './StarRating.jsx';

export function AlbumCard({ album, onClick, onEdit, onDelete, onLend }) {
  return (
    <div class="card card-sm h-100 cursor-pointer" onClick={() => onClick(album)}>
      <CoverImage src={album.cover_url} title={album.title} />
      <div class="card-body">
        <div class="fw-bold text-truncate">{album.title}</div>
        <div class="text-muted small text-truncate">{album.artist?.name || album.artist}</div>
        {album.is_lent && (
          <span class="badge bg-warning text-dark mt-1">
            Prêté{album.lent_to ? ` à ${album.lent_to}` : ''}
          </span>
        )}
      </div>
      <div class="card-footer">
        <div class="d-flex justify-content-between align-items-center">
          <StarRating value={album.rating} readOnly />
          <div class="btn-list">
            <button class="btn btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(album); }} title="Modifier">
              <i class="ti ti-pencil"></i>
            </button>
            <button class="btn btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); onLend(album); }} title="Prêter">
              <i class="ti ti-user-share"></i>
            </button>
            <button class="btn btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); onDelete(album); }} title="Supprimer">
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
