//import { CoverImage } from './CoverImage.jsx';
import { StarRating } from './StarRating.jsx';

export function AlbumRow({ album, onClick }) {
  return (
    <tr class="album-row" onClick={() => onClick(album)}>
      <td class="album-row-cover">
        {/*<CoverImage src={album.cover_url} title={album.title} size={40} />*/}
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
    </tr>
  );
}
