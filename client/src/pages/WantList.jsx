import { useI18n } from '../config/i18n/index.js';
import { Heart } from 'lucide-preact';
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
                  <Heart size={24} class="me-2 text-danger" />
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
