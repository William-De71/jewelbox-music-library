import { useState, useEffect } from 'preact/hooks';
import { api } from '../api/client.js';

export function VersionInfo({ className = '' }) {
  const [version, setVersion] = useState(null);

  useEffect(() => {
    api.getVersion()
      .then(data => setVersion(data))
      .catch(err => console.error('Failed to fetch version:', err));
  }, []);

  if (!version) return null;

  return (
    <div className={`version-info ${className}`}>
      <span className="version-badge">v{version.version}</span>
    </div>
  );
}
