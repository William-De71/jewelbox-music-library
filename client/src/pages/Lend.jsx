import { useI18n } from '../config/i18n/index.js';
import { HandHeart } from 'lucide-preact';
import '../styles/lend.css';

export function Lend() {
  const { t } = useI18n();
  
  return (
    <div class="page-container">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">
                  <HandHeart size={24} class="me-2 text-warning" />
                  {t('menu.lend')}
                </h2>
              </div>
              <div class="card-body">
                <p class="text-muted">
                  Page Prêts en construction...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
