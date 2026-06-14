import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { AlbumForm } from '../pages/AlbumForm.jsx';
import { I18nProvider } from '../config/i18n/index.jsx';
import { api } from '../api/client.js';

vi.mock('../api/client.js', () => ({
  api: {
    getArtists: vi.fn().mockResolvedValue([]),
    getLabels: vi.fn().mockResolvedValue([]),
    getGenres: vi.fn().mockResolvedValue([]),
    createAlbum: vi.fn().mockResolvedValue({ id: 1 }),
  },
}));

const wrap = (ui) => render(<I18nProvider>{ui}</I18nProvider>);

const fillRequiredFields = () => {
  fireEvent.input(screen.getByPlaceholderText('ex: OK Computer'), { target: { value: 'OK Computer' } });
  fireEvent.input(screen.getByPlaceholderText('ex: Radiohead'), { target: { value: 'Radiohead' } });
};

beforeEach(() => {
  vi.clearAllMocks();
  api.getArtists.mockResolvedValue([]);
  api.getLabels.mockResolvedValue([]);
  api.getGenres.mockResolvedValue([]);
  api.createAlbum.mockResolvedValue({ id: 1 });
});

describe('AlbumForm - boutons Enregistrer / Enregistrer et ajouter', () => {
  it('Collections: "Enregistrer" navigue vers collections', async () => {
    const navigate = vi.fn();
    wrap(<AlbumForm navigate={navigate} params={{ returnPage: 2 }} />);

    fillRequiredFields();
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => expect(api.createAlbum).toHaveBeenCalled());
    expect(navigate).toHaveBeenCalledWith('collections', expect.objectContaining({ page: 2 }));
  });

  it('Collections: "Enregistrer et ajouter" réinitialise le formulaire sans naviguer', async () => {
    const navigate = vi.fn();
    wrap(<AlbumForm navigate={navigate} params={{ returnPage: 2 }} />);

    fillRequiredFields();
    fireEvent.click(screen.getByText('Enregistrer et ajouter'));

    await waitFor(() => expect(api.createAlbum).toHaveBeenCalled());
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('ex: OK Computer').value).toBe('');
  });

  it('Liste de souhaits: "Enregistrer" navigue vers wantlist', async () => {
    const navigate = vi.fn();
    wrap(<AlbumForm navigate={navigate} params={{ fromWantList: true, returnPage: 3 }} />);

    fillRequiredFields();
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => expect(api.createAlbum).toHaveBeenCalled());
    expect(navigate).toHaveBeenCalledWith('wantlist', expect.objectContaining({ page: 3 }));
  });

  it('Liste de souhaits: "Enregistrer et ajouter" réinitialise le formulaire sans naviguer', async () => {
    const navigate = vi.fn();
    wrap(<AlbumForm navigate={navigate} params={{ fromWantList: true, returnPage: 3 }} />);

    fillRequiredFields();
    fireEvent.click(screen.getByText('Enregistrer et ajouter'));

    await waitFor(() => expect(api.createAlbum).toHaveBeenCalled());
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('ex: OK Computer').value).toBe('');
  });
});
