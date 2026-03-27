import { useState, useEffect, useRef } from 'preact/hooks';
import { albumsApi } from '../api/albums.js';
import { api } from '../api/client.js';
import { AlbumCard } from '../components/AlbumCard.jsx';
import { AlbumRow } from '../components/AlbumRow.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useI18n } from '../config/i18n/index.js';
import { Search, Grid, List, X, Plus, Disc, Database, AlertCircle, Music } from 'lucide-preact';

const LIMIT_OPTIONS = [10, 20, 50, 100, 999999];
const DEFAULT_LIMIT = 20;

export function Collections({ navigate, params = {} }) {
  const { t } = useI18n();
  const [albums, setAlbums] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeDatabase, setActiveDatabase] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('jewelbox-viewMode');
    return saved || 'grid';
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(() => {
    const saved = localStorage.getItem('jewelbox-limit');
    return saved ? Number(saved) : DEFAULT_LIMIT;
  });
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({ genre: '', rating: '', search: '', sort: 'artist', order: 'asc' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lendTarget, setLendTarget] = useState(null);
  const [lentTo, setLentTo] = useState('');
  const [toast, setToast] = useState(params.successMessage ? { msg: params.successMessage, type: 'success' } : null);
  const searchRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (params.successMessage) {
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  // Save viewMode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('jewelbox-viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [genresData, dbData] = await Promise.all([
          albumsApi.getGenres().catch(() => []),
          albumsApi.getActiveDatabase().catch(() => null)
        ]);
        setGenres(genresData);
        setActiveDatabase(dbData?.database);
      } catch (e) {
        console.error('Failed to load initial data:', e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadAlbums = async () => {
      if (!activeDatabase) return;
      
      setLoading(true);
      try {
        const result = await albumsApi.getAll({ page, limit, ...filters });
        setAlbums(result.data);
        setTotal(result.pagination.total);
      } catch (e) {
        showToast(e.message, 'danger');
      } finally {
        setLoading(false);
      }
    };
    
    loadAlbums();
  }, [page, limit, filters, activeDatabase]);

  useEffect(() => {
    localStorage.setItem('jewelbox-limit', limit);
  }, [limit]);

  const setFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(Number(newLimit));
    setPage(1);
    localStorage.setItem('jewelbox-limit', newLimit);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setFilter('search', searchRef.current.value);
    }
  };

  const handleClearSearch = () => {
    searchRef.current.value = '';
    setFilter('search', '');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteAlbum(deleteTarget.id);
      setAlbums(prev => prev.filter(a => a.id !== deleteTarget.id));
      setTotal(prev => prev - 1);
      showToast(t('messages.albumDeleted').replace('{title}', deleteTarget.title), 'success');
    } catch (e) {
      showToast(e.message, 'danger');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleLend = async () => {
    if (!lendTarget) return;
    try {
      const isLent = !lendTarget.is_lent;
      const updated = await api.lendAlbum(lendTarget.id, isLent, isLent ? lentTo || null : null);
      setAlbums(prev => prev.map(a => a.id === lendTarget.id ? { ...a, is_lent: updated.is_lent, lent_to: updated.lent_to } : a));
      showToast(isLent ? t('messages.albumLent').replace('{title}', lendTarget.title) : t('messages.albumReturned').replace('{title}', lendTarget.title), 'success');
    } catch (e) {
      showToast(e.message, 'danger');
    } finally {
      setLendTarget(null);
      setLentTo('');
    }
  };

  const handleRate = async (album, rating) => {
    try {
      const updated = await albumsApi.update(album.id, { rating });
      setAlbums(prev => prev.map(a => a.id === album.id ? { ...a, rating: updated.rating } : a));
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const stats = { total, lent: albums.filter(a => a.is_lent).length };

  if (!activeDatabase) {
    return (
      <div class="page-container">
        {toast && (
          <div class={`alert alert-${toast.type} alert-dismissible toast-notification top-0 end-0 m-3`}>
            {toast.msg}
            <button type="button" class="btn-close" onClick={() => setToast(null)}></button>
          </div>
        )}
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h2 class="card-title">
                    <Disc size={24} class="me-2 text-primary" />
                    {t('menu.collections')}
                  </h2>
                </div>
                <div class="card-body text-center py-5">
                  <Database size={48} class="text-muted mb-3" />
                  <h4 class="text-muted">Aucune base de données active</h4>
                  <p class="text-muted">
                    Veuillez activer une base de données depuis le Dashboard pour voir les collections.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div class={`alert alert-${toast.type} alert-dismissible toast-notification top-0 end-0 m-3`}>
          {toast.msg}
          <button type="button" class="btn-close" onClick={() => setToast(null)}></button>
        </div>
      )}

      <div class="header-container">
        {/* Action Button */}
        <div class="mb-3">
          <button class="btn btn-primary" onClick={() => navigate('add')}>
            <Plus size={16} class="me-1" />
            {t('common.addAlbum')}
          </button>
        </div>

        
          {loading && (
            <div class="text-center py-5">
              <div class="spinner-border" role="status"></div>
            </div>
          )}

          
          {!loading && (
            <div class="card mb-3">
              <div class="card-body">
                {/* Top controls */}
                <div class="row g-2 align-items-center mb-4">
                  <div class="col-md-3">
                    <div class="d-flex align-items-center gap-2">
                      <span class="text-muted me-2">{t('dashboard.pagination.itemsPerPage')}</span>
                      <select class="form-select form-select-sm" style="width: auto;" value={limit} onChange={(e) => handleLimitChange(e.target.value)}>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="999999">{t('common.all')}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-5">
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        placeholder={t('dashboard.searchPlaceholder')}
                        ref={searchRef}
                        value={filters.search || ''}
                        onKeyPress={handleSearch}
                        onChange={(e) => searchRef.current.value = e.target.value}
                      />
                      <button class="btn btn-outline-secondary" type="button" onClick={handleSearch}>
                        <Search size={16} />
                      </button>
                      {filters.search && (
                        <button class="btn btn-outline-secondary text-danger" type="button" onClick={handleClearSearch}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div class="col-md-2">
                    <select class="form-select" value={`${filters.sort}_${filters.order}`} onChange={(e) => {
                      const [sort, order] = e.target.value.split('_');
                      setFilters({ ...filters, sort, order });
                    }}>
                      <option value="title_asc">{t('filters.sortTitleAsc')}</option>
                      <option value="title_desc">{t('filters.sortTitleDesc')}</option>
                      <option value="artist_asc">{t('filters.sortArtistAsc')}</option>
                      <option value="artist_desc">{t('filters.sortArtistDesc')}</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <div class="btn-group w-100">
                      <button class={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('grid')}>
                        <Grid size={16} class="me-1" />
                        {t('common.grid')}
                      </button>
                      <button class={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('list')}>
                        <List size={16} class="me-1" />
                        {t('common.list')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid/List content */}
                {albums.length > 0 ? (
                  <>
                    {viewMode === 'grid' && (
                      <div class="row row-cards">
                        {albums.map(album => (
                          <div class="col-sm-6 col-lg-2 album-grid-item" key={album.id}>
                            <AlbumCard
                              album={album}
                              onClick={(a) => navigate('detail', { id: a.id })}
                              onEdit={(a) => navigate('edit', { id: a.id })}
                              onDelete={(a) => setDeleteTarget(a)}
                              onLend={(a) => { setLendTarget(a); setLentTo(a.lent_to || ''); }}
                              onRate={handleRate}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {viewMode === 'list' && (
                      <div class="card">
                        <div class="table-responsive">
                          <table class="table table-vcenter card-table">
                            <thead>
                              <tr>
                                <th>{t('table.cover')}</th>
                                <th>{t('table.title')}</th>
                                <th>{t('table.artist')}</th>
                                <th>{t('table.year')}</th>
                                <th>{t('table.genre')}</th>
                                <th>{t('table.rating')}</th>
                                <th>{t('table.actions')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {albums.map(album => (
                                <AlbumRow
                                  key={album.id}
                                  album={album}
                                  onClick={(a) => navigate('detail', { id: a.id })}
                                  onEdit={(a) => navigate('edit', { id: a.id })}
                                  onDelete={(a) => setDeleteTarget(a)}
                                  onLend={(a) => { setLendTarget(a); setLentTo(a.lent_to || ''); }}
                                  onRate={handleRate}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Bottom controls */}
                    <div class="mt-4 d-flex justify-content-between align-items-center">
                      <div class="text-muted">
                        {t('dashboard.pagination.showing', { 
                          start: (page - 1) * limit + 1, 
                          end: Math.min(page * limit, total), 
                          total 
                        })}
                      </div>
                      <Pagination page={page} limit={limit} total={total} onChange={setPage} />
                    </div>
                  </>
                ) : (
                  <div class="empty">
                    <div class="empty-img">
                      {total === 0 && !filters.search ? (
                        <Music size={48} class="text-muted mb-3" />
                      ) : (
                        <Search size={48} class="text-muted mb-3" />
                      )}
                    </div>
                    <p class="empty-title">
                      {total === 0 && !filters.search ? t('dashboard.noAlbums') : t('dashboard.search.noResults')}
                    </p>
                    <p class="empty-subtitle text-muted">
                      {total === 0 && !filters.search 
                        ? t('dashboard.addFirstAlbum')
                        : filters.search 
                          ? t('dashboard.search.noResultsMessage', { query: filters.search })
                          : t('dashboard.search.noAlbumsMessage')
                      }
                    </p>
                    <div class="mt-3">
                      {total === 0 && !filters.search ? (
                        <button class="btn btn-primary" onClick={() => navigate('add')}>
                          <Plus size={16} class="me-1" />
                          {t('common.addAlbum')}
                        </button>
                      ) : filters.search ? (
                        <button class="btn btn-primary" onClick={handleClearSearch}>
                          <X size={16} class="me-1" />
                          {t('dashboard.search.clearSearch')}
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      {deleteTarget && (
        <div class="modal modal-blur show d-block modal-backdrop-dark">
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-body">
                <div class="modal-title">{t('modals.deleteTitle')}</div>
                <div>{t('modals.deleteMessage', { title: deleteTarget.title })}</div>
              </div>
              <div class="modal-footer">
                <button class="btn me-auto" onClick={() => setDeleteTarget(null)}>{t('modals.cancel')}</button>
                <button class="btn btn-danger" onClick={handleDelete}>{t('card.delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lendTarget && (
        <div class="modal modal-blur show d-block modal-backdrop-dark">
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{lendTarget.is_lent ? t('modals.returnTitle') : t('modals.lendTitle')}</h5>
                <button class="btn-close" onClick={() => setLendTarget(null)}></button>
              </div>
              <div class="modal-body">
                <p>{lendTarget.title}</p>
                {!lendTarget.is_lent && (
                  <input
                    type="text"
                    class="form-control"
                    placeholder={t('modals.lendPlaceholder')}
                    value={lentTo}
                    onChange={(e) => setLentTo(e.target.value)}
                  />
                )}
              </div>
              <div class="modal-footer">
                <button class="btn me-auto" onClick={() => setLendTarget(null)}>{t('modals.cancel')}</button>
                <button class="btn btn-primary" onClick={handleLend}>
                  {lendTarget.is_lent ? t('modals.returnTitle') : t('modals.lendTitle')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
