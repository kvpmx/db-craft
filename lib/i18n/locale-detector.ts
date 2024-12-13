export default defineI18nLocaleDetector((event, config) => {
  // Try to get locale from a query
  const query = tryQueryLocale(event, { lang: '' });
  if (query) return query.toString();

  // Try to get locale from cookie
  const cookie = tryCookieLocale(event, { lang: '', name: 'i18n_locale' });
  if (cookie) return cookie.toString();

  // Try to get locale from header (`accept-header`)
  const header = tryHeaderLocale(event, { lang: '' });
  if (header) return header.toString();

  return config.defaultLocale;
});
