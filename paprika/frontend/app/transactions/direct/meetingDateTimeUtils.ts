export function splitValue(value: string): { date: string; hour: string; minute: string } {
  const match = value.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})$/);
  if (!match) {
    return { date: '', hour: '', minute: '' };
  }
  return { date: match[1], hour: match[2], minute: match[3] };
}

export function combineValue(date: string, hour: string, minute: string): string {
  if (!date || !hour || !minute) {
    return '';
  }
  return `${date} ${hour}:${minute}`;
}

/** 부모 onChange에 전달되는 값 (MeetingDateTimePicker 내부 state 기준) */
export function notifyParentValue(
  date: string,
  hour: string,
  minute: string,
): string {
  return combineValue(date, hour, minute);
}
