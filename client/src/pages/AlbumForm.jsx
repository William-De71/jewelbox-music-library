import { useState, useEffect, useRef } from 'preact/hooks';
import { api } from '../api/client.js';
import { StarRating } from '../components/StarRating.jsx';
import { Plus, ArrowLeft, Pencil, AlertCircle, Search, ChevronRight, Upload, Info, ListOrdered, X, Music2, Save, ImageIcon } from 'lucide-preact';
//import { CoverImage } from '../components/CoverImage.jsx';
import { useI18n } from '../config/i18n/index.js';

const EMPTY_FORM = {
  title: '', artist_name: '', label_name: '', year: '', genre: '',
  total_duration: '', ean: '', rating: 0, cover_url: '', notes: '', tracks: [], is_wanted: false,
};

export function AlbumForm({ navigate, albumId, params = {} }) {
  const { t } = useI18n();
  const isEdit = Boolean(albumId);
  const fromWantList = Boolean(params.fromWantList);
  const [form, setForm] = useState({ ...EMPTY_FORM, is_wanted: fromWantList });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchSource, setSearchSource] = useState('musicbrainz');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchResultsPerPage] = useState(10);
  const [toast, setToast] = useState(null);
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
        is_wanted: Boolean(album.is_wanted),
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
      navigate(fromWantList ? 'wantlist' : 'collections');
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
    setSearchPage(1);
    try {
      const isEAN = /^\d{8,13}$/.test(searchQuery.trim());
      if (isEAN) {
        const result = await api.searchByEan(searchQuery.trim(), searchSource);
        applyResult(result);
      } else {
        const results = await api.search(searchQuery.trim(), searchSource);
        setSearchResults(results);
        if (!results || results.length === 0) showToast(t('albumForm.searchNoResults'));
      }
    } catch (e) {
      setSearchError(e.message);
    } finally {
      setSearching(false);
    }
  };

  const showToast = (msg, type = 'warning') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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
      is_wanted: fromWantList || Boolean(r.is_wanted),
      tracks: r.tracks || [],
    });
    setSearchResults([]);
  };

  const selectRelease = async (r) => {
    setSearching(true);
    try {
      let full;
      if (r.source === 'discogs') {
        full = await api.getDiscogsRelease(r.id);
      } else {
        full = await api.getRelease(r.mbid);
      }
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
    <div class="container-xl">
      {toast && (
        <div class={`alert alert-${toast.type} alert-dismissible toast-notification top-0 end-0 m-3`}>
          {toast.msg}
          <button type="button" class="btn-close" onClick={() => setToast(null)} />
        </div>
      )}
      <div class="page-header d-print-none mb-3">
        <div class="row align-items-center">
          <div class="col-auto">
            <button class="btn btn-outline-secondary" onClick={() => navigate(fromWantList ? 'wantlist' : 'collections')}>
              <ArrowLeft size={16} class="me-1" />{t('common.back')}
            </button>
          </div>
          <div class="col">
            <h2 class="page-title">
              {isEdit ? <Pencil size={20} class="me-2 text-primary" /> : <Plus size={20} class="me-2 text-primary" />}
              {isEdit ? t('albumForm.editTitle') : t('albumForm.addTitle')}
            </h2>
          </div>
        </div>
      </div>

      {error && (
        <div class="alert alert-danger mb-3">
          <AlertCircle size={16} class="me-2" />{error}
          <button class="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* External search */}
      <div class="card mb-3">
        <div class="card-header">
          <h3 class="card-title">
            <Search size={18} class="me-2 text-primary" />
            {t('albumForm.externalSearch')}
          </h3>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-2">
            {t('albumForm.externalSearchHelp')}
          </p>
          <div class="row g-2 mb-3">
            <div class="col-md-4">
              <label class="form-label small">{t('albumForm.searchSource')}</label>
              <select 
                class="form-select" 
                value={searchSource} 
                onChange={(e) => setSearchSource(e.target.value)}
              >
                <option value="musicbrainz">{t('albumForm.musicbrainz')}</option>
                <option value="discogs">{t('albumForm.discogs')}</option>
              </select>
            </div>
            <div class="col-md-8">
              <label class="form-label small">{t('albumForm.externalSearchPlaceholder')}</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder={t('albumForm.externalSearchPlaceholder')}
                  value={searchQuery}
                  onInput={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button class="btn btn-primary btn-fixed-height" type="button" onClick={handleSearch} disabled={searching}>
                  {searching ? (
                    <><span class="spinner-border spinner-border-xs me-1"></span><span>{t('common.loading')}</span></>
                  ) : (
                    <><Search size={16} class="me-1" /><span>{t('albumForm.search')}</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
          {searchError && <div class="text-danger small mt-1"><AlertCircle size={14} class="me-1" />{searchError}</div>}

          {/* Search results */}
          {searchResults.length > 0 && (() => {
            const startIdx = (searchPage - 1) * searchResultsPerPage;
            const endIdx = startIdx + searchResultsPerPage;
            const paginatedResults = searchResults.slice(startIdx, endIdx);
            const totalPages = Math.ceil(searchResults.length / searchResultsPerPage);
            
            return (
              <div class="card mt-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h4 class="card-title mb-0">
                    {searchResults.length} {searchResults.length === 1 ? 'résultat trouvé' : 'résultats trouvés'}
                  </h4>
                  {totalPages > 1 && (
                    <div class="text-muted small">
                      Page {searchPage} / {totalPages}
                    </div>
                  )}
                </div>
                <div class="list-group list-group-flush">
                  {paginatedResults.map((r) => (
                  <button
                    key={r.mbid || r.id}
                    type="button"
                    class="list-group-item list-group-item-action"
                    onClick={() => selectRelease(r)}
                  >
                    <div class="row align-items-center">
                      <div class="col-auto">
                        {r.cover_url ? (
                          <img src={r.cover_url} alt={r.title} class="avatar avatar-md" style="object-fit: cover;" />
                        ) : (
                          <div class="avatar avatar-md bg-secondary-lt">
                            <Music2 size={24} />
                          </div>
                        )}
                      </div>
                      <div class="col">
                        <div class="fw-bold">{r.title}</div>
                        <div class="text-muted">
                          <span class="me-2"><strong>Artiste:</strong> {r.artist_name}</span>
                          {r.year && <span class="me-2"><strong>Année:</strong> {r.year}</span>}
                        </div>
                        {r.label_name && (
                          <div class="text-muted small">
                            <strong>Label:</strong> {r.label_name}
                          </div>
                        )}
                        {r.ean && (
                          <div class="text-muted small">
                            <strong>EAN:</strong> {r.ean}
                          </div>
                        )}
                      </div>
                      <div class="col-auto">
                        <ChevronRight size={20} class="text-muted" />
                      </div>
                    </div>
                  </button>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div class="card-footer d-flex justify-content-between align-items-center">
                    <button 
                      class="btn btn-sm"
                      onClick={() => setSearchPage(p => Math.max(1, p - 1))}
                      disabled={searchPage === 1}
                    >
                      Précédent
                    </button>
                    <span class="text-muted small">
                      {startIdx + 1}-{Math.min(endIdx, searchResults.length)} sur {searchResults.length}
                    </span>
                    <button 
                      class="btn btn-sm"
                      onClick={() => setSearchPage(p => Math.min(totalPages, p + 1))}
                      disabled={searchPage === totalPages}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div class="row g-3">
          {/* Left column: cover */}
          <div class="col-12 col-md-3">
            <div class="card h-100">
              <div class="card-body d-flex flex-column align-items-center gap-3">
                <div class="position-relative cover-preview">
                  {form.cover_url ? (
                    <img 
                      src={form.cover_url} 
                      alt={form.title || 'Album cover'} 
                      class="w-100 h-100 rounded object-fit-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div class="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary-subtle rounded">
                      <ImageIcon size={48} class="text-muted" />
                    </div>
                  )}
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
                    <Upload size={16} class="me-1" />{t('albumForm.actions.uploadCover')}
                  </button>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder={t('albumForm.form.coverUrlPlaceholder')}
                    value={form.cover_url}
                    onInput={(e) => set('cover_url', e.target.value)}
                  />
                </div>
                <div class="w-100 mt-3">
                  <label class="form-label small mb-2">{t('albumForm.form.rating')}</label>
                  <StarRating value={form.rating} onChange={(v) => set('rating', v)} />
                </div>
              </div>
            </div>
          </div>

          {/* Right column: main info */}
          <div class="col-12 col-md-9">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title"><Info size={18} class="me-2" />{t('albumForm.infoTitle')}</h3>
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
                  <div class="col-12">
                    <label class="form-check">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        checked={form.is_wanted}
                        onChange={(e) => set('is_wanted', e.target.checked)}
                      />
                      <span class="form-check-label">{t('albumForm.form.isWanted')}</span>
                    </label>
                    <div class="form-hint">{t('albumForm.form.isWantedHint')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracklist */}
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex align-items-center">
                <h3 class="card-title mb-0"><ListOrdered size={18} class="me-2" />{t('albumForm.tracksTitle')}</h3>
                <button type="button" class="btn btn-primary ms-auto" onClick={addTrack}>
                  <Plus size={16} class="me-1" />{t('albumForm.form.addTrack')}
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
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div class="card-body text-center py-3">
                  <div class="text-muted mb-3">
                    <Music2 size={16} class="me-1" />{t('albumForm.form.noTracks')}
                  </div>
                  <button type="button" class="btn btn-primary" onClick={addTrack}>
                    <Plus size={16} class="me-1" />{t('albumForm.form.addFirstTrack')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div class="col-12 d-flex gap-2 justify-content-end mb-4">
            <button type="button" class="btn" onClick={() => navigate(fromWantList ? 'wantlist' : 'collections')}>
              {t('albumForm.actions.cancel')}
            </button>
            <button type="submit" class="btn btn-primary btn-fixed-height" disabled={saving}>
              {saving ? (
                <><span class="spinner-border spinner-border-xs me-1"></span><span>{t('common.loading')}</span></>
              ) : (
                <>{isEdit ? <Save size={16} class="me-1" /> : <Plus size={16} class="me-1" />}<span>{t('albumForm.actions.save')}</span></>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
