import { useState, useEffect } from 'preact/hooks';
import { databasesApi } from '../api/databases.js';
import { useI18n } from '../config/i18n/index.js';
import { Database, Plus, Play, Trash2, Edit, Download, Check, X } from 'lucide-preact';

export function Dashboard({ navigate }) {
  const { t } = useI18n();
  const [databases, setDatabases] = useState([]);
  const [activeDb, setActiveDb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDb, setEditingDb] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load databases
  const loadDatabases = async () => {
    try {
      setLoading(true);
      const data = await databasesApi.getAll();
      setDatabases(data.databases);
      setActiveDb(data.active);
    } catch (err) {
      showToast(t('dashboard.error.loadDatabases'), 'error');
      console.error('Error loading databases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabases();
  }, []);

  // Create database
  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await databasesApi.create(formData.name.trim(), formData.description);
      showToast(t('dashboard.success.databaseCreated'), 'success');
      setShowCreateForm(false);
      setFormData({ name: '', description: '' });
      loadDatabases();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Update database
  const handleUpdateDatabase = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingDb) return;

    try {
      await databasesApi.update(editingDb.id, formData.name.trim(), formData.description);
      showToast(t('dashboard.success.databaseUpdated'), 'success');
      setShowEditForm(false);
      setEditingDb(null);
      setFormData({ name: '', description: '' });
      loadDatabases();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Set active database
  const handleSetActive = async (dbId) => {
    try {
      await databasesApi.setActive(dbId);
      showToast(t('dashboard.success.databaseActivated'), 'success');
      loadDatabases();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete database
  const handleDeleteDatabase = async (dbId) => {
    if (!confirm(t('dashboard.confirm.deleteDatabase'))) return;

    try {
      await databasesApi.delete(dbId);
      showToast(t('dashboard.success.databaseDeleted'), 'success');
      loadDatabases();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Edit database
  const handleEditDatabase = (db) => {
    setEditingDb(db);
    setFormData({ name: db.name, description: db.description || '' });
    setShowEditForm(true);
  };

  return (
    <div class="page-container">
      <div class="container-fluid">
        {/* Header */}
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="h2 mb-1">
                  <Database size={32} class="me-3 text-primary" />
                  {t('common.title')}
                </h1>
                <p class="text-muted mb-0">
                  {t('common.subtitle')}
                </p>
              </div>
              <button 
                class="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus size={20} class="me-2" />
                {t('database.createDatabase')}
              </button>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div class={`alert alert-${toast.type} alert-dismissible fade show mb-4`} role="alert">
            {toast.msg}
            <button type="button" class="btn-close" onClick={() => setToast(null)} />
          </div>
        )}

        {/* Active Database Info */}
        {activeDb && (
          <div class="row mb-4">
            <div class="col-12">
              <div class="card border-success">
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <Play size={20} class="me-2 text-success" />
                    <div class="flex-grow-1">
                      <strong>{t('database.activeDatabase')}:</strong> {activeDb.name}
                      {activeDb.description && <span class="text-muted ms-2">- {activeDb.description}</span>}
                    </div>
                    <button 
                      class="btn btn-sm btn-outline-success me-2"
                      onClick={() => navigate('collections')}
                    >
                      {t('database.viewCollection')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Databases List */}
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title mb-0">
                  <Database size={20} class="me-2" />
                  {t('database.databaseList')}
                </h3>
              </div>
              <div class="card-body">
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
                    <button 
                      class="btn btn-primary"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <Plus size={20} class="me-2" />
                      {t('database.createDatabase')}
                    </button>
                  </div>
                ) : (
                  <div class="table-responsive">
                    <table class="table table-hover">
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
                          <tr key={db.id} class={db.is_active ? 'table-success' : ''}>
                            <td>
                              <div class="d-flex align-items-center">
                                <Database size={20} class="me-2" />
                                <strong>{db.name}</strong>
                              </div>
                            </td>
                            <td class="text-muted">
                              {db.description || '-'}
                            </td>
                            <td>
                              {new Date(db.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              {db.is_active ? (
                                <span class="badge bg-success">
                                  <Check size={14} class="me-1" />
                                  {t('database.active')}
                                </span>
                              ) : (
                                <span class="badge bg-secondary">
                                  {t('database.inactive')}
                                </span>
                              )}
                            </td>
                            <td class="text-end">
                              <div class="btn-group">
                                {!db.is_active && (
                                  <button 
                                    class="btn btn-sm btn-outline-success"
                                    onClick={() => handleSetActive(db.id)}
                                    title={t('database.activate')}
                                  >
                                    <Play size={16} />
                                  </button>
                                )}
                                <button 
                                  class="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditDatabase(db)}
                                  title={t('database.edit')}
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  class="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteDatabase(db.id)}
                                  title={t('database.delete')}
                                >
                                  <Trash2 size={16} />
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
          <div class="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">
                    <Plus size={20} class="me-2" />
                    {t('database.createDatabase')}
                  </h5>
                  <button 
                    type="button" 
                    class="btn-close" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ name: '', description: '' });
                    }}
                  />
                </div>
                <form onSubmit={handleCreateDatabase}>
                  <div class="modal-body">
                    <div class="mb-3">
                      <label class="form-label">{t('database.name')} *</label>
                      <input 
                        type="text" 
                        class="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">{t('database.description')}</label>
                      <textarea 
                        class="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button 
                      type="button" 
                      class="btn btn-secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormData({ name: '', description: '' });
                      }}
                    >
                      <X size={16} class="me-2" />
                      {t('common.cancel')}
                    </button>
                    <button type="submit" class="btn btn-primary">
                      <Plus size={16} class="me-2" />
                      {t('database.create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Database Modal */}
        {showEditForm && editingDb && (
          <div class="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">
                    <Edit size={20} class="me-2" />
                    {t('dashboard.editDatabase')}
                  </h5>
                  <button 
                    type="button" 
                    class="btn-close" 
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingDb(null);
                      setFormData({ name: '', description: '' });
                    }}
                  />
                </div>
                <form onSubmit={handleUpdateDatabase}>
                  <div class="modal-body">
                    <div class="mb-3">
                      <label class="form-label">{t('dashboard.name')} *</label>
                      <input 
                        type="text" 
                        class="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">{t('dashboard.description')}</label>
                      <textarea 
                        class="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button 
                      type="button" 
                      class="btn btn-secondary"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingDb(null);
                        setFormData({ name: '', description: '' });
                      }}
                    >
                      <X size={16} class="me-2" />
                      {t('common.cancel')}
                    </button>
                    <button type="submit" class="btn btn-primary">
                      <Check size={16} class="me-2" />
                      {t('dashboard.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
