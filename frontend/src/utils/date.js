export function toISTISOString(localDate) {
  // localDate is a JS Date object
  // returns ISO-like string with +05:30 offset (format your backend expects)
  const pad = n => String(n).padStart(2, "0");
  const year = localDate.getFullYear();
  const month = pad(localDate.getMonth()+1);
  const day = pad(localDate.getDate());
  const hours = pad(localDate.getHours());
  const minutes = pad(localDate.getMinutes());
  const seconds = pad(localDate.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
}
