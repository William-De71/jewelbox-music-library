import { useState, useEffect, useRef } from 'preact/hooks';
import { albumsApi } from '../api/albums.js';
import { api } from '../api/client.js';
import { useI18n } from '../config/i18n/index.js';
import { ArrowRightLeft, Music2, Search, User, Check, X, Database, RotateCcw, Clock } from 'lucide-preact';

function daysAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export function Lend({ navigate }) {
  const { t } = useI18n();
  const [lentAlbums, setLentAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDatabase, setActiveDatabase] = useState(null);
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [borrowerName, setBorrowerName] = useState('');
  const [returnTarget, setReturnTarget] = useState(null);
  const [borrowers, setBorrowers] = useState([]);
  const [showBorrowerSuggestions, setShowBorrowerSuggestions] = useState(false);
  const searchTimeout = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadLent = async () => {
    try {
      const result = await albumsApi.getAll({ lent: 'true', limit: 200, wanted: 'false' });
      setLentAlbums(result.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const dbData = await albumsApi.getActiveDatabase().catch(() => null);
      setActiveDatabase(dbData?.database);
      if (dbData?.database) {
        await loadLent();
        api.getBorrowers().then(setBorrowers).catch(() => {});
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSearchInput = (value) => {
    setSearchQuery(value);
    setSelectedAlbum(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const result = await albumsApi.getAll({ search: value.trim(), wanted: 'false', limit: 8 });
        setSearchResults(result.data.filter(a => !a.is_lent));
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album);
    setSearchQuery(`${album.title} — ${album.artist?.name || ''}`);
    setSearchResults([]);
    setBorrowerName('');
  };

  const handleLend = async () => {
    if (!selectedAlbum || !borrowerName.trim()) return;
    try {
      await api.lendAlbum(selectedAlbum.id, true, borrowerName.trim());
      showToast(t('messages.albumLent').replace('{title}', selectedAlbum.title));
      setSelectedAlbum(null);
      setSearchQuery('');
      setBorrowerName('');
      setSearchResults([]);
      await loadLent();
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleReturn = async () => {
    if (!returnTarget) return;
    try {
      await api.lendAlbum(returnTarget.id, false, null);
      showToast(t('messages.albumReturned').replace('{title}', returnTarget.title));
      setReturnTarget(null);
      await loadLent();
    } catch (e) {
      showToast(e.message, 'danger');
      setReturnTarget(null);
    }
  };

  if (!activeDatabase) {
    return (
      <div class="page-container">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h2 class="card-title">
                    <ArrowRightLeft size={24} class="me-2 text-warning" />
                    {t('menu.lend')}
                  </h2>
                </div>
                <div class="card-body text-center py-5">
                  <Database size={48} class="text-muted mb-3" />
                  <h4 class="text-muted">{t('home.noActiveDatabase')}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="page-container">
      {toast && (
        <div class={`alert alert-${toast.type} alert-dismissible`}
          style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, minWidth: 280 }}>
          {toast.msg}
          <button type="button" class="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      <div class="container-fluid">
        <div class="row g-3">
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h2 class="card-title mb-0">
                  <ArrowRightLeft size={24} class="me-2 text-warning" />
                  {t('menu.lend')}
                </h2>
                {lentAlbums.length > 0 && (
                  <span class="badge bg-warning-lt text-warning fs-6">
                    {lentAlbums.length} {lentAlbums.length > 1 ? t('lend.albumsLent') : t('lend.albumLent')}
                  </span>
                )}
              </div>
              <div class="card-body">

                {/* ── Lend an album ────────────────────────────────────────── */}
                <div class="card mb-4">
                  <div class="card-header">
                    <h3 class="card-title fs-5 mb-0">
                      <ArrowRightLeft size={16} class="me-2 text-warning" />
                      {t('lend.lendNew')}
                    </h3>
                  </div>
                  <div class="card-body">
                    <div class="row g-3 align-items-end">
                      <div class="col-md-5">
                        <label class="form-label">{t('lend.searchAlbum')}</label>
                        <div class="input-group position-relative">
                          <span class="input-group-text"><Search size={16} /></span>
                          <input
                            type="text"
                            class="form-control"
                            placeholder={t('lend.searchPlaceholder')}
                            value={searchQuery}
                            onInput={(e) => handleSearchInput(e.target.value)}
                            autocomplete="off"
                          />
                          {searching && (
                            <span class="input-group-text">
                              <span class="spinner-border spinner-border-sm" />
                            </span>
                          )}
                          {searchQuery && !searching && (
                            <button class="btn btn-outline-secondary" type="button"
                              onClick={() => { setSearchQuery(''); setSelectedAlbum(null); setSearchResults([]); }}>
                              <X size={14} />
                            </button>
                          )}
                          {searchResults.length > 0 && (
                            <div class="dropdown-menu show w-100"
                              style={{ top: '100%', left: 0, maxHeight: 260, overflowY: 'auto', zIndex: 1050 }}>
                              {searchResults.map(album => (
                                <button key={album.id} type="button"
                                  class="dropdown-item d-flex align-items-center gap-2 py-2"
                                  onMouseDown={() => handleSelectAlbum(album)}>
                                  {album.cover_url
                                    ? <img src={album.cover_url} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                                    : <div class="bg-secondary-lt rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 32, height: 32 }}>
                                        <Music2 size={14} class="text-muted" />
                                      </div>
                                  }
                                  <div class="overflow-hidden">
                                    <div class="fw-semibold text-truncate small">{album.title}</div>
                                    <div class="text-muted" style={{ fontSize: '0.72rem' }}>{album.artist?.name}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">{t('lend.borrower')}</label>
                        <div class="position-relative">
                          <div class="input-group">
                            <span class="input-group-text"><User size={16} /></span>
                            <input
                              type="text"
                              class="form-control"
                              placeholder={t('lend.borrowerPlaceholder')}
                              value={borrowerName}
                              onInput={(e) => { setBorrowerName(e.target.value); setShowBorrowerSuggestions(true); }}
                              onFocus={() => setShowBorrowerSuggestions(true)}
                              onBlur={() => setTimeout(() => setShowBorrowerSuggestions(false), 150)}
                              onKeyDown={(e) => e.key === 'Enter' && handleLend()}
                              disabled={!selectedAlbum}
                            />
                          </div>
                          {showBorrowerSuggestions && borrowers.filter(n => n.toLowerCase().includes(borrowerName.toLowerCase())).length > 0 && (
                            <div class="dropdown-menu show w-100" style={{ top: '100%', left: 0, zIndex: 1050 }}>
                              {borrowers
                                .filter(n => n.toLowerCase().includes(borrowerName.toLowerCase()))
                                .map(name => (
                                  <button key={name} type="button" class="dropdown-item d-flex align-items-center gap-2 py-2"
                                    onMouseDown={() => { setBorrowerName(name); setShowBorrowerSuggestions(false); }}>
                                    <User size={14} class="text-muted flex-shrink-0" />
                                    <span>{name}</span>
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div class="col-md-3">
                        <button class="btn btn-warning w-100"
                          onClick={handleLend}
                          disabled={!selectedAlbum || !borrowerName.trim()}>
                          <ArrowRightLeft size={15} class="me-1" />
                          {t('lend.confirmLend')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Active loans list ──────────────────────────────────────── */}
                {loading ? (
                  <div class="text-center py-5">
                    <div class="spinner-border" role="status" />
                  </div>
                ) : lentAlbums.length === 0 ? (
                  <div class="empty py-5">
                    <div class="empty-img">
                      <ArrowRightLeft size={48} class="text-muted mb-3" />
                    </div>
                    <p class="empty-title">{t('lend.empty')}</p>
                    <p class="empty-subtitle text-muted">{t('lend.emptySubtitle')}</p>
                  </div>
                ) : (
                  <div class="list-group list-group-flush rounded">
                    {lentAlbums.map(album => (
                      <div key={album.id}
                        class="list-group-item lend-item d-flex align-items-center gap-3 py-3">
                        {album.cover_url
                          ? <img src={album.cover_url} alt=""
                              style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                          : <div class="bg-secondary-lt rounded d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 52, height: 52 }}>
                              <Music2 size={22} class="text-muted" />
                            </div>
                        }
                        <div class="flex-grow-1 overflow-hidden" style={{ cursor: 'pointer' }}
                          onClick={() => navigate('detail', { id: album.id })}>
                          <div class="fw-semibold text-truncate">{album.title}</div>
                          <div class="text-muted small">{album.artist?.name}</div>
                        </div>
                        <div class="d-flex align-items-center gap-3 flex-shrink-0">
                          <div class="text-end">
                            <div class="d-flex align-items-center gap-1">
                              <User size={14} class="text-warning" />
                              <span class="small fw-semibold">{album.lent_to || '—'}</span>
                            </div>
                            {album.lent_at && (
                              <div class="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.72rem' }}>
                                <Clock size={11} />
                                {t('lend.lentSince')} {daysAgo(album.lent_at)} {t('lend.days')}
                              </div>
                            )}
                          </div>
                          <button class="btn btn-sm btn-outline-success"
                            onClick={() => setReturnTarget(album)}>
                            <RotateCcw size={14} class="me-1" />
                            {t('lend.return')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal retour ────────────────────────────────────────────────── */}
      {returnTarget && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => setReturnTarget(null)}
        >
          <div
            style={{ backgroundColor: 'var(--tblr-bg-surface)', borderRadius: 8, padding: 0, maxWidth: 400, width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={18} class="text-success" />
                {t('lend.returnTitle')}
              </h5>
              <p style={{ margin: 0 }}>{t('lend.returnMessage').replace('{title}', returnTarget.title)}</p>
              {returnTarget.lent_to && (
                <p class="text-muted small mt-1 mb-0">{t('lend.lentTo')} <strong>{returnTarget.lent_to}</strong></p>
              )}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--tblr-border-color)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button class="btn btn-outline-secondary me-auto" onClick={() => setReturnTarget(null)}>{t('modals.cancel')}</button>
              <button class="btn btn-success" onClick={handleReturn}>
                <Check size={15} class="me-1" />
                {t('lend.returnConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
