import { useState, useEffect } from 'preact/hooks';
import { databasesApi } from '../api/databases.js';
import { useI18n } from '../config/i18n/index.js';
import { Database, Plus, Play, Trash2, Edit, Check, X, Settings as SettingsIcon, Disc } from 'lucide-preact';

export function Settings({ navigate }) {
  const { t } = useI18n();
  const [databases, setDatabases] = useState([]);
  const [activeDb, setActiveDb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDb, setEditingDb] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDatabases = async () => {
    try {
      setLoading(true);
      const data = await databasesApi.getAll();
      setDatabases(data.databases);
      setActiveDb(data.active);
    } catch (err) {
      showToast(t('database.error.loadDatabases'), 'danger');
      console.error('Error loading databases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabases();
  }, []);

  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      await databasesApi.create(formData.name.trim(), formData.description);
      showToast(t('database.success.databaseCreated'), 'success');
      setShowCreateForm(false);
      setFormData({ name: '', description: '' });
      loadDatabases();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleUpdateDatabase = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingDb) return;
    try {
      await databasesApi.update(editingDb.id, formData.name.trim(), formData.description);
      showToast(t('database.success.databaseUpdated'), 'success');
      setShowEditForm(false);
      setEditingDb(null);
      setFormData({ name: '', description: '' });
      loadDatabases();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleSetActive = async (dbId) => {
    try {
      await databasesApi.setActive(dbId);
      showToast(t('database.success.databaseActivated'), 'success');
      loadDatabases();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleDeleteDatabase = async () => {
    if (!deleteConfirmTarget) return;
    try {
      await databasesApi.delete(deleteConfirmTarget.id);
      showToast(t('database.success.databaseDeleted'), 'success');
      setDeleteConfirmTarget(null);
      loadDatabases();
    } catch (err) {
      showToast(err.message, 'danger');
      setDeleteConfirmTarget(null);
    }
  };

  const handleEditDatabase = (db) => {
    setEditingDb(db);
    setFormData({ name: db.name, description: db.description || '' });
    setShowEditForm(true);
  };

  const closeCreateForm = () => { setShowCreateForm(false); setFormData({ name: '', description: '' }); };
  const closeEditForm = () => { setShowEditForm(false); setEditingDb(null); setFormData({ name: '', description: '' }); };

  return (
    <div class="page-container">
      <div class="container-fluid">

        {/* Toast - fixed top right */}
        {toast && (
          <div class={`alert alert-${toast.type} alert-dismissible toast-notification top-0 end-0 m-3`}>
            {toast.msg}
            <button type="button" class="btn-close" onClick={() => setToast(null)} />
          </div>
        )}

        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">
                  <SettingsIcon size={24} class="me-2 text-secondary" />
                  {t('menu.settings')}
                </h2>
              </div>
              <div class="card-body">

                {/* Database list sub-header */}
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 class="mb-0 fs-5">
                    <Database size={18} class="me-2" />
                    {t('database.databaseList')}
                  </h3>
                  <button class="btn btn-primary btn-sm" onClick={() => setShowCreateForm(true)}>
                    <Plus size={16} class="me-1" />
                    {t('database.createDatabase')}
                  </button>
                </div>

                {/* Database table */}
                {loading ? (
                  <div class="text-center py-4">
                    <div class="spinner-border" role="status">
                      <span class="visually-hidden">{t('common.loading')}</span>
                    </div>
                  </div>
                ) : databases.length === 0 ? (
                  <div class="text-center py-4">
                    <Database size={48} class="text-muted mb-3" />
                    <h4 class="text-muted">{t('database.noDatabases')}</h4>
                    <p class="text-muted">{t('database.createFirstDatabase')}</p>
                    <button class="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                      <Plus size={20} class="me-2" />
                      {t('database.createDatabase')}
                    </button>
                  </div>
                ) : (
                  <div class="table-responsive">
                    <table class="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>{t('database.name')}</th>
                          <th>{t('database.description')}</th>
                          <th>{t('database.createdAt')}</th>
                          <th>{t('database.status')}</th>
                          <th class="text-end">{t('database.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {databases.map(db => (
                          <tr key={db.id}>
                            <td>
                              <div class="d-flex align-items-center">
                                <Database size={18} class="me-2 text-muted" />
                                <strong>{db.name}</strong>
                              </div>
                            </td>
                            <td class="text-muted">{db.description || '—'}</td>
                            <td class="text-muted">{new Date(db.created_at).toLocaleDateString()}</td>
                            <td>
                              {db.is_active ? (
                                <span class="badge badge-pill bg-success-lt text-success" style={{ fontSize: '0.8rem', padding: '0.35em 0.75em' }}>
                                  <Check size={13} class="me-1" />
                                  {t('database.active')}
                                </span>
                              ) : (
                                <span class="badge badge-pill bg-secondary-lt text-muted" style={{ fontSize: '0.8rem', padding: '0.35em 0.75em' }}>
                                  {t('database.inactive')}
                                </span>
                              )}
                            </td>
                            <td class="text-end">
                              <div class="btn-group">
                                <button
                                  class="btn btn-sm btn-outline-success"
                                  onClick={() => handleSetActive(db.id)}
                                  title={t('database.activate')}
                                  disabled={db.is_active}
                                >
                                  <Play size={15} />
                                </button>
                                <button
                                  class="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditDatabase(db)}
                                  title={t('database.edit')}
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  class="btn btn-sm btn-outline-danger"
                                  onClick={() => setDeleteConfirmTarget(db)}
                                  title={t('database.delete')}
                                >
                                  <Trash2 size={15} />
                                </button>
                                <button
                                  class="btn btn-sm btn-outline-info"
                                  onClick={() => navigate('collections')}
                                  title={t('database.viewCollection')}
                                  disabled={!db.is_active}
                                >
                                  <Disc size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Create Database Modal */}
        {showCreateForm && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
            onClick={closeCreateForm}
          >
            <div
              style={{ backgroundColor: 'var(--tblr-bg-surface)', borderRadius: '8px', padding: 0, maxWidth: '460px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '1.5rem' }}>
                <h5 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>
                  <Plus size={18} class="me-2" />
                  {t('database.createDatabase')}
                </h5>
                <form onSubmit={handleCreateDatabase}>
                  <div class="mb-3">
                    <label class="form-label">{t('database.name')} *</label>
                    <input type="text" class="form-control" value={formData.name} onInput={(e) => setFormData({ ...formData, name: e.target.value })} required autoFocus />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">{t('database.description')}</label>
                    <textarea class="form-control" rows={3} value={formData.description} onInput={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" class="btn btn-outline-secondary" onClick={closeCreateForm}>
                      <X size={16} class="me-1" />{t('common.cancel')}
                    </button>
                    <button type="submit" class="btn btn-primary">
                      <Plus size={16} class="me-1" />{t('database.create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Database Modal */}
        {showEditForm && editingDb && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
            onClick={closeEditForm}
          >
            <div
              style={{ backgroundColor: 'var(--tblr-bg-surface)', borderRadius: '8px', padding: 0, maxWidth: '460px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '1.5rem' }}>
                <h5 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>
                  <Edit size={18} class="me-2" />
                  {t('database.editDatabase')}
                </h5>
                <form onSubmit={handleUpdateDatabase}>
                  <div class="mb-3">
                    <label class="form-label">{t('database.name')} *</label>
                    <input type="text" class="form-control" value={formData.name} onInput={(e) => setFormData({ ...formData, name: e.target.value })} required autoFocus />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">{t('database.description')}</label>
                    <textarea class="form-control" rows={3} value={formData.description} onInput={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" class="btn btn-outline-secondary" onClick={closeEditForm}>
                      <X size={16} class="me-1" />{t('common.cancel')}
                    </button>
                    <button type="submit" class="btn btn-primary">
                      <Check size={16} class="me-1" />{t('database.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirmTarget && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
            onClick={() => setDeleteConfirmTarget(null)}
          >
            <div
              style={{ backgroundColor: 'var(--tblr-bg-surface)', borderRadius: '8px', padding: 0, maxWidth: '400px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '1.5rem' }}>
                <h5 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>{t('database.delete')}</h5>
                <p style={{ margin: 0, color: 'var(--tblr-muted)' }}>
                  {t('database.confirm.deleteDatabase')} <strong>« {deleteConfirmTarget.name} »</strong>
                </p>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--tblr-border-color)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button class="btn btn-outline-secondary" onClick={() => setDeleteConfirmTarget(null)}>
                  <X size={16} class="me-1" />{t('common.cancel')}
                </button>
                <button class="btn btn-danger" onClick={handleDeleteDatabase}>
                  <Trash2 size={16} class="me-1" />{t('database.delete')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
