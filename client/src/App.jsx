import { useState } from 'preact/hooks';
import { Layout } from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { AlbumForm } from './pages/AlbumForm.jsx';
import { AlbumDetail } from './pages/AlbumDetail.jsx';

export function App() {
  const [route, setRoute] = useState({ page: 'dashboard', params: {} });

  const navigate = (page, params = {}) => setRoute({ page, params });

  return (
    <Layout navigate={navigate} currentPage={route.page}>
      {route.page === 'dashboard' && <Dashboard navigate={navigate} />}
      {route.page === 'add' && <AlbumForm navigate={navigate} />}
      {route.page === 'edit' && <AlbumForm navigate={navigate} albumId={route.params.id} />}
      {route.page === 'detail' && <AlbumDetail navigate={navigate} albumId={route.params.id} />}
    </Layout>
  );
}
