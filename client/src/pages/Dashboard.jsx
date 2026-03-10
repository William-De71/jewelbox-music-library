import { useState, useEffect, useRef } from 'preact/hooks';
import { api } from '../api/client.js';
import { AlbumCard } from '../components/AlbumCard.jsx';
import { AlbumRow } from '../components/AlbumRow.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { StatsCard } from '../components/StatsCard.jsx';
import { useI18n } from '../config/i18n/index.js';

const LIMIT = 24;

export function Dashboard({ navigate }) {
  const { t } = useI18n();
  const [albums, setAlbums] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('jewelbox-viewMode');
    return saved || 'grid';
  });
  const [page, setPage] = useState(1);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({ genre: '', rating: '', search: '', sort: 'title', order: 'asc' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lendTarget, setLendTarget] = useState(null);
  const [lentTo, setLentTo] = useState('');
  const [toast, setToast] = useState(null);
  const searchRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Save viewMode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('jewelbox-viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    api.getGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    const loadAlbums = async () => {
      setLoading(true);
      try {
        const result = await api.getAlbums({ page, limit: LIMIT, ...filters });
        setAlbums(result.data);
        setTotal(result.total);
      } catch (e) {
        showToast(e.message, 'danger');
      } finally {
        setLoading(false);
      }
    };
    
    loadAlbums();
  }, [page, filters]);

  const setFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPage(1);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setFilter('search', searchRef.current.value);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteAlbum(deleteTarget.id);
      showToast(t('messages.albumDeleted', { title: deleteTarget.title }));
      setDeleteTarget(null);
      const result = await api.getAlbums({ page, limit: LIMIT, ...filters });
      setAlbums(result.data);
      setTotal(result.total);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleLend = async () => {
    if (!lendTarget) return;
    try {
      const is_lent = !lendTarget.is_lent;
      await api.lendAlbum(lendTarget.id, is_lent, lentTo);
      showToast(is_lent ? t('messages.albumLent', { title: lendTarget.title }) : t('messages.albumReturned', { title: lendTarget.title }));
      setLendTarget(null);
      setLentTo('');
      const result = await api.getAlbums({ page, limit: LIMIT, ...filters });
      setAlbums(result.data);
      setTotal(result.total);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleRate = async (album, rating) => {
    try {
      await api.updateAlbum(album.id, { rating });
      showToast(t('messages.ratingUpdated', { title: album.title }));
      const result = await api.getAlbums({ page, limit: LIMIT, ...filters });
      setAlbums(result.data);
      setTotal(result.total);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const stats = { total, lent: albums.filter(a => a.is_lent).length };

  return (
    <div>
      {toast && (
        <div class={`alert alert-${toast.type} alert-dismissible position-fixed top-0 end-0 m-3`}>
          {toast.msg}
          <button type="button" class="btn-close" onClick={() => setToast(null)}></button>
        </div>
      )}

      <div class="header-container">
        {/* Stats Cards Section */}
        <div class="row g-3 mb-4">
          <StatsCard 
            icon="disc" 
            title={total !== 1 ? t('stats.albumsLabel') : t('stats.albumLabel')}
            value={total}
            color="primary"
          />
          <StatsCard 
            icon="user-share" 
            title={stats.lent !== 1 ? t('stats.lentLabelPlural') : t('stats.lentLabel')}
            value={stats.lent}
            color="warning"
          />
          <StatsCard 
            icon="music" 
            title={t('stats.genresLabel')}
            value={genres.length}
            color="info"
          />
          <StatsCard 
            icon="star-filled" 
            title={t('stats.ratedLabel')}
            value={albums.filter(a => a.rating > 0).length}
            color="success"
          />
        </div>

        {/* Action Button */}
        <div class="mb-3">
          <button class="btn btn-primary" onClick={() => navigate('add')}>
            <i class="ti ti-plus me-1"></i>
            {t('common.addAlbum')}
          </button>
        </div>

        {/* Filters Section */}
        <div class="card mb-3">
          <div class="card-body">
            <div class="row g-2">
                <div class="col-md-4">
                  <input
                    type="text"
                    class="form-control"
                    placeholder={t('dashboard.searchPlaceholder')}
                    ref={searchRef}
                    onKeyPress={handleSearch}
                  />
                </div>
                <div class="col-md-2">
                  <select class="form-select" value={filters.genre} onChange={(e) => setFilter('genre', e.target.value)}>
                    <option value="">{t('filters.allGenres')}</option>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div class="col-md-2">
                  <select class="form-select" value={filters.rating} onChange={(e) => setFilter('rating', e.target.value)}>
                    <option value="">{t('filters.allRatings')}</option>
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r > 1 ? t('filters.starsPlural', { count: r }) : t('filters.stars', { count: r })}</option>)}
                  </select>
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
                    <option value="year_desc">{t('filters.sortYearDesc')}</option>
                    <option value="year_asc">{t('filters.sortYearAsc')}</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <div class="btn-group w-100">
                    <button class={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('grid')}>
                      <i class="ti ti-layout-grid me-1"></i>
                      {t('common.grid')}
                    </button>
                    <button class={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('list')}>
                      <i class="ti ti-list me-1"></i>
                      {t('common.list')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div class="text-center py-5">
              <div class="spinner-border" role="status"></div>
            </div>
          )}

          {!loading && albums.length === 0 && (
            <div class="empty">
              <div class="empty-img"><i class="ti ti-music dashboard-empty-icon"></i></div>
              <p class="empty-title">{t('dashboard.noAlbums')}</p>
              {total === 0 && (
                <button class="btn btn-primary" onClick={() => navigate('add')}>
                  <i class="ti ti-plus me-1"></i>{t('common.addAlbum')}
                </button>
              )}
            </div>
          )}

          {!loading && viewMode === 'grid' && albums.length > 0 && (
            <div class="row row-cards">
              {albums.map(album => (
                <div class="col-sm-6 col-lg-3" key={album.id}>
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

          {!loading && viewMode === 'list' && albums.length > 0 && (
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
                      <th>{t('table.label')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {albums.map(album => (
                      <AlbumRow
                        key={album.id}
                        album={album}
                        onClick={(a) => navigate('detail', { id: a.id })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {!loading && albums.length > 0 && (
          <Pagination page={page} limit={LIMIT} total={total} onChange={setPage} />
        )}
      </div>

      {deleteTarget && (
        <div class="modal modal-blur show d-block dashboard-modal-backdrop">
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
        <div class="modal modal-blur show d-block dashboard-modal-backdrop">
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
