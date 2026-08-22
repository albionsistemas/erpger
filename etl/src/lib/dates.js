// El dump legacy usa MySQL con fechas '0000-00-00' / '0000-00-00 00:00:00'
// como "sin definir" en vez de NULL. Con mysql2 configurado en dateStrings:true
// estos valores llegan como texto crudo, no como Date invalido.

const ZERO_DATE = /^0000-00-00/;

function parseDate(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    if (text === '' || ZERO_DATE.test(text)) return null;
    return text; // 'YYYY-MM-DD' o 'YYYY-MM-DD HH:MM:SS', formato que Postgres acepta directo
}

function parseIntOrNull(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    if (text === '') return null;
    const n = parseInt(text, 10);
    return Number.isNaN(n) ? null : n;
}

function cleanText(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text === '' ? null : text;
}

const SLASH_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

// Algunas columnas legacy (ej: maquinas.FechaValorMateriales) guardan
// fechas como texto libre 'dd/mm/yyyy' en vez del formato ISO habitual.
function parseLegacySlashDate(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    const match = SLASH_DATE.exec(text);
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function toBool01(value) {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    if (Number.isNaN(n)) return null;
    return n !== 0;
}

module.exports = { parseDate, parseLegacySlashDate, parseIntOrNull, cleanText, toBool01 };
