import { useState, useEffect, useRef } from 'preact/hooks';
import { api } from '../api/client.js';
import { StarRating } from '../components/StarRating.jsx';
//import { CoverImage } from '../components/CoverImage.jsx';
import { useI18n } from '../config/i18n/index.js';

const EMPTY_FORM = {
  title: '', artist_name: '', label_name: '', year: '', genre: '',
  total_duration: '', ean: '', rating: 0, cover_url: '', notes: '', tracks: [],
};

export function AlbumForm({ navigate, albumId }) {
  const { t } = useI18n();
  const isEdit = Boolean(albumId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef();

  // Load existing album for edit
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.getAlbum(albumId).then((album) => {
      setForm({
        title: album.title || '',
        artist_name: album.artist?.name || '',
        label_name: album.label?.name || '',
        year: album.year || '',
        genre: album.genre || '',
        total_duration: album.total_duration || '',
        ean: album.ean || '',
        rating: album.rating || 0,
        cover_url: album.cover_url || '',
        notes: album.notes || '',
        tracks: album.tracks || [],
      });
    }).catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [albumId]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
        rating: form.rating || undefined,
        tracks: form.tracks.map((t, i) => ({ ...t, position: t.position ?? i + 1 })),
      };
      if (isEdit) {
        await api.updateAlbum(albumId, payload);
      } else {
        await api.createAlbum(payload);
      }
      navigate('dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // External search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const isEAN = /^\d{8,13}$/.test(searchQuery.trim());
      if (isEAN) {
        const result = await api.searchByEan(searchQuery.trim());
        applyResult(result);
      } else {
        const results = await api.search(searchQuery.trim());
        setSearchResults(results);
      }
    } catch (e) {
      setSearchError(e.message);
    } finally {
      setSearching(false);
    }
  };

  const applyResult = (r) => {
    setForm({
      title: r.title || '',
      artist_name: r.artist_name || '',
      label_name: r.label_name || '',
      year: r.year || '',
      genre: r.genre || '',
      total_duration: r.total_duration || '',
      ean: r.ean || '',
      rating: form.rating,
      cover_url: r.cover_url || '',
      notes: '',
      tracks: r.tracks || [],
    });
    setSearchResults([]);
  };

  const selectRelease = async (r) => {
    setSearching(true);
    try {
      const full = await api.getRelease(r.mbid);
      applyResult(full);
    } catch {
      applyResult(r);
    } finally {
      setSearching(false);
    }
  };

  // Cover upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const { url } = await api.uploadCover(file);
      set('cover_url', url);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Track management
  const addTrack = () => {
    setForm((f) => ({
      ...f,
      tracks: [...f.tracks, { position: f.tracks.length + 1, title: '', duration: '' }],
    }));
  };

  const updateTrack = (idx, key, value) => {
    setForm((f) => {
      const tracks = [...f.tracks];
      tracks[idx] = { ...tracks[idx], [key]: value };
      return { ...f, tracks };
    });
  };

  const removeTrack = (idx) => {
    setForm((f) => ({
      ...f,
      tracks: f.tracks.filter((_, i) => i !== idx).map((t, i) => ({ ...t, position: i + 1 })),
    }));
  };

  if (loading) {
    return (
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div class="page-header d-print-none mb-3">
        <div class="row align-items-center">
          <div class="col-auto">
            <button class="btn btn-outline-secondary btn-sm" onClick={() => navigate('dashboard')}>
              <i class="ti ti-arrow-left me-1"></i>Retour
            </button>
          </div>
          <div class="col">
            <h2 class="page-title">
              <i class={`ti ${isEdit ? 'ti-pencil' : 'ti-plus'} me-2 text-primary`}></i>
              {isEdit ? 'Modifier l\'album' : 'Ajouter un CD'}
            </h2>
          </div>
        </div>
      </div>

      {error && (
        <div class="alert alert-danger mb-3">
          <i class="ti ti-alert-circle me-2"></i>{error}
          <button class="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* External search */}
      <div class="card mb-3">
        <div class="card-header">
          <h3 class="card-title">
            <i class="ti ti-search me-2 text-primary"></i>
            Recherche automatique (MusicBrainz)
          </h3>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-2">
            {t('albumForm.externalSearchHelp')}
          </p>
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder={t('albumForm.externalSearchPlaceholder')}
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button class="btn btn-outline-primary" type="button" onClick={handleSearch} disabled={searching}>
              {searching
                ? <span class="spinner-border spinner-border-sm"></span>
                : <><i class="ti ti-search me-1"></i>{t('albumForm.search')}</>}
            </button>
          </div>
          {searchError && <div class="text-danger small mt-1"><i class="ti ti-alert-circle me-1"></i>{searchError}</div>}

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div class="list-group mt-2 search-results-dropdown">
              {searchResults.map((r) => (
                <button
                  key={r.mbid}
                  type="button"
                  class="list-group-item list-group-item-action d-flex align-items-center gap-3"
                  onClick={() => selectRelease(r)}
                >
                  {/*<CoverImage src={r.cover_url} title={r.title} size={40} />*/}
                  <div class="flex-grow-1 text-start overflow-hidden">
                    <div class="fw-semibold text-truncate">{r.title}</div>
                    <div class="text-muted small">{r.artist_name} · {r.year || '?'} · {r.label_name}</div>
                  </div>
                  <i class="ti ti-chevron-right text-muted"></i>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div class="row g-3">
          {/* Left column: cover */}
          <div class="col-12 col-md-3">
            <div class="card h-100">
              <div class="card-body d-flex flex-column align-items-center gap-3">
                <div class="position-relative cover-preview">
                  <CoverImage src={form.cover_url} title={form.title} size={180} className="w-100 h-100" />
                  {uploadingCover && (
                    <div class="position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 rounded">
                      <div class="spinner-border spinner-border-sm text-white"></div>
                    </div>
                  )}
                </div>
                <div class="w-100">
                  <input ref={coverInputRef} type="file" class="d-none" accept="image/*" onChange={handleCoverUpload} />
                  <button type="button" class="btn btn-outline-secondary btn-sm w-100 mb-2"
                    onClick={() => coverInputRef.current.click()} disabled={uploadingCover}>
                    <i class="ti ti-upload me-1"></i>{t('albumForm.actions.uploadCover')}
                  </button>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder={t('albumForm.form.coverUrlPlaceholder')}
                    value={form.cover_url}
                    onInput={(e) => set('cover_url', e.target.value)}
                  />
                </div>
                <div class="w-100">
                  <label class="form-label small mb-1">{t('albumForm.form.rating')}</label>
                  <StarRating value={form.rating} onChange={(v) => set('rating', v)} />
                </div>
              </div>
            </div>
          </div>

          {/* Right column: main info */}
          <div class="col-12 col-md-9">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title"><i class="ti ti-info-circle me-2"></i>{t('albumForm.infoTitle')}</h3>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-12 col-sm-8">
                    <label class="form-label required">{t('albumForm.form.title')}</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder={t('albumForm.form.titlePlaceholder')}
                      required
                      value={form.title}
                      onInput={(e) => set('title', e.target.value)}
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <label class="form-label">{t('albumForm.form.year')}</label>
                    <input
                      type="number"
                      class="form-control"
                      placeholder={t('albumForm.form.yearPlaceholder')}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={form.year}
                      onInput={(e) => set('year', e.target.value)}
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <label class="form-label required">{t('albumForm.form.artist')}</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder={t('albumForm.form.artistPlaceholder')}
                      required
                      value={form.artist_name}
                      onInput={(e) => set('artist_name', e.target.value)}
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <label class="form-label">{t('albumForm.form.label')}</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder={t('albumForm.form.labelPlaceholder')}
                      value={form.label_name}
                      onInput={(e) => set('label_name', e.target.value)}
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <label class="form-label">{t('albumForm.form.genre')}</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder={t('albumForm.form.genrePlaceholder')}
                      value={form.genre}
                      onInput={(e) => set('genre', e.target.value)}
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <label class="form-label">{t('albumForm.form.duration')}</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder={t('albumForm.form.durationPlaceholder')}
                      value={form.total_duration}
                      onInput={(e) => set('total_duration', e.target.value)}
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <label class="form-label">{t('albumForm.form.ean')}</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder={t('albumForm.form.eanPlaceholder')}
                      value={form.ean}
                      onInput={(e) => set('ean', e.target.value)}
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label">{t('albumForm.form.notes')}</label>
                    <textarea
                      class="form-control"
                      rows="2"
                      placeholder={t('albumForm.form.notesPlaceholder')}
                      value={form.notes}
                      onInput={(e) => set('notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracklist */}
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex align-items-center">
                <h3 class="card-title mb-0"><i class="ti ti-list-numbers me-2"></i>{t('albumForm.tracksTitle')}</h3>
                <button type="button" class="btn btn-sm btn-outline-primary ms-auto" onClick={addTrack}>
                  <i class="ti ti-plus me-1"></i>{t('albumForm.form.addTrack')}
                </button>
              </div>
              {form.tracks.length > 0 ? (
                <div class="table-responsive">
                  <table class="table table-sm card-table">
                    <thead>
                      <tr>
                        <th class="track-number-col">{t('albumForm.form.trackNumber')}</th>
                        <th>{t('albumForm.form.trackTitle')}</th>
                        <th class="track-duration-col">{t('albumForm.form.trackDuration')}</th>
                        <th class="track-actions-col"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.tracks.map((track, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="number"
                              class="form-control form-control-sm"
                              min="1"
                              value={track.position ?? idx + 1}
                              onInput={(e) => updateTrack(idx, 'position', Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              class="form-control form-control-sm"
                              placeholder={t('albumForm.form.trackTitlePlaceholder')}
                              value={track.title}
                              onInput={(e) => updateTrack(idx, 'title', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              class="form-control form-control-sm"
                              placeholder={t('albumForm.form.durationPlaceholder')}
                              value={track.duration || ''}
                              onInput={(e) => updateTrack(idx, 'duration', e.target.value)}
                            />
                          </td>
                          <td>
                            <button type="button" class="btn btn-sm btn-ghost-danger p-1" onClick={() => removeTrack(idx)}>
                              <i class="ti ti-x"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div class="card-body text-center text-muted py-3">
                  <i class="ti ti-music-off me-1"></i>{t('albumForm.form.noTracks')}
                  <button type="button" class="btn btn-link p-0 ms-1" onClick={addTrack}>{t('albumForm.form.addFirstTrack')}</button>
                </div>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div class="col-12 d-flex gap-2 justify-content-end mb-4">
            <button type="button" class="btn btn-outline-secondary" onClick={() => navigate('dashboard')}>
              {t('albumForm.actions.cancel')}
            </button>
            <button type="submit" class="btn btn-primary" disabled={saving}>
              {saving
                ? <><span class="spinner-border spinner-border-sm me-1"></span>{t('common.loading')}</>
                : <><i class={`ti ${isEdit ? 'ti-device-floppy' : 'ti-plus'} me-1`}></i>{t('albumForm.actions.save')}</>}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
