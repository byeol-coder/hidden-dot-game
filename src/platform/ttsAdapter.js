export function createTtsAdapter({ getLanguage, isEnabled, announce }) {
  return {
    speak(text, options = {}) {
      // Callers that already pushed this exact text into a visible aria-live
      // element (see setStatus in main.js) pass skipAnnounce so the hidden
      // SR announcer does not repeat the same sentence a second time.
      if (!options.skipAnnounce) announce?.(text, Boolean(options.assertive));
      if (!isEnabled() || !window.TW_TTS) return;
      try {
        window.TW_TTS.setLang?.(getLanguage());
        window.TW_TTS.setEnabled?.(true);
        window.TW_TTS.speak(text, { lang: getLanguage(), onEnd: options.onEnd });
      } catch (error) {
        console.warn("[TW_TTS]", error);
      }
    },
    stop() { try { window.TW_TTS?.stop?.(); } catch (_) {} },
    setEnabled(enabled) { try { window.TW_TTS?.setEnabled?.(Boolean(enabled)); } catch (_) {} }
  };
}
