import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { StarRating } from '../components/StarRating.jsx';
import { I18nProvider } from '../config/i18n/index.js';

const wrap = (ui) => render(<I18nProvider>{ui}</I18nProvider>);

describe('StarRating', () => {
  it('renders 5 star buttons', () => {
    wrap(<StarRating value={3} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('calls onChange with correct star index when clicked', () => {
    const onChange = vi.fn();
    wrap(<StarRating value={0} onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not call onChange when readOnly', () => {
    const onChange = vi.fn();
    wrap(<StarRating value={3} onChange={onChange} readOnly />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('displays filled stars up to value', () => {
    wrap(<StarRating value={3} />);
    const buttons = screen.getAllByRole('button');
    const filledStars = buttons.filter((b) => b.textContent === '★');
    expect(filledStars).toHaveLength(3);
  });
});
