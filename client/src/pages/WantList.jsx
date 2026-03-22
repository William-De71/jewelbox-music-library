import { useI18n } from '../config/i18n/index.js';
import '../styles/wantlist.css';

export function WantList() {
  const { t } = useI18n();
  
  return (
    <div class="page-container">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">
                  <i class="ti ti-heart me-2 text-danger"></i>
                  {t('menu.wantlist')}
                </h2>
              </div>
              <div class="card-body">
                <p class="text-muted">
                  Page Liste de souhaits en construction...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
