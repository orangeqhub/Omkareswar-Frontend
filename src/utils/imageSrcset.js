export function responsiveSrcSet(url, widths) {
  if (!url) return undefined;
  if (!/\bw=\d+/.test(url)) return undefined;
  const srcs = widths.map((w) => `${url.replace(/\bw=\d+/, `w=${w}`)} ${w}w`);
  return srcs.join(', ');
}