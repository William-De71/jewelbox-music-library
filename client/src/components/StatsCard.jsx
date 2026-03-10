export function StatsCard({ icon, title, value, color = 'primary' }) {
  return (
    <div class="col-sm-6 col-lg-3">
      <div class="card stats-card">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class={`stats-icon bg-${color}-lt`}>
              <i class={`ti ti-${icon} text-${color}`}></i>
            </div>
            <div class="ms-3">
              <div class="stats-value">{value}</div>
              <div class="stats-label text-muted">{title}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
