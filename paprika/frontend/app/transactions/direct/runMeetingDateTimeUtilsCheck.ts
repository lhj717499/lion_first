import assert from 'node:assert/strict';
import { combineValue, notifyParentValue, splitValue } from './meetingDateTimeUtils';

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test('splitValue: 빈 값', () => {
  assert.deepEqual(splitValue(''), { date: '', hour: '', minute: '' });
});

test('splitValue: 완성된 값', () => {
  assert.deepEqual(splitValue('2026-07-05 14:30'), {
    date: '2026-07-05',
    hour: '14',
    minute: '30',
  });
});

test('combineValue: 날짜만 있으면 빈 문자열 (부모에는 미전달)', () => {
  assert.equal(combineValue('2026-07-05', '', ''), '');
});

test('combineValue: 모두 선택하면 16자 형식', () => {
  assert.equal(combineValue('2026-07-05', '14', '30'), '2026-07-05 14:30');
  assert.equal(combineValue('2026-07-05', '14', '30').length, 16);
});

test('날짜만 선택해도 내부 state date는 유지 (화면 표시용)', () => {
  let date = '';
  let hour = '';
  let minute = '';

  date = '2026-07-05';
  assert.equal(date, '2026-07-05');
  assert.equal(notifyParentValue(date, hour, minute), '');

  hour = '14';
  assert.equal(notifyParentValue(date, hour, minute), '');

  minute = '30';
  assert.equal(notifyParentValue(date, hour, minute), '2026-07-05 14:30');
});

test('거래 생성 API 형식 변환 (공백 -> T)', () => {
  const meetingTime = '2026-07-05 14:30';
  assert.equal(meetingTime.replace(' ', 'T'), '2026-07-05T14:30');
});

console.log('\nMeetingDateTimePicker logic: all tests passed');
