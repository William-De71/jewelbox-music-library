import { useState, useEffect } from 'preact/hooks';
import { albumsApi } from '../api/albums.js';
import { useI18n } from '../config/i18n/index.js';
import { Home, Search, Music2, Shuffle, Clock, BarChart3, Settings, Play } from 'lucide-preact';

export function Dashboard({ navigate }) {
  const { t } = useI18n();
  const [recentAlbums, setRecentAlbums] = useState([]);
  const [randomAlbum, setRandomAlbum] = useState(null);
  const [lentAlbums, setLentAlbums] = useState([]);
  const [total, setTotal] = useState(0);
  const [activeDb, setActiveDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const dbData = await albumsApi.getActiveDatabase().catch(() => null);
      const db = dbData?.database;
      setActiveDb(db);
      if (!db) return;

      const [recentData, countData, lentData] = await Promise.all([
        albumsApi.getAll({ sort: 'created_at', order: 'desc', limit: 5 }),
        albumsApi.getAll({ limit: 1 }),
        albumsApi.getAll({ lent: 'true', limit: 50 }),
      ]);

      setRecentAlbums(recentData.data);
      setTotal(countData.pagination.total);
      setLentAlbums(lentData.data);

      if (countData.pagination.total > 0) {
        const randomPage = Math.floor(Math.random() * countData.pagination.total) + 1;
        const randomData = await albumsApi.getAll({ limit: 1, page: randomPage });
        setRandomAlbum(randomData.data[0] || null);
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const shuffleRandom = async () => {
    if (total === 0) return;
    try {
      const randomPage = Math.floor(Math.random() * total) + 1;
      const res = await albumsApi.getAll({ limit: 1, page: randomPage });
      setRandomAlbum(res.data[0] || null);
    } catch (e) {
      console.error('Shuffle error:', e);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('collections', { search: searchQuery.trim() });
    } else {
      navigate('collections');
    }
  };

  return (
    <div class="page-container">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">
                  <Home size={24} class="me-2 text-primary" />
                  {t('common.home')}
                </h2>
              </div>
              <div class="card-body">

                {/* Search bar */}
                <form onSubmit={handleSearch} class="mb-4">
                  <div class="input-group input-group-lg">
                    <span class="input-group-text bg-transparent">
                      <Search size={20} class="text-muted" />
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder={t('home.searchPlaceholder')}
                      value={searchQuery}
                      onInput={(e) => setSearchQuery(e.target.value)}
                    />
                    <button class="btn btn-primary" type="submit">
                      {t('common.search')}
                    </button>
                  </div>
                </form>

                {/* Active database bar */}
                {activeDb && (
                  <div class="d-flex align-items-center justify-content-between px-3 py-2 mb-4 rounded border" style={{ borderColor: 'var(--tblr-success)' }}>
                    <div class="d-flex align-items-center gap-2">
                      <Play size={16} class="text-success flex-shrink-0" />
                      <span>
                        <strong>{t('database.activeDatabase')} :</strong>
                        <span class="ms-1">{activeDb.name}</span>
                        {activeDb.description && <span class="text-muted ms-2">— {activeDb.description}</span>}
                      </span>
                    </div>
                    <button class="btn btn-sm btn-outline-success" onClick={() => navigate('collections')}>
                      {t('database.viewCollection')}
                    </button>
                  </div>
                )}

                {!activeDb ? (
                  <div class="text-center py-5">
                    <Music2 size={48} class="text-muted mb-3" />
                    <p class="text-muted mb-3">{t('home.noActiveDatabase')}</p>
                    <button class="btn btn-primary" onClick={() => navigate('settings')}>
                      <Settings size={16} class="me-2" />
                      {t('home.goToSettings')}
                    </button>
                  </div>
                ) : loading ? (
                  <div class="text-center py-5">
                    <div class="spinner-border" role="status">
                      <span class="visually-hidden">{t('common.loading')}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Recent + Random */}
                    <div class="row mb-4">

                      {/* Recent albums */}
                      <div class="col-md-7 mb-3 mb-md-0">
                        <div class="card h-100">
                          <div class="card-header">
                            <h3 class="card-title fs-5 mb-0">
                              <Clock size={17} class="me-2 text-primary" />
                              {t('home.recentAlbums')}
                            </h3>
                          </div>
                          <div class="list-group list-group-flush">
                            {recentAlbums.length === 0 ? (
                              <div class="list-group-item text-muted text-center py-4">
                                {t('home.noAlbums')}
                              </div>
                            ) : recentAlbums.map(album => (
                              <div
                                key={album.id}
                                class="list-group-item list-group-item-action d-flex align-items-center gap-3"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('detail', { id: album.id })}
                              >
                                {album.cover_url ? (
                                  <img
                                    src={album.cover_url}
                                    alt=""
                                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                                  />
                                ) : (
                                  <div
                                    class="d-flex align-items-center justify-content-center bg-secondary-lt rounded"
                                    style={{ width: 48, height: 48, flexShrink: 0 }}
                                  >
                                    <Music2 size={20} class="text-muted" />
                                  </div>
                                )}
                                <div class="flex-grow-1 overflow-hidden">
                                  <div class="fw-semibold text-truncate">{album.title}</div>
                                  <div class="text-muted small text-truncate">{album.artist?.name}</div>
                                </div>
                                {album.year && (
                                  <span class="text-muted small flex-shrink-0">{album.year}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Random album */}
                      <div class="col-md-5">
                        <div class="card h-100">
                          <div class="card-header d-flex justify-content-between align-items-center">
                            <h3 class="card-title fs-5 mb-0">
                              <Shuffle size={17} class="me-2 text-warning" />
                              {t('home.randomAlbum')}
                            </h3>
                            <button
                              class="btn btn-sm btn-outline-secondary"
                              onClick={shuffleRandom}
                              title={t('home.shuffle')}
                            >
                              <Shuffle size={14} class="me-1" />
                              {t('home.shuffle')}
                            </button>
                          </div>
                          <div class="card-body d-flex flex-column align-items-center justify-content-center text-center gap-3">
                            {randomAlbum ? (
                              <div
                                class="d-flex flex-column align-items-center gap-3"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('detail', { id: randomAlbum.id })}
                              >
                                {randomAlbum.cover_url ? (
                                  <img
                                    src={randomAlbum.cover_url}
                                    alt=""
                                    style={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
                                  />
                                ) : (
                                  <div
                                    class="d-flex align-items-center justify-content-center bg-secondary-lt rounded"
                                    style={{ width: 130, height: 130 }}
                                  >
                                    <Music2 size={52} class="text-muted" />
                                  </div>
                                )}
                                <div>
                                  <div class="fw-bold">{randomAlbum.title}</div>
                                  <div class="text-muted">{randomAlbum.artist?.name}</div>
                                  {randomAlbum.year && <div class="text-muted small">{randomAlbum.year}</div>}
                                </div>
                              </div>
                            ) : (
                              <p class="text-muted">{t('home.noAlbums')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lent albums */}
                    {lentAlbums.length > 0 && (
                      <div class="card mb-4">
                        <div class="card-header">
                          <h3 class="card-title fs-5 mb-0">
                            📤 {t('home.currentlyLent')}
                            <span class="badge bg-warning-lt text-warning ms-2">{lentAlbums.length}</span>
                          </h3>
                        </div>
                        <div class="list-group list-group-flush">
                          {lentAlbums.map(album => (
                            <div
                              key={album.id}
                              class="list-group-item list-group-item-action d-flex align-items-center justify-content-between"
                              style={{ cursor: 'pointer' }}
                              onClick={() => navigate('detail', { id: album.id })}
                            >
                              <div>
                                <strong>{album.title}</strong>
                                <span class="text-muted ms-2">— {album.artist?.name}</span>
                              </div>
                              <span class="badge bg-warning-lt text-warning">
                                {t('home.lentTo')} {album.lent_to}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div class="text-center text-muted small pt-2">
                      <BarChart3 size={15} class="me-1" />
                      <strong>{total}</strong> {t('home.albumsTotal')}
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
