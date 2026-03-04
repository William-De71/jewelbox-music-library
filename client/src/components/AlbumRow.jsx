import { CoverImage } from './CoverImage.jsx';
import { StarRating } from './StarRating.jsx';

export function AlbumRow({ album, onClick, onEdit, onDelete, onLend }) {
  return (
    <tr style="cursor:pointer" onClick={() => onClick(album)}>
      <td style="width:48px">
        <CoverImage src={album.cover_url} title={album.title} size={40} />
      </td>
      <td>
        <div class="fw-semibold">{album.title}</div>
        {album.is_lent && (
          <span class="badge bg-warning text-dark ms-1" style="font-size:.6rem">
            <i class="ti ti-user-share me-1"></i>Prêté{album.lent_to ? ` à ${album.lent_to}` : ''}
          </span>
        )}
      </td>
      <td class="text-muted">{album.artist?.name}</td>
      <td class="text-muted">{album.year || '—'}</td>
      <td>{album.genre ? <span class="badge bg-blue-lt">{album.genre}</span> : '—'}</td>
      <td><StarRating value={album.rating} readOnly /></td>
      <td class="text-muted small">{album.label?.name || '—'}</td>
      <td onClick={(e) => e.stopPropagation()}>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-ghost-secondary p-1" title="Prêter / Récupérer"
            onClick={() => onLend(album)}>
            <i class={`ti ${album.is_lent ? 'ti-user-check' : 'ti-user-share'}`}></i>
          </button>
          <button class="btn btn-sm btn-ghost-primary p-1" title="Modifier"
            onClick={() => onEdit(album)}>
            <i class="ti ti-pencil"></i>
          </button>
          <button class="btn btn-sm btn-ghost-danger p-1" title="Supprimer"
            onClick={() => onDelete(album)}>
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}
