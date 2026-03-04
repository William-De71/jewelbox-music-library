import { CoverImage } from './CoverImage.jsx';
import { StarRating } from './StarRating.jsx';

export function AlbumCard({ album, onClick, onEdit, onDelete, onLend }) {
  return (
    <div class="card card-sm h-100 cursor-pointer" style="transition:transform .15s,box-shadow .15s"
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.4)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div onClick={() => onClick(album)} style="cursor:pointer">
        <div class="position-relative" style="aspect-ratio:1;overflow:hidden;border-radius:.375rem .375rem 0 0">
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} loading="lazy"
              class="w-100 h-100 object-fit-cover"
              onError={(e) => { e.currentTarget.parentElement.innerHTML = `<div class="w-100 h-100 bg-dark d-flex align-items-center justify-content-center"><i class="ti ti-disc text-muted" style="font-size:3rem"></i></div>`; }} />
          ) : (
            <div class="w-100 h-100 bg-dark d-flex align-items-center justify-content-center">
              <i class="ti ti-disc text-muted" style="font-size:3rem"></i>
            </div>
          )}
          {album.is_lent && (
            <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-1">
              <i class="ti ti-user-share me-1"></i>Prêté
            </span>
          )}
        </div>
        <div class="card-body pb-1">
          <div class="fw-semibold text-truncate" title={album.title}>{album.title}</div>
          <div class="text-muted small text-truncate">{album.artist?.name}</div>
          <div class="d-flex align-items-center justify-content-between mt-1">
            <StarRating value={album.rating} readOnly />
            <span class="text-muted small">{album.year || '—'}</span>
          </div>
          {album.genre && (
            <span class="badge bg-blue-lt mt-1" style="font-size:.65rem">{album.genre}</span>
          )}
        </div>
      </div>
      <div class="card-footer pt-0 border-0 d-flex gap-1 justify-content-end">
        <button class="btn btn-sm btn-ghost-secondary p-1" title="Prêter / Récupérer"
          onClick={(e) => { e.stopPropagation(); onLend(album); }}>
          <i class={`ti ${album.is_lent ? 'ti-user-check' : 'ti-user-share'}`}></i>
        </button>
        <button class="btn btn-sm btn-ghost-primary p-1" title="Modifier"
          onClick={(e) => { e.stopPropagation(); onEdit(album); }}>
          <i class="ti ti-pencil"></i>
        </button>
        <button class="btn btn-sm btn-ghost-danger p-1" title="Supprimer"
          onClick={(e) => { e.stopPropagation(); onDelete(album); }}>
          <i class="ti ti-trash"></i>
        </button>
      </div>
    </div>
  );
}
