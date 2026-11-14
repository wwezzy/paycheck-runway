// SpeechRecognitionEvent.results is a cumulative snapshot, not a new text chunk.
// Rebuild from that snapshot so interim revisions never become duplicate entries.
export function speechSnapshot(results, prefix = '') {
  const final = [], interim = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const text = String(result?.[0]?.transcript || '').trim();
    if (!text) continue;
    (result.isFinal ? final : interim).push(text);
  }
  const join = parts => parts.filter(Boolean).join(' ').trim();
  const committed = join([String(prefix).trim(), ...final]);
  return {committed, preview: join([committed, ...interim]), hasInterim: interim.length > 0};
}
