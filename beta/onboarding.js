'use strict';
// Presentation only. No report submission, cookies, local storage or analytics.
function krcoPreferredLanguage(query, browserLanguage) {
  const params = new URLSearchParams(query);
  if (params.getAll('lang').length === 1 && ['en', 'ru'].includes(params.get('lang'))) return params.get('lang');
  return typeof browserLanguage === 'string' && /^ru(?:-|$)/i.test(browserLanguage) ? 'ru' : 'en';
}
if (typeof module !== 'undefined' && module.exports) module.exports = { krcoPreferredLanguage };
else {
  const language = krcoPreferredLanguage(window.location.search, navigator.language);
  document.documentElement.lang = language;
  document.documentElement.dataset.languageReady = 'true';
  for (const link of document.querySelectorAll('a[data-language]')) {
    const target = link.dataset.language;
    const url = krcoLanguageUrl(window.location.search, target);
    if (url) link.href = url;
    if (target === language) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  for (const button of document.querySelectorAll('button[data-copy-report]')) {
    button.addEventListener('click', async () => {
      const field = document.getElementById(button.dataset.copyReport);
      const status = button.closest('article').querySelector('[role="status"]');
      if (!field || !status) return;
      // Some browsers leave clipboard permission pending while a tab is in the
      // background. Keep manual copying available immediately in that case.
      field.focus(); field.select();
      status.textContent = button.dataset.copyFallback;
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error('COPY_UNAVAILABLE');
        await navigator.clipboard.writeText(field.value);
        status.textContent = button.dataset.copySuccess;
      } catch (_) { /* The selected template and fallback message stay available. */ }
    });
  }
}
