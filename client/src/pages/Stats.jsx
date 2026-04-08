import { useState, useEffect } from 'preact/hooks';
import { api } from '../api/client.js';
import { useI18n } from '../config/i18n/index.jsx';
import { BarChart3, Music2, Heart, Clock, User, Star, ArrowRightLeft, Settings, Database } from 'lucide-preact';

const PALETTE = [
  '#7B93DB','#C47BA8','#9B7BDB','#6BBFCF','#C4895A',
  '#6BAF8A','#C4A85A','#6BAFC4','#8BAABF','#C47B7B','#6BBFB5','#ADBF6B',
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
    <svg viewBox="0 0 100 100" style={{ width: 260, height: 260, flexShrink: 0 }}>
      {data.map((item, i) => {
        const angle = (item.count / total) * 360;
        const end = startAngle + angle;
        const d = arcPath(50, 50, 46, 28, startAngle, end);
        const mid = startAngle + angle / 2;
        const tp = polarToCartesian(50, 50, 37, mid);
        startAngle = end;
        return (
          <g key={i}>
            <path d={d} fill={PALETTE[i % PALETTE.length]} />
            {angle >= 22 && (
              <text x={tp.x} y={tp.y} text-anchor="middle" dy="0.35em"
                style={{ fontSize: '7px', fontWeight: 'bold', fill: 'white', pointerEvents: 'none' }}>
                {item.count}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HBar({ data, color, labelWidth = 90 }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div class="d-flex flex-column gap-2">
      {data.map((item, i) => (
        <div key={i} class="d-flex align-items-center gap-2">
          <span class="text-end text-muted flex-shrink-0 text-truncate"
            style={{ fontSize: '0.75rem', minWidth: labelWidth, maxWidth: labelWidth }}
            title={item.label}>
            {item.label}
          </span>
          <div class="flex-grow-1 rounded overflow-hidden" style={{ height: 16, background: 'var(--tblr-secondary-lt, #e9ecef)' }}>
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

export function Stats({ navigate }) {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [dbCheckComplete, setDbCheckComplete] = useState(false);

  const showToast = (msg, type = 'danger') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(e => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
        setDbCheckComplete(true);
      });
  }, []);

  const genreData  = stats?.by_genre?.map(g => ({ label: g.genre,   count: g.count })) || [];
  const artistData = stats?.top_artists?.map(a => ({ label: a.name, count: a.count })) || [];

  const hasDuration = stats && (stats.total_duration_hours > 0 || stats.total_duration_mins > 0);

  if (!dbCheckComplete) {
    return null;
  }

  if (!stats) {
    return (
      <div class="page-container">
        {toast && (
          <div class={`alert alert-${toast.type} alert-dismissible toast-notification top-0 end-0 m-3`}>
            {toast.msg}
            <button type="button" class="btn-close" onClick={() => setToast(null)} />
          </div>
        )}
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
                <div class="card-body text-center py-5">
                  <Database size={48} class="text-muted mb-3" />
                  <p class="text-muted mb-3">{t('home.noActiveDatabase')}</p>
                  <button class="btn btn-primary" onClick={() => navigate('settings')}>
                    <Settings size={16} class="me-2" />
                    {t('home.goToSettings')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="page-container">
      {toast && (
        <div class={`alert alert-${toast.type} alert-dismissible toast-notification top-0 end-0 m-3`}>
          {toast.msg}
          <button type="button" class="btn-close" onClick={() => setToast(null)} />
        </div>
      )}
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
                {/* ── KPIs ───────────────────────────────────────────── */}
                    <div class="row g-3 mb-4">
                      <div class="col-6 col-sm-4 col-xl-2">
                        <KpiCard icon={<Music2 size={22} />} value={stats.total_owned} label={t('stats.totalOwned')} color="primary" />
                      </div>
                      <div class="col-6 col-sm-4 col-xl-2">
                        <KpiCard icon={<Heart size={22} />} value={stats.total_wanted} label={t('stats.totalWanted')} color="danger" />
                      </div>
                      <div class="col-6 col-sm-4 col-xl-2">
                        <KpiCard icon={<ArrowRightLeft size={22} />} value={stats.total_lent} label={t('stats.totalLent')} color="warning" />
                      </div>
                      <div class="col-6 col-sm-4 col-xl-2">
                        <KpiCard icon={<User size={22} />} value={stats.total_artists} label={t('stats.totalArtists')} color="success" />
                      </div>
                      {hasDuration && (
                        <div class="col-6 col-sm-4 col-xl-2">
                          <KpiCard
                            icon={<Clock size={22} />}
                            value={<>{stats.total_duration_hours}<span class="fs-5">h</span>{stats.total_duration_mins > 0 && <span class="fs-5">{String(stats.total_duration_mins).padStart(2,'0')}</span>}</>}
                            label={t('stats.totalDuration')}
                            color="info"
                          />
                        </div>
                      )}
                      {stats.avg_rating != null && (
                        <div class="col-6 col-sm-4 col-xl-2">
                          <KpiCard
                            icon={<Star size={22} />}
                            value={<>{stats.avg_rating}<span class="fs-5"> ★</span></>}
                            label={t('stats.avgRating')}
                            color="yellow"
                          />
                        </div>
                      )}
                    </div>

                    {/* ── Top artistes + Genre ────────────────────────────── */}
                    <div class="row g-3">
                      {artistData.length > 0 && (
                        <div class="col-12 col-lg-6">
                          <div class="card h-100">
                            <div class="card-header">
                              <h3 class="card-title fs-5 mb-0">🏆 {t('stats.topArtists')}</h3>
                            </div>
                            <div class="card-body">
                              <HBar data={artistData} color="#6BAFC4" labelWidth={140} />
                            </div>
                          </div>
                        </div>
                      )}
                      {genreData.length > 0 && (
                        <div class="col-12 col-lg-6">
                          <div class="card h-100">
                            <div class="card-header">
                              <h3 class="card-title fs-5 mb-0">🎸 {t('stats.byGenre')}</h3>
                            </div>
                            <div class="card-body">
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1.5rem' }}>
                                <div />
                                <DonutChart data={genreData} />
                                <div class="d-flex gap-2">
                                  {[genreData.slice(0, Math.ceil(genreData.length / 2)), genreData.slice(Math.ceil(genreData.length / 2))].map((half, col) => (
                                    <div key={col} class="d-flex flex-column gap-1">
                                      {half.map((g, j) => {
                                        const i = col === 0 ? j : Math.ceil(genreData.length / 2) + j;
                                        return (
                                          <span key={i} style={{
                                            background: PALETTE[i % PALETTE.length] + '28',
                                            color: PALETTE[i % PALETTE.length],
                                            border: `1px solid ${PALETTE[i % PALETTE.length]}88`,
                                            borderRadius: 5,
                                            padding: '3px 8px',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                          }}>
                                            {g.label}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
