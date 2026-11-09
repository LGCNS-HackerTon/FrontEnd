export function formatUnit({ building, unit }) {
  const suffix = (value, label) => (value.endsWith(label) ? value : value + label);
  return [building && suffix(building, '동'), suffix(unit, '호')]
    .filter(Boolean)
    .join(' ');
}
