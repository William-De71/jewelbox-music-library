import { useState } from 'preact/hooks';

export function CoverImage({ src, title, size = 256, className = '' }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        class={`bg-dark d-flex align-items-center justify-content-center rounded ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      >
        <i class="ti ti-disc text-muted" style={`font-size:${size * 0.5}px`}></i>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      class={`rounded object-fit-cover ${className}`}
      style={{ width: size, height: size, minWidth: size }}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
