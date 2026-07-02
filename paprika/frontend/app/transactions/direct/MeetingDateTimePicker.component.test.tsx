/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MeetingDateTimePicker from './MeetingDateTimePicker';

afterEach(() => {
  cleanup();
});

describe('MeetingDateTimePicker', () => {
  it('날짜만 선택해도 date input 값이 유지된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MeetingDateTimePicker value="" onChange={onChange} id="meeting-date" />);

    const dateInput = document.getElementById('meeting-date') as HTMLInputElement;
    await user.click(dateInput);
    fireEvent.change(dateInput, { target: { value: '2026-07-05' } });

    expect(dateInput.value).toBe('2026-07-05');
    expect(screen.getByText(/2026년 7월 5일/)).toBeTruthy();
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('날짜·시·분을 모두 선택하면 부모에 16자 값을 전달한다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MeetingDateTimePicker value="" onChange={onChange} id="meeting-date" />);

    const dateInput = document.getElementById('meeting-date') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2026-07-05' } });

    await user.selectOptions(screen.getByRole('combobox', { name: '시' }), '14');
    await user.selectOptions(screen.getByRole('combobox', { name: '분' }), '30');

    expect(onChange).toHaveBeenLastCalledWith('2026-07-05 14:30');
    expect(screen.getByText(/2026년 7월 5일.*14:30/)).toBeTruthy();
  });

  it('value prop이 바뀌면 input/select에 반영된다', () => {
    const { rerender } = render(
      <MeetingDateTimePicker value="2026-08-01 09:15" onChange={vi.fn()} id="meeting-date" />,
    );

    expect((document.getElementById('meeting-date') as HTMLInputElement).value).toBe('2026-08-01');
    expect((screen.getByRole('combobox', { name: '시' }) as HTMLSelectElement).value).toBe('09');
    expect((screen.getByRole('combobox', { name: '분' }) as HTMLSelectElement).value).toBe('15');

    rerender(<MeetingDateTimePicker value="" onChange={vi.fn()} id="meeting-date" />);

    expect((document.getElementById('meeting-date') as HTMLInputElement).value).toBe('');
    expect((screen.getByRole('combobox', { name: '시' }) as HTMLSelectElement).value).toBe('');
    expect((screen.getByRole('combobox', { name: '분' }) as HTMLSelectElement).value).toBe('');
  });
});
