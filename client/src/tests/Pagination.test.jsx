import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { Pagination } from '../components/Pagination.jsx';
import { I18nProvider } from '../config/i18n/index.js';

const wrap = (ui) => render(<I18nProvider>{ui}</I18nProvider>);

describe('Pagination', () => {
  it('renders the current page as active', () => {
    wrap(<Pagination page={2} limit={10} total={50} onChange={vi.fn()} />);
    const active = document.querySelector('.page-item.active .page-link');
    expect(active.textContent).toBe('2');
  });

  it('disables the previous button on page 1', () => {
    wrap(<Pagination page={1} limit={10} total={50} onChange={vi.fn()} />);
    const items = document.querySelectorAll('.page-item');
    expect(items[0].classList.contains('disabled')).toBe(true);
  });

  it('disables the next button on the last page', () => {
    wrap(<Pagination page={5} limit={10} total={50} onChange={vi.fn()} />);
    const items = document.querySelectorAll('.page-item');
    expect(items[items.length - 1].classList.contains('disabled')).toBe(true);
  });

  it('calls onChange with the correct page when a page button is clicked', () => {
    const onChange = vi.fn();
    wrap(<Pagination page={1} limit={10} total={50} onChange={onChange} />);
    fireEvent.click(screen.getByText('3'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('calls onChange with page - 1 when previous is clicked', () => {
    const onChange = vi.fn();
    wrap(<Pagination page={3} limit={10} total={50} onChange={onChange} />);
    const items = document.querySelectorAll('.page-item');
    fireEvent.click(items[0].querySelector('button'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with page + 1 when next is clicked', () => {
    const onChange = vi.fn();
    wrap(<Pagination page={3} limit={10} total={50} onChange={onChange} />);
    const items = document.querySelectorAll('.page-item');
    fireEvent.click(items[items.length - 1].querySelector('button'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('shows ellipsis and first page button when window does not start at 1', () => {
    wrap(<Pagination page={5} limit={10} total={100} onChange={vi.fn()} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(1);
  });
});
