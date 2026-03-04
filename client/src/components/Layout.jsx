export function Layout({ children, navigate, currentPage }) {
  return (
    <div class="wrapper">
      <aside class="navbar navbar-vertical navbar-expand-lg navbar-dark" data-bs-theme="dark">
        <div class="container-fluid">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu">
            <span class="navbar-toggler-icon"></span>
          </button>
          <h1 class="navbar-brand navbar-brand-autodark">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}>
              <span class="d-flex align-items-center gap-2">
                <i class="ti ti-disc fs-2 text-primary"></i>
                <span>
                  <span class="fw-bold">JewelBox</span>
                  <span class="d-block text-muted small fw-normal" style="font-size:0.65rem;line-height:1">Music Library</span>
                </span>
              </span>
            </a>
          </h1>
          <div class="collapse navbar-collapse" id="sidebar-menu">
            <ul class="navbar-nav pt-lg-3">
              <li class="nav-item">
                <a
                  class={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}
                >
                  <span class="nav-link-icon d-md-none d-lg-inline-block">
                    <i class="ti ti-layout-dashboard"></i>
                  </span>
                  <span class="nav-link-title">Bibliothèque</span>
                </a>
              </li>
              <li class="nav-item">
                <a
                  class={`nav-link ${currentPage === 'add' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('add'); }}
                >
                  <span class="nav-link-icon d-md-none d-lg-inline-block">
                    <i class="ti ti-plus"></i>
                  </span>
                  <span class="nav-link-title">Ajouter un CD</span>
                </a>
              </li>
            </ul>
            <div class="mt-auto pb-3">
              <div class="px-3 small text-muted">
                <i class="ti ti-quote me-1"></i>
                <em>Parce que vos albums méritent mieux qu'une simple étagère.</em>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div class="page-wrapper">
        <div class="page-body">
          <div class="container-xl py-3">
            {children}
          </div>
        </div>
        <footer class="footer footer-transparent d-print-none">
          <div class="container-xl">
            <div class="row text-center align-items-center flex-row-reverse">
              <div class="col-12 col-lg-auto mt-3 mt-lg-0 text-muted small">
                JewelBox Music Library &copy; {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
