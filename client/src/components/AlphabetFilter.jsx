import { useI18n } from '../config/i18n/index.jsx';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function AlphabetFilter({ activeLetter, availableLetters, onChange }) {
  const { t } = useI18n();

  return (
    <div class="alphabet-filter d-flex flex-wrap align-items-center gap-1">
      <button
        class={`btn btn-sm alphabet-letter ${!activeLetter ? 'btn-primary' : 'btn-link text-secondary'}`}
        onClick={() => onChange(null)}
        title={t('filters.allArtists')}
      >
        {t('filters.allArtistsShort')}
      </button>
      {LETTERS.map(letter => {
        const available = availableLetters.includes(letter);
        const active = activeLetter === letter;
        return (
          <button
            key={letter}
            class={`btn btn-sm alphabet-letter ${active ? 'btn-primary' : 'btn-link'}`}
            disabled={!available}
            onClick={() => available && onChange(letter)}
            style={!available ? { opacity: 0.3, cursor: 'default', textDecoration: 'none' } : { textDecoration: 'none' }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
