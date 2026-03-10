import { useState } from 'preact/hooks';

export function CoverImage({ src, title, size = 256, className = '' }) {
  const [error, setError] = useState(false);

  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`
  };

  if (!src || error) {
    return (
      <div
        class={`cover-image-placeholder ${className}`}
        style={sizeStyle}
      >
        <i class="ti ti-disc cover-image-icon" style={{ fontSize: `${size * 0.5}px` }}></i>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      class={`cover-image ${className}`}
      style={sizeStyle}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
