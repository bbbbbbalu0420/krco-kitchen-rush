'use strict';
// Carry only non-personal campaign labels to the fixed Play listing. This file
// does not collect visits, store cookies, contact a server or identify players.
function krcoCampaignLabels(query) {
  const params = new URLSearchParams(query);
  const sources = new Set(['facebook', 'threads', 'instagram', 'x', 'reddit', 'telegram', 'vk', 'youtube', 'discord', 'organic', 'other']);
  if (params.getAll('utm_source').length !== 1 || params.getAll('utm_campaign').length !== 1) return null;
  const source = params.get('utm_source'), campaign = params.get('utm_campaign');
  if (!sources.has(source) || !/^[a-z][a-z0-9_-]{0,63}$/.test(campaign)) return null;
  return { source, campaign };
}
function krcoCampaignStoreUrl(query, rawUrl) {
  const labels = krcoCampaignLabels(query);
  if (!labels) return rawUrl;
  const { source, campaign } = labels;
  let url;
  try { url = new URL(rawUrl); } catch (_) { return rawUrl; }
  if (url.origin !== 'https://play.google.com' || url.pathname !== '/store/apps/details' ||
      url.searchParams.get('id') !== 'com.driveoil.kitchenrush') return rawUrl;
  const referrer = new URLSearchParams({ utm_source: source, utm_medium: source === 'organic' ? 'organic' : 'social', utm_campaign: campaign });
  url.searchParams.set('referrer', referrer.toString());
  return url.toString();
}
function krcoLanguageUrl(query, language) {
  if (!['en', 'ru'].includes(language)) return null;
  const params = new URLSearchParams({ lang: language });
  const labels = krcoCampaignLabels(query);
  if (labels) { params.set('utm_source', labels.source); params.set('utm_campaign', labels.campaign); }
  return '?' + params.toString() + '#start-' + language;
}
if (typeof module !== 'undefined' && module.exports) module.exports = { krcoCampaignStoreUrl, krcoLanguageUrl };
else {
  for (const link of document.querySelectorAll('a[data-krco-play-store]'))
    link.href = krcoCampaignStoreUrl(window.location.search, link.href);
}
