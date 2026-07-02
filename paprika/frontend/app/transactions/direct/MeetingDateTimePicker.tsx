'use client';

import { useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import { combineValue, splitValue } from './meetingDateTimeUtils';
import styles from './MeetingDateTimePicker.module.css';

interface MeetingDateTimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function MeetingDateTimePicker({
  id,
  value,
  onChange,
  inputClassName,
}: MeetingDateTimePickerProps) {
  const initial = splitValue(value);
  const [date, setDate] = useState(initial.date);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const next = splitValue(value);
    setDate(next.date);
    setHour(next.hour);
    setMinute(next.minute);
  }, [value]);

  const notifyParent = (nextDate: string, nextHour: string, nextMinute: string) => {
    onChange(combineValue(nextDate, nextHour, nextMinute));
  };

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    notifyParent(nextDate, hour, minute);
  };

  const handleHourChange = (nextHour: string) => {
    setHour(nextHour);
    notifyParent(date, nextHour, minute);
  };

  const handleMinuteChange = (nextMinute: string) => {
    setMinute(nextMinute);
    notifyParent(date, hour, nextMinute);
  };

  let preview = '날짜와 시간을 선택해 주세요.';
  if (date && hour && minute) {
    try {
      const parsed = parse(combineValue(date, hour, minute), 'yyyy-MM-dd HH:mm', new Date());
      preview = format(parsed, 'yyyy년 M월 d일 (EEE) HH:mm', { locale: ko });
    } catch {
      preview = combineValue(date, hour, minute);
    }
  } else if (date) {
    try {
      const parsed = parse(date, 'yyyy-MM-dd', new Date());
      preview = `${format(parsed, 'yyyy년 M월 d일 (EEE)', { locale: ko })} — 시간을 선택해 주세요.`;
    } catch {
      preview = date;
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>날짜</span>
          <input
            id={id}
            className={inputClassName}
            type="date"
            min={today}
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>시간 (24시간)</span>
          <div className={styles.timeRow}>
            <select
              className={`${inputClassName ?? ''} ${styles.select}`}
              value={hour}
              onChange={(event) => handleHourChange(event.target.value)}
              aria-label="시"
            >
              <option value="">시</option>
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}시
                </option>
              ))}
            </select>
            <span className={styles.timeSeparator}>:</span>
            <select
              className={`${inputClassName ?? ''} ${styles.select}`}
              value={minute}
              onChange={(event) => handleMinuteChange(event.target.value)}
              aria-label="분"
            >
              <option value="">분</option>
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}분
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <p className={styles.preview}>{preview}</p>
    </div>
  );
}
