import { useState, useEffect } from 'preact/hooks';
import { Layout } from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { AlbumForm } from './pages/AlbumForm.jsx';
import { AlbumDetail } from './pages/AlbumDetail.jsx';
import { Collections } from './pages/Collections.jsx';
import { WantList } from './pages/WantList.jsx';
import { Lend } from './pages/Lend.jsx';
import { Stats } from './pages/Stats.jsx';
import { Settings } from './pages/Settings.jsx';
import { databasesApi } from './api/databases.js';

export function App() {
  const [route, setRoute] = useState({ page: 'dashboard', params: {} });
  const [initializing, setInitializing] = useState(true);

  const navigate = (page, params = {}) => setRoute({ page, params });

  // Check for active database on mount and redirect to collections if exists
  useEffect(() => {
    const checkActiveDatabase = async () => {
      try {
        const response = await databasesApi.getAll();
        if (response.active) {
          // Active database exists, redirect to collections
          setRoute({ page: 'collections', params: {} });
        }
      } catch (err) {
        console.error('Failed to check active database:', err);
      } finally {
        setInitializing(false);
      }
    };
    
    checkActiveDatabase();
  }, []);

  return (
    <Layout navigate={navigate} currentPage={route.page}>
      {route.page === 'dashboard' && <Dashboard navigate={navigate} />}
      {route.page === 'add' && <AlbumForm navigate={navigate} />}
      {route.page === 'edit' && <AlbumForm navigate={navigate} albumId={route.params.id} />}
      {route.page === 'detail' && <AlbumDetail navigate={navigate} albumId={route.params.id} />}
      {route.page === 'collections' && <Collections navigate={navigate} params={route.params} />}
      {route.page === 'wantlist' && <WantList />}
      {route.page === 'lend' && <Lend />}
      {route.page === 'stats' && <Stats />}
      {route.page === 'settings' && <Settings navigate={navigate} />}
    </Layout>
  );
}
