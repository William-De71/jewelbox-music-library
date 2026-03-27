import { useI18n } from '../config/i18n/index.js';
import { Home } from 'lucide-preact';

export function Dashboard({ navigate }) {
  const { t } = useI18n();

  return (
    <div class="page-container">
      <div class="container-fluid">
        <div class="row mb-4">
          <div class="col-12">
            <h1 class="h2 mb-1">
              <Home size={28} class="me-3 text-primary" />
              {t('common.home')}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
