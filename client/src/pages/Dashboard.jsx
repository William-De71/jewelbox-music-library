import { useState, useEffect, useRef } from 'preact/hooks';
import { api } from '../api/client.js';
import { AlbumCard } from '../components/AlbumCard.jsx';
import { AlbumRow } from '../components/AlbumRow.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useI18n } from '../config/i18n/index.js';

const LIMIT = 24;

export function Dashboard({ navigate }) {
  const { t } = useI18n();
  const [albums, setAlbums] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
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
      showToast(`"${deleteTarget.title}" supprimé`);
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
      showToast(is_lent ? `"${lendTarget.title}" marqué comme prêté` : `"${lendTarget.title}" récupéré`);
      setLendTarget(null);
      setLentTo('');
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
        <div class={`alert alert-${toast.type} alert-dismissible position-fixed top-0 end-0 m-3`} style="z-index:9999">
          {toast.msg}
          <button type="button" class="btn-close" onClick={() => setToast(null)}></button>
        </div>
      )}

      <div class="page-header d-print-none">
        <div class="container-xl">
          <div class="row align-items-center">
            <div class="col">
              <h2 class="page-title">{t('dashboard.title')}</h2>
              <div class="text-muted mt-1">
                {total} album{total !== 1 ? 's' : ''} · {stats.lent} prêté{stats.lent !== 1 ? 's' : ''}
              </div>
            </div>
            <div class="col-auto">
              <button class="btn btn-primary" onClick={() => navigate('add')}>
                <i class="ti ti-plus me-1"></i>Ajouter un CD
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="page-body">
        <div class="container-xl">
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
                    <option value="">Tous les genres</option>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div class="col-md-2">
                  <select class="form-select" value={filters.rating} onChange={(e) => setFilter('rating', e.target.value)}>
                    <option value="">Toutes les notes</option>
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} étoile{r > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div class="col-md-2">
                  <select class="form-select" value={`${filters.sort}_${filters.order}`} onChange={(e) => {
                    const [sort, order] = e.target.value.split('_');
                    setFilters({ ...filters, sort, order });
                  }}>
                    <option value="title_asc">Titre A→Z</option>
                    <option value="title_desc">Titre Z→A</option>
                    <option value="artist_asc">Artiste A→Z</option>
                    <option value="artist_desc">Artiste Z→A</option>
                    <option value="year_desc">Année ↓</option>
                    <option value="year_asc">Année ↑</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <div class="btn-group w-100">
                    <button class={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('grid')}>
                      <i class="ti ti-layout-grid"></i>
                    </button>
                    <button class={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('list')}>
                      <i class="ti ti-list"></i>
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
              <div class="empty-img"><i class="ti ti-music" style="font-size:4rem"></i></div>
              <p class="empty-title">Aucun album trouvé</p>
              {total === 0 && (
                <button class="btn btn-primary" onClick={() => navigate('add')}>
                  <i class="ti ti-plus me-1"></i>Ajouter un CD
                </button>
              )}
            </div>
          )}

          {!loading && viewMode === 'grid' && albums.length > 0 && (
            <div class="row row-cards">
              {albums.map(album => (
                <div class="col-sm-6 col-lg-4" key={album.id}>
                  <AlbumCard
                    album={album}
                    onClick={(a) => navigate('detail', { id: a.id })}
                    onEdit={(a) => navigate('edit', { id: a.id })}
                    onDelete={(a) => setDeleteTarget(a)}
                    onLend={(a) => { setLendTarget(a); setLentTo(a.lent_to || ''); }}
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
                      <th>Titre</th>
                      <th>Artiste</th>
                      <th>Année</th>
                      <th>Genre</th>
                      <th>Note</th>
                      <th>Label</th>
                      <th class="w-1">Actions</th>
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
      </div>

      {deleteTarget && (
        <div class="modal modal-blur show d-block" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-body">
                <div class="modal-title">Supprimer l'album ?</div>
                <div>Voulez-vous vraiment supprimer "{deleteTarget.title}" ?</div>
              </div>
              <div class="modal-footer">
                <button class="btn me-auto" onClick={() => setDeleteTarget(null)}>Annuler</button>
                <button class="btn btn-danger" onClick={handleDelete}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lendTarget && (
        <div class="modal modal-blur show d-block" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{lendTarget.is_lent ? 'Récupérer' : 'Prêter'}</h5>
                <button class="btn-close" onClick={() => setLendTarget(null)}></button>
              </div>
              <div class="modal-body">
                <p>{lendTarget.title}</p>
                {!lendTarget.is_lent && (
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Prêté à..."
                    value={lentTo}
                    onChange={(e) => setLentTo(e.target.value)}
                  />
                )}
              </div>
              <div class="modal-footer">
                <button class="btn me-auto" onClick={() => setLendTarget(null)}>Annuler</button>
                <button class="btn btn-primary" onClick={handleLend}>
                  {lendTarget.is_lent ? 'Récupérer' : 'Prêter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
