import { useState, useEffect } from 'preact/hooks';
import { api } from '../api/client.js';
import { useI18n } from '../config/i18n/index.js';
import { BarChart3, Music2, Heart, Clock, User, Tag, ArrowRightLeft } from 'lucide-preact';

const PALETTE = [
  '#4361ee','#f72585','#7209b7','#4cc9f0','#f3722c',
  '#43aa8b','#f9844a','#90be6d','#577590','#e63946','#2ec4b6','#ff9f1c',
];

function polarToCartesian(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  if (endAngle - startAngle >= 360) endAngle = startAngle + 359.99;
  const o1 = polarToCartesian(cx, cy, outerR, startAngle);
  const o2 = polarToCartesian(cx, cy, outerR, endAngle);
  const i1 = polarToCartesian(cx, cy, innerR, endAngle);
  const i2 = polarToCartesian(cx, cy, innerR, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) return null;
  let startAngle = 0;
  return (
    <svg viewBox="0 0 100 100" style={{ maxWidth: 200, display: 'block', margin: '0 auto' }}>
      {data.map((item, i) => {
        const angle = (item.count / total) * 360;
        const end = startAngle + angle;
        const d = arcPath(50, 50, 46, 28, startAngle, end);
        startAngle = end;
        return <path key={i} d={d} fill={PALETTE[i % PALETTE.length]} />;
      })}
      <text x="50" y="53" text-anchor="middle" style={{ fontSize: '14px', fontWeight: 'bold', fill: 'currentColor' }}>{total}</text>
    </svg>
  );
}

function HBar({ data, color }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div class="d-flex flex-column gap-2">
      {data.map((item, i) => (
        <div key={i} class="d-flex align-items-center gap-2">
          <span class="text-end text-muted flex-shrink-0 text-truncate" style={{ fontSize: '0.75rem', minWidth: 90, maxWidth: 90 }} title={item.label}>
            {item.label}
          </span>
          <div class="flex-grow-1 rounded overflow-hidden" style={{ height: 18, background: 'var(--tblr-secondary-lt, #e9ecef)' }}>
            <div style={{ width: `${(item.count / max) * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
          <span class="fw-semibold flex-shrink-0" style={{ fontSize: '0.75rem', minWidth: 20 }}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ icon, value, label, color }) {
  return (
    <div class="card text-center h-100">
      <div class="card-body py-3 px-2">
        <div class={`text-${color} mb-1`}>{icon}</div>
        <div class="display-6 fw-bold lh-1 mb-1">{value}</div>
        <div class="text-muted small">{label}</div>
      </div>
    </div>
  );
}

export function Stats() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const genreData  = stats?.by_genre?.map(g => ({ label: g.genre,            count: g.count })) || [];
  const decadeData = stats?.by_decade?.map(d => ({ label: `${d.decade}s`,    count: d.count })) || [];
  const artistData = stats?.top_artists?.map(a => ({ label: a.name,          count: a.count })) || [];
  const labelData  = stats?.top_labels?.map(l => ({ label: l.name,           count: l.count })) || [];

  const hasDuration = stats && (stats.total_duration_hours > 0 || stats.total_duration_mins > 0);

  return (
    <div class="page-container">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">
                  <BarChart3 size={24} class="me-2 text-info" />
                  {t('menu.stats')}
                </h2>
              </div>
              <div class="card-body">

                {loading ? (
                  <div class="text-center py-5">
                    <div class="spinner-border" role="status">
                      <span class="visually-hidden">{t('common.loading')}</span>
                    </div>
                  </div>
                ) : error ? (
                  <div class="alert alert-danger">{error}</div>
                ) : !stats ? (
                  <p class="text-muted">{t('stats.noActiveDb')}</p>
                ) : (
                  <>
                    {/* ── KPIs ───────────────────────────────────────────── */}
                    <div class="row g-3 mb-4">
                      <div class="col-6 col-sm-4 col-md-2">
                        <KpiCard icon={<Music2 size={22} />} value={stats.total_owned} label={t('stats.totalOwned')} color="primary" />
                      </div>
                      <div class="col-6 col-sm-4 col-md-2">
                        <KpiCard icon={<Heart size={22} />} value={stats.total_wanted} label={t('stats.totalWanted')} color="danger" />
                      </div>
                      <div class="col-6 col-sm-4 col-md-2">
                        <KpiCard icon={<ArrowRightLeft size={22} />} value={stats.total_lent} label={t('stats.totalLent')} color="warning" />
                      </div>
                      <div class="col-6 col-sm-4 col-md-2">
                        <KpiCard icon={<User size={22} />} value={stats.total_artists} label={t('stats.totalArtists')} color="success" />
                      </div>
                      {hasDuration && (
                        <div class="col-6 col-sm-4 col-md-2">
                          <KpiCard
                            icon={<Clock size={22} />}
                            value={<>{stats.total_duration_hours}<span class="fs-5">h</span>{stats.total_duration_mins > 0 && <span class="fs-5">{String(stats.total_duration_mins).padStart(2,'0')}</span>}</>}
                            label={t('stats.totalDuration')}
                            color="info"
                          />
                        </div>
                      )}
                    </div>

                    {/* ── Graphiques ─────────────────────────────────────── */}
                    <div class="row g-3 mb-4">
                      {genreData.length > 0 && (
                        <div class="col-12 col-lg-5">
                          <div class="card h-100">
                            <div class="card-header">
                              <h3 class="card-title fs-5 mb-0">🎸 {t('stats.byGenre')}</h3>
                            </div>
                            <div class="card-body">
                              <DonutChart data={genreData} />
                              <div class="d-flex flex-wrap gap-1 justify-content-center mt-3">
                                {genreData.map((g, i) => (
                                  <span key={i} class="badge" style={{ background: PALETTE[i % PALETTE.length], fontSize: '0.7rem' }}>
                                    {g.label} {g.count}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {decadeData.length > 0 && (
                        <div class="col-12 col-lg-7">
                          <div class="card h-100">
                            <div class="card-header">
                              <h3 class="card-title fs-5 mb-0">📅 {t('stats.byDecade')}</h3>
                            </div>
                            <div class="card-body">
                              <HBar data={decadeData} color="#4361ee" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Tops ───────────────────────────────────────────── */}
                    <div class="row g-3">
                      {artistData.length > 0 && (
                        <div class="col-12 col-md-6">
                          <div class="card h-100">
                            <div class="card-header">
                              <h3 class="card-title fs-5 mb-0">🏆 {t('stats.topArtists')}</h3>
                            </div>
                            <div class="card-body">
                              <HBar data={artistData} color="#f72585" />
                            </div>
                          </div>
                        </div>
                      )}
                      {labelData.length > 0 && (
                        <div class="col-12 col-md-6">
                          <div class="card h-100">
                            <div class="card-header">
                              <h3 class="card-title fs-5 mb-0">
                                <Tag size={16} class="me-2" />{t('stats.topLabels')}
                              </h3>
                            </div>
                            <div class="card-body">
                              <HBar data={labelData} color="#43aa8b" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
