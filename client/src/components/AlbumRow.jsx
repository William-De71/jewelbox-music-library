import { CoverImage } from './CoverImage.jsx';
import { StarRating } from './StarRating.jsx';

export function AlbumRow({ album, onClick, onEdit, onDelete, onLend }) {
  return (
    <tr style="cursor:pointer" onClick={() => onClick(album)}>
      <td style="width:60px">
        <CoverImage src={album.cover_url} title={album.title} size={40} />
      </td>
      <td>{album.title}</td>
      <td class="text-muted">{album.artist?.name || album.artist}</td>
      <td class="text-muted">{album.year || '—'}</td>
      <td>
        {album.genre ? <span class="badge bg-blue-lt">{album.genre}</span> : '—'}
      </td>
      <td>
        <StarRating value={album.rating} readOnly />
      </td>
      <td class="text-muted small">{album.label?.name || album.label || '—'}</td>
      <td onClick={(e) => e.stopPropagation()}>
        <div class="btn-list">
          <button class="btn btn-sm btn-icon" onClick={() => onEdit(album)} title="Modifier">
            <i class="ti ti-pencil"></i>
          </button>
          <button class="btn btn-sm btn-icon" onClick={() => onLend(album)} title="Prêter">
            <i class="ti ti-user-share"></i>
          </button>
          <button class="btn btn-sm btn-icon" onClick={() => onDelete(album)} title="Supprimer">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}
