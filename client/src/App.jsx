import { useState } from 'preact/hooks';
import { Layout } from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { AlbumForm } from './pages/AlbumForm.jsx';
import { AlbumDetail } from './pages/AlbumDetail.jsx';
import { Collections } from './pages/Collections.jsx';
import { WantList } from './pages/WantList.jsx';
import { Lend } from './pages/Lend.jsx';
import { Stats } from './pages/Stats.jsx';
import { Settings } from './pages/Settings.jsx';

export function App() {
  const [route, setRoute] = useState({ page: 'dashboard', params: {} });

  const navigate = (page, params = {}) => setRoute({ page, params });

  return (
    <Layout navigate={navigate} currentPage={route.page}>
      {route.page === 'dashboard' && <Dashboard navigate={navigate} />}
      {route.page === 'add' && <AlbumForm navigate={navigate} params={route.params} />}
      {route.page === 'edit' && <AlbumForm navigate={navigate} albumId={route.params.id} />}
      {route.page === 'detail' && <AlbumDetail navigate={navigate} albumId={route.params.id} />}
      {route.page === 'collections' && <Collections navigate={navigate} params={route.params} />}
      {route.page === 'wantlist' && <WantList navigate={navigate} params={route.params} />}
      {route.page === 'lend' && <Lend navigate={navigate} />}
      {route.page === 'stats' && <Stats />}
      {route.page === 'settings' && <Settings navigate={navigate} />}
    </Layout>
  );
}
