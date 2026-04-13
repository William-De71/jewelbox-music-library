import { StarRating } from './StarRating.jsx';
import { getPlaceholderSVG } from '../utils/placeholder.js';

export function AlbumRow({ album, onClick }) {

  return (
    <tr class="hover:bg-light-lt cursor-pointer" onClick={() => onClick(album)}>
      <td class="text-center d-none d-sm-table-cell">
        <div class="d-flex align-items-center justify-content-center" 
          style={{width: '40px', height: '40px'}}>
          {album.cover_url ? (
            <img 
              src={album.cover_url} 
              alt={album.title}
              class="rounded"
              style={{width: '40px', height: '40px', objectFit: 'cover'}}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = getPlaceholderSVG();
              }}
            />
          ) : (
            <div dangerouslySetInnerHTML={{__html: getPlaceholderSVG()}}></div>
          )}
        </div>
      </td>
      <td class="fw-medium">{album.title}</td>
      <td class="text-muted">{album.artist?.name || album.artist}</td>
      <td class="text-muted d-none d-lg-table-cell">{album.year || '—'}</td>
      <td class="d-none d-lg-table-cell">
        {album.genre ? <span class="badge bg-primary-lt">{album.genre}</span> : '—'}
      </td>
      <td class="d-none d-md-table-cell">
        <StarRating value={album.rating} readOnly />
      </td>
      <td class="text-muted small d-none d-md-table-cell">{album.label?.name || album.label || '—'}</td>
    </tr>
  );
}
