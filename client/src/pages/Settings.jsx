import { useI18n } from '../config/i18n/index.js';
import { Settings as SettingsIcon } from 'lucide-preact';
import '../styles/settings.css';

export function Settings() {
  const { t } = useI18n();
  
  return (
    <div class="page-container">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">
                  <SettingsIcon size={24} class="me-2 text-secondary" />
                  {t('menu.settings')}
                </h2>
              </div>
              <div class="card-body">
                <p class="text-muted">
                  Page Paramètres en construction...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
