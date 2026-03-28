import { useState, useEffect } from 'preact/hooks';
import { api } from '../api/client.js';
import { StarRating } from '../components/StarRating.jsx';
import { ArrowLeft, UserCheck, UserPlus, Pencil, Trash2, Disc, StickyNote, ListOrdered, Clock, Music2, AlertCircle, Info, Heart } from 'lucide-preact';
import { useI18n } from '../config/i18n/index.js';
import '../styles/AlbumDetail.css';

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
      navigate(album?.is_wanted ? 'wantlist' : 'collections', { successMessage: t('albumDetail.deleteSuccess') });
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
        <AlertCircle size={16} class="me-2" />{error}
        <button class="btn btn-link p-0 ms-2" onClick={() => navigate('dashboard')}>{t('common.back')}</button>
      </div>
    );
  }

  if (!album) return null;

  const totalDuration = album.tracks?.length
    ? album.total_duration || '—'
    : album.total_duration || '—';

  return (
    <div class="container-xl">
      <div class="page-header d-print-none mb-3">
        <div class="row align-items-center">
          <div class="col-auto">
            <button class="btn btn-outline-secondary" onClick={() => navigate(album?.is_wanted ? 'wantlist' : 'collections')}>
              <ArrowLeft size={16} class="me-1" />{t('common.back')}
            </button>
          </div>
          <div class="col">
            <h2 class="page-title">{album.title}</h2>
            <div class="text-muted">{album.artist?.name}</div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        {/* Left column: cover & rating */}
        <div class="col-12 col-md-3">
          <div class="card h-100">
            <div class="card-body d-flex flex-column align-items-center gap-3">
              <div class="position-relative cover-preview">
                {album.cover_url ? (
                  <img
                    src={album.cover_url}
                    alt={album.title}
                    class="w-100 h-100 rounded object-fit-cover"
                    onError={(e) => {
                      e.target.src = '';
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentElement.querySelector('.cover-placeholder');
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div class="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary-subtle rounded cover-placeholder">
                    <Disc size={48} class="text-muted" />
                  </div>
                )}
              </div>
              <div class="w-100 mt-3">
                <label class="form-label small mb-2">{t('albumDetail.rating')}</label>
                <StarRating value={album.rating} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: info & tracks */}
        <div class="col-12 col-md-9">
          {/* Info card */}
          <div class="card h-100">
            <div class="card-header">
              <h3 class="card-title"><Info size={18} class="me-2" />{t('albumDetail.info')}</h3>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12 col-sm-8">
                  <label class="form-label">{t('albumDetail.title')}</label>
                  <div class="fw-semibold">{album.title}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <label class="form-label">{t('albumDetail.year')}</label>
                  <div class="fw-semibold">{album.year || '—'}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label">{t('albumDetail.artist')}</label>
                  <div class="fw-semibold">{album.artist?.name || '—'}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label">{t('albumDetail.label')}</label>
                  <div class="fw-semibold">{album.label?.name || '—'}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <label class="form-label">{t('albumDetail.genre')}</label>
                  <div>{album.genre ? <span class="badge bg-blue-lt">{album.genre}</span> : '—'}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <label class="form-label">{t('albumDetail.totalDuration')}</label>
                  <div class="fw-semibold">{album.total_duration || '—'}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <label class="form-label">{t('albumDetail.ean')}</label>
                  <div class="fw-semibold font-monospace small">{album.ean || '—'}</div>
                </div>
                {album.is_lent && (
                  <div class="col-12">
                    <div class="alert alert-warning p-2 mb-0">
                      <UserPlus size={16} class="me-1" />
                      <strong>{t('albumDetail.lent')}</strong>
                      {album.lent_to && <> à <strong>{album.lent_to}</strong></>}
                    </div>
                  </div>
                )}
                {album.is_wanted && (
                  <div class="col-12">
                    <div class="alert alert-danger p-2 mb-0">
                      <Heart size={16} class="me-1" />
                      <strong>{t('albumDetail.wanted')}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Notes section - full width */}
      {album.notes && (
        <div class="row g-3 mt-0">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title"><StickyNote size={18} class="me-2" />{t('albumDetail.notes')}</h3>
              </div>
              <div class="card-body">
                <p class="mb-0 album-notes">{album.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracks section - full width */}
      <div class="row g-3 mt-0">
        <div class="col-12">
          {album.tracks && album.tracks.length > 0 ? (
            <div class="card">
              <div class="card-header d-flex align-items-center">
                <h3 class="card-title mb-0">
                  <ListOrdered size={18} class="me-2" />
                  {t('albumDetail.tracks')} ({album.tracks.length})
                </h3>
                {album.total_duration && (
                  <span class="ms-auto text-muted small">
                    <Clock size={16} class="me-1" />{album.total_duration}
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
                <Music2 size={48} class="mb-2" />
                <div class="mt-2">{t('albumDetail.noTracks')}</div>
                <button class="btn btn-sm btn-outline-primary mt-2" onClick={() => navigate('edit', { id: albumId })}>
                  <Pencil size={16} class="me-1" />{t('albumDetail.editAlbum')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div class="d-flex gap-2 justify-content-end mt-3 mb-4">
        <button
          class={`btn ${album.is_lent ? 'btn-success' : 'btn-warning'}`}
          onClick={handleLend}
          title={album.is_lent ? t('albumDetail.markReturned') : t('albumDetail.markLent')}
        >
          {album.is_lent ? <UserCheck size={16} class="me-1" /> : <UserPlus size={16} class="me-1" />}
          {album.is_lent ? t('albumDetail.returned') : t('common.lend')}
        </button>
        <button class="btn btn-primary" onClick={() => navigate('edit', { id: albumId })}>
          <Pencil size={16} class="me-1" />{t('albumDetail.edit')}
        </button>
        <button class="btn btn-danger" onClick={() => setConfirmDelete(true)}>
          <Trash2 size={16} class="me-1" />{t('albumDetail.delete')}
        </button>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setConfirmDelete(false)}
        >
          <div 
            style={{
              backgroundColor: 'var(--tblr-bg-surface)',
              borderRadius: '8px',
              padding: '0',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem' }}>
              <h5 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                {t('modals.deleteTitle')}
              </h5>
              <p style={{ margin: 0, color: 'var(--tblr-muted)' }}>
                {t('albumDetail.confirmDelete')} <strong>« {album.title} »</strong> ?
              </p>
            </div>
            <div style={{ 
              padding: '1rem 1.5rem', 
              borderTop: '1px solid var(--tblr-border-color)',
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end'
            }}>
              <button class="btn btn-outline-secondary" onClick={() => setConfirmDelete(false)}>
                {t('modals.cancel')}
              </button>
              <button class="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span class="spinner-border spinner-border-sm"></span> : <><Trash2 size={16} class="me-1" />{t('common.delete')}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
