function parseDate(value) {
  const date = value ? new Date(`${value}T12:00:00`) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

export const pad2 = (number) => String(number).padStart(2, "0");

export function dateLabel(value) {
  const date = parseDate(value);
  if (!date) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function ageLabel(value) {
  const birth = parseDate(value);
  if (!birth) return "Idade não informada";
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 12) return plural(Math.max(months, 0), "mês", "meses");
  return plural(Math.floor(months / 12), "aninho", "aninhos");
}

// Data de hoje no fuso local, no formato do <input type="date"> (AAAA-MM-DD).
export const today = () => new Date().toLocaleDateString("sv-SE");
