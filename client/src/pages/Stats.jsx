import { useI18n } from '../config/i18n/index.js';
import '../styles/stats.css';

export function Stats() {
  const { t } = useI18n();
  
  return (
    <div class="page-container">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">
                  <i class="ti ti-chart-bar me-2 text-info"></i>
                  {t('menu.stats')}
                </h2>
              </div>
              <div class="card-body">
                <p class="text-muted">
                  Page Statistiques en construction...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
