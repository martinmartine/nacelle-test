export default globalHandle => {
  let [handle, locale] = globalHandle.split('::')
  if(!locale) locale = 'en-us'
  let formattedLocale = `::${locale.toLowerCase().replace('_', '-')}`
  return String(`${handle}${formattedLocale}`)
}
