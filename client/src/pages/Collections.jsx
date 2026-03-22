import { useI18n } from '../config/i18n/index.js';
import '../styles/collections.css';

export function Collections() {
  const { t } = useI18n();
  
  return (
    <div class="page-container">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">
                  <i class="ti ti-collection me-2 text-primary"></i>
                  {t('menu.collections')}
                </h2>
              </div>
              <div class="card-body">
                <p class="text-muted">
                  Page Collections en construction...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
