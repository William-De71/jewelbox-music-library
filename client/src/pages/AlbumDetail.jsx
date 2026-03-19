import { useState, useEffect } from 'preact/hooks';
import { api } from '../api/client.js';
import { StarRating } from '../components/StarRating.jsx';
//import { CoverImage } from '../components/CoverImage.jsx';
import { useI18n } from '../config/i18n/index.js';

export function AlbumDetail({ navigate, albumId }) {
  const { t } = useI18n();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.getAlbum(albumId)
      .then(setAlbum)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [albumId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteAlbum(albumId);
      navigate('dashboard');
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };

  const handleLend = async () => {
    try {
      const updated = await api.lendAlbum(albumId, !album.is_lent, null);
      setAlbum(updated);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="alert alert-danger">
        <i class="ti ti-alert-circle me-2"></i>{error}
        <button class="btn btn-link p-0 ms-2" onClick={() => navigate('dashboard')}>{t('common.back')}</button>
      </div>
    );
  }

  if (!album) return null;

  const totalDuration = album.tracks?.length
    ? album.total_duration || '—'
    : album.total_duration || '—';

  return (
    <>
      <div class="page-header d-print-none mb-3">
        <div class="row align-items-center">
          <div class="col-auto">
            <button class="btn btn-outline-secondary btn-sm" onClick={() => navigate('dashboard')}>
              <i class="ti ti-arrow-left me-1"></i>{t('common.back')}
            </button>
          </div>
          <div class="col">
            <h2 class="page-title text-truncate" title={album.title}>{album.title}</h2>
            <div class="text-muted">{album.artist?.name}</div>
          </div>
          <div class="col-auto d-flex gap-2">
            <button
              class={`btn btn-sm ${album.is_lent ? 'btn-success' : 'btn-warning'}`}
              onClick={handleLend}
              title={album.is_lent ? t('albumDetail.markReturned') : t('albumDetail.markLent')}
            >
              <i class={`ti ${album.is_lent ? 'ti-user-check' : 'ti-user-share'} me-1`}></i>
              {album.is_lent ? t('albumDetail.returned') : t('common.lend')}
            </button>
            <button class="btn btn-sm btn-primary" onClick={() => navigate('edit', { id: albumId })}>
              <i class="ti ti-pencil me-1"></i>{t('albumDetail.edit')}
            </button>
            <button class="btn btn-sm btn-danger" onClick={() => setConfirmDelete(true)}>
              <i class="ti ti-trash me-1"></i>{t('albumDetail.delete')}
            </button>
          </div>
        </div>
      </div>

      <div class="row g-3">
        {/* Cover & key info */}
        <div class="col-12 col-md-4 col-lg-3">
          <div class="card">
            <div class="card-body text-center">
              <div class="mb-3 d-flex justify-content-center">
                {album.cover_url ? (
                  <img
                    src={album.cover_url}
                    alt={album.title}
                    class="rounded shadow album-detail-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  class="bg-dark rounded d-flex align-items-center justify-content-center shadow album-detail-cover-placeholder"
                  style={album.cover_url ? 'display:none' : ''}
                >
                  <i class="ti ti-disc text-muted album-detail-cover-icon"></i>
                </div>
              </div>

              {album.is_lent && (
                <div class="alert alert-warning p-2 mb-3 text-start">
                  <i class="ti ti-user-share me-1"></i>
                  <strong>{t('albumDetail.lent')}</strong>
                  {album.lent_to && <> <strong>{album.lent_to}</strong></>}
                </div>
              )}

              <div class="text-start">
                <div class="mb-2">
                  <div class="text-muted small">{t('albumDetail.rating')}</div>
                  <StarRating value={album.rating} readOnly />
                </div>
                {album.genre && (
                  <div class="mb-2">
                    <div class="text-muted small">{t('albumDetail.genre')}</div>
                    <span class="badge bg-blue-lt">{album.genre}</span>
                  </div>
                )}
                <div class="mb-2">
                  <div class="text-muted small">{t('albumDetail.year')}</div>
                  <div class="fw-semibold">{album.year || '—'}</div>
                </div>
                {album.label && (
                  <div class="mb-2">
                    <div class="text-muted small">{t('albumDetail.label')}</div>
                    <div class="fw-semibold">{album.label.name}</div>
                  </div>
                )}
                {album.total_duration && (
                  <div class="mb-2">
                    <div class="text-muted small">{t('albumDetail.totalDuration')}</div>
                    <div class="fw-semibold">{album.total_duration}</div>
                  </div>
                )}
                {album.ean && (
                  <div class="mb-2">
                    <div class="text-muted small">{t('albumDetail.ean')}</div>
                    <div class="fw-semibold font-monospace small">{album.ean}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tracks & Notes */}
        <div class="col-12 col-md-8 col-lg-9">
          {album.notes && (
            <div class="card mb-3">
              <div class="card-header">
                <h3 class="card-title"><i class="ti ti-notes me-2"></i>{t('albumDetail.notes')}</h3>
              </div>
              <div class="card-body">
                <p class="mb-0 album-notes">{album.notes}</p>
              </div>
            </div>
          )}

          {album.tracks && album.tracks.length > 0 ? (
            <div class="card">
              <div class="card-header d-flex align-items-center">
                <h3 class="card-title mb-0">
                  <i class="ti ti-list-numbers me-2"></i>
                  {t('albumDetail.tracks')} ({album.tracks.length})
                </h3>
                {album.total_duration && (
                  <span class="ms-auto text-muted small">
                    <i class="ti ti-clock me-1"></i>{album.total_duration}
                  </span>
                )}
              </div>
              <div class="table-responsive">
                <table class="table table-sm card-table">
                  <thead>
                    <tr>
                      <th class="track-number-col">{t('albumDetail.trackNumber')}</th>
                      <th>{t('albumDetail.trackTitle')}</th>
                      <th class="track-duration-col text-end">{t('albumDetail.duration')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {album.tracks.map((track) => (
                      <tr key={track.id}>
                        <td class="text-muted">{track.position}</td>
                        <td>{track.title}</td>
                        <td class="text-end text-muted font-monospace small">{track.duration || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div class="card">
              <div class="card-body text-center text-muted py-4">
                <i class="ti ti-music-off no-tracks-icon"></i>
                <div class="mt-2">{t('albumDetail.noTracks')}</div>
                <button class="btn btn-sm btn-outline-primary mt-2" onClick={() => navigate('edit', { id: albumId })}>
                  <i class="ti ti-pencil me-1"></i>{t('albumDetail.editAlbum')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div class="modal modal-blur show d-block modal-backdrop">
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-body">
                <div class="modal-title mb-1">{t('modals.deleteTitle')}</div>
                <p class="text-muted">
                  {t('albumDetail.confirmDelete')}
                </p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-outline-secondary me-auto" onClick={() => setConfirmDelete(false)}>{t('modals.cancel')}</button>
                <button class="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <span class="spinner-border spinner-border-sm"></span> : <><i class="ti ti-trash me-1"></i>{t('common.delete')}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
