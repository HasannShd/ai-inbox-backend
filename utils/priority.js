function within48h(str) {
  const d = new Date(str);
  return !isNaN(d) && (d - new Date()) / 36e5 <= 48;
}

exports.inferPriority = function (raw = '') {
  const s = raw.toLowerCase();
  if (/(urgent|asap|immediately|critical)/.test(s)) return 'high';
  const m = s.match(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\b/);
  if (m && within48h(m[0])) return 'medium';
  return 'low';
};
