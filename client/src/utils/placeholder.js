// Shared placeholder SVG to avoid duplication
export function getPlaceholderSVG() {
  return `
    <svg class="text-muted opacity-50" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `;
}

export function getPlaceholderHTML() {
  return `
    <div class="position-relative">
      <svg class="text-muted opacity-50" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
      <svg class="text-danger position-absolute top-0 start-100 translate-middle" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </div>
  `;
}
