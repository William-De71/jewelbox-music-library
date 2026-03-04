import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { api } from '../api/client.js';
import { AlbumCard } from '../components/AlbumCard.jsx';
import { AlbumRow } from '../components/AlbumRow.jsx';
import { Pagination } from '../components/Pagination.jsx';

const LIMIT = 24;

export function Dashboard({ navigate }) {
  const [albums, setAlbums] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [page, setPage] = useState(1);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({ genre: '', rating: '', search: '', sort: 'title', order: 'asc' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lendTarget, setLendTarget] = useState(null);
  const [lentTo, setLentTo] = useState('');
  const [toast, setToast] = useState(null);
  const searchRef = useRef();

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async (pg = page, f = filters) => {
    setLoading(true);
    try {
      const result = await api.getAlbums({ page: pg, limit: LIMIT, ...f });
      setAlbums(result.data);
      setTotal(result.total);
    } catch (e) {
      showToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [page, filters, showToast]);

  useEffect(() => {
    api.getGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    load(page, filters);
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
      load(page, filters);
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
      load(page, filters);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const stats = { total, lent: albums.filter((a) => a.is_lent).length };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div class={`alert alert-${toast.type} alert-dismissible position-fixed top-0 end-0 m-3`}
          style="z-index:9999;min-width:280px">
          {toast.msg}
          <button type="button" class="btn-close" onClick={() => setToast(null)}></button>
        </div>
      )}

      {/* Header */}
      <div class="page-header d-print-none">
        <div class="row align-items-center">
          <div class="col">
            <h2 class="page-title">
              <i class="ti ti-library me-2 text-primary"></i>
              Ma Bibliothèque
            </h2>
            <div class="text-muted mt-1">
              <span class="badge bg-blue-lt me-1">{total} album{total !== 1 ? 's' : ''}</span>
              {stats.lent > 0 && <span class="badge bg-warning-lt">{stats.lent} prêté{stats.lent !== 1 ? 's' : ''}</span>}
            </div>
          </div>
          <div class="col-auto ms-auto">
            <button class="btn btn-primary" onClick={() => navigate('add')}>
              <i class="ti ti-plus me-1"></i>Ajouter un CD
            </button>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div class="card mb-3">
        <div class="card-body py-2">
          <div class="row g-2 align-items-center">
            {/* Search */}
            <div class="col-12 col-md-4">
              <div class="input-group">
                <input ref={searchRef} type="text" class="form-control" placeholder="Rechercher titre, artiste…"
                  defaultValue={filters.search}
                  onKeyDown={handleSearch}
                />
                <button class="btn btn-outline-secondary" type="button" onClick={handleSearch}>
                  <i class="ti ti-search"></i>
                </button>
                {filters.search && (
                  <button class="btn btn-outline-danger" type="button" onClick={() => {
                    searchRef.current.value = '';
                    setFilter('search', '');
                  }}>
                    <i class="ti ti-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Genre filter */}
            <div class="col-6 col-md-2">
              <select class="form-select" value={filters.genre} onChange={(e) => setFilter('genre', e.target.value)}>
                <option value="">Tous les genres</option>
                {genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Rating filter */}
            <div class="col-6 col-md-2">
              <select class="form-select" value={filters.rating} onChange={(e) => setFilter('rating', e.target.value)}>
                <option value="">Toutes les notes</option>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div class="col-6 col-md-2">
              <select class="form-select" value={`${filters.sort}_${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('_');
                  setFilters((f) => ({ ...f, sort, order }));
                  setPage(1);
                }}>
                <option value="title_asc">Titre A→Z</option>
                <option value="title_desc">Titre Z→A</option>
                <option value="artist_asc">Artiste A→Z</option>
                <option value="artist_desc">Artiste Z→A</option>
                <option value="year_desc">Année ↓</option>
                <option value="year_asc">Année ↑</option>
                <option value="rating_desc">Note ↓</option>
                <option value="rating_asc">Note ↑</option>
              </select>
            </div>

            {/* View toggle */}
            <div class="col-6 col-md-auto ms-md-auto">
              <div class="btn-group">
                <button class={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')} title="Vue grille">
                  <i class="ti ti-layout-grid"></i>
                </button>
                <button class={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('list')} title="Vue liste">
                  <i class="ti ti-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement…</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && albums.length === 0 && (
        <div class="empty py-5">
          <div class="empty-img">
            <i class="ti ti-disc-off" style="font-size:4rem;color:var(--tblr-muted)"></i>
          </div>
          <p class="empty-title">Aucun album trouvé</p>
          <p class="empty-subtitle text-muted">
            {filters.search || filters.genre || filters.rating
              ? 'Essayez de modifier vos filtres.'
              : 'Commencez par ajouter votre premier CD !'}
          </p>
          {!filters.search && !filters.genre && !filters.rating && (
            <div class="empty-action">
              <button class="btn btn-primary" onClick={() => navigate('add')}>
                <i class="ti ti-plus me-1"></i>Ajouter un CD
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid view */}
      {!loading && viewMode === 'grid' && albums.length > 0 && (
        <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-3 mb-3">
          {albums.map((album) => (
            <div class="col" key={album.id}>
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

      {/* List view */}
      {!loading && viewMode === 'list' && albums.length > 0 && (
        <div class="card mb-3">
          <div class="table-responsive">
            <table class="table table-vcenter table-hover card-table">
              <thead>
                <tr>
                  <th style="width:48px"></th>
                  <th>Titre</th>
                  <th>Artiste</th>
                  <th>Année</th>
                  <th>Genre</th>
                  <th>Note</th>
                  <th>Label</th>
                  <th style="width:120px">Actions</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
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

      {/* Pagination */}
      {!loading && albums.length > 0 && (
        <div class="mb-4">
          <Pagination page={page} limit={LIMIT} total={total} onChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div class="modal modal-blur show d-block" style="background:rgba(0,0,0,.5)">
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-body">
                <div class="modal-title mb-1">Supprimer l'album ?</div>
                <p class="text-muted">
                  Voulez-vous vraiment supprimer <strong>"{deleteTarget.title}"</strong> ? Cette action est irréversible.
                </p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-outline-secondary me-auto" onClick={() => setDeleteTarget(null)}>Annuler</button>
                <button class="btn btn-danger" onClick={handleDelete}>
                  <i class="ti ti-trash me-1"></i>Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lend Modal */}
      {lendTarget && (
        <div class="modal modal-blur show d-block" style="background:rgba(0,0,0,.5)">
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  {lendTarget.is_lent ? 'Marquer comme récupéré' : 'Prêter l\'album'}
                </h5>
                <button class="btn-close" onClick={() => setLendTarget(null)}></button>
              </div>
              <div class="modal-body">
                <p class="text-muted mb-2">
                  <strong>"{lendTarget.title}"</strong>
                  {lendTarget.is_lent
                    ? ' — Confirmer la récupération ?'
                    : ' — À qui prêtez-vous cet album ?'}
                </p>
                {!lendTarget.is_lent && (
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Nom de la personne (optionnel)"
                    value={lentTo}
                    onInput={(e) => setLentTo(e.target.value)}
                  />
                )}
              </div>
              <div class="modal-footer">
                <button class="btn btn-outline-secondary me-auto" onClick={() => { setLendTarget(null); setLentTo(''); }}>Annuler</button>
                <button class={`btn ${lendTarget.is_lent ? 'btn-success' : 'btn-warning'}`} onClick={handleLend}>
                  <i class={`ti ${lendTarget.is_lent ? 'ti-user-check' : 'ti-user-share'} me-1`}></i>
                  {lendTarget.is_lent ? 'Récupéré' : 'Prêter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
