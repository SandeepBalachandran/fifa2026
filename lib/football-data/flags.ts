/**
 * Emoji flags via Unicode Regional Indicator Symbols.
 * No external API, no images — pure Unicode.
 *
 * The trick: each flag emoji is two Regional Indicator letters.
 * 'B' = U+1F1E7, 'R' = U+1F1F7  →  🇧🇷
 */
function iso2ToEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1a5 + c.charCodeAt(0)))
    .join('');
}

/**
 * Maps Football Data API TLA codes → ISO 3166-1 alpha-2 country codes.
 * Explicit overrides for nations without their own ISO-2 flag
 * (England, Scotland, Wales use GB subdivision flags).
 */
const TLA_TO_FLAG: Record<string, string> = {
  // ── North / Central America & Caribbean (CONCACAF) ──
  USA: iso2ToEmoji('US'),
  MEX: iso2ToEmoji('MX'),
  CAN: iso2ToEmoji('CA'),
  CRC: iso2ToEmoji('CR'),
  HON: iso2ToEmoji('HN'),
  GTM: iso2ToEmoji('GT'),
  JAM: iso2ToEmoji('JM'),
  PAN: iso2ToEmoji('PA'),
  HAI: iso2ToEmoji('HT'),
  TRI: iso2ToEmoji('TT'),
  CUB: iso2ToEmoji('CU'),

  // ── South America (CONMEBOL) ──
  BRA: iso2ToEmoji('BR'),
  ARG: iso2ToEmoji('AR'),
  URU: iso2ToEmoji('UY'),
  COL: iso2ToEmoji('CO'),
  ECU: iso2ToEmoji('EC'),
  CHI: iso2ToEmoji('CL'),
  PAR: iso2ToEmoji('PY'),
  PER: iso2ToEmoji('PE'),
  BOL: iso2ToEmoji('BO'),
  VEN: iso2ToEmoji('VE'),

  // ── Europe (UEFA) ──
  GER: iso2ToEmoji('DE'),
  FRA: iso2ToEmoji('FR'),
  ESP: iso2ToEmoji('ES'),
  NED: iso2ToEmoji('NL'),
  POR: iso2ToEmoji('PT'),
  ITA: iso2ToEmoji('IT'),
  BEL: iso2ToEmoji('BE'),
  POL: iso2ToEmoji('PL'),
  CRO: iso2ToEmoji('HR'),
  SUI: iso2ToEmoji('CH'),
  SRB: iso2ToEmoji('RS'),
  SER: iso2ToEmoji('RS'),
  AUT: iso2ToEmoji('AT'),
  DEN: iso2ToEmoji('DK'),
  SWE: iso2ToEmoji('SE'),
  NOR: iso2ToEmoji('NO'),
  UKR: iso2ToEmoji('UA'),
  GRE: iso2ToEmoji('GR'),
  HUN: iso2ToEmoji('HU'),
  ROU: iso2ToEmoji('RO'),
  TUR: iso2ToEmoji('TR'),
  SVK: iso2ToEmoji('SK'),
  SVN: iso2ToEmoji('SI'),
  BIH: iso2ToEmoji('BA'),
  ALB: iso2ToEmoji('AL'),
  GEO: iso2ToEmoji('GE'),
  CZE: iso2ToEmoji('CZ'),
  // UK nations — subdivision flag emojis (🏴󠁧󠁢󠁥󠁮󠁧󁿢 etc.)
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󁿢',
  SCO: '🏴󠁧󠁢󠁳󠁣󠁴󁿢',
  WAL: '🏴󠁧󠁢󠁷󠁬󠁳󁿢',
  NIR: iso2ToEmoji('GB'),

  // ── Africa (CAF) ──
  MAR: iso2ToEmoji('MA'),
  SEN: iso2ToEmoji('SN'),
  NGA: iso2ToEmoji('NG'),
  GHA: iso2ToEmoji('GH'),
  EGY: iso2ToEmoji('EG'),
  CMR: iso2ToEmoji('CM'),
  CIV: iso2ToEmoji('CI'),
  MLI: iso2ToEmoji('ML'),
  ALG: iso2ToEmoji('DZ'),
  TUN: iso2ToEmoji('TN'),
  RSA: iso2ToEmoji('ZA'),
  AGO: iso2ToEmoji('AO'),
  MOZ: iso2ToEmoji('MZ'),
  COD: iso2ToEmoji('CD'),
  ZIM: iso2ToEmoji('ZW'),
  CTA: iso2ToEmoji('CF'),
  TAN: iso2ToEmoji('TZ'),
  UGA: iso2ToEmoji('UG'),
  GAB: iso2ToEmoji('GA'),

  // ── Asia (AFC) ──
  JPN: iso2ToEmoji('JP'),
  KOR: iso2ToEmoji('KR'),
  AUS: iso2ToEmoji('AU'),
  IRN: iso2ToEmoji('IR'),
  SAU: iso2ToEmoji('SA'),
  QAT: iso2ToEmoji('QA'),
  JOR: iso2ToEmoji('JO'),
  UZB: iso2ToEmoji('UZ'),
  IDN: iso2ToEmoji('ID'),
  CHN: iso2ToEmoji('CN'),
  IND: iso2ToEmoji('IN'),
  IRQ: iso2ToEmoji('IQ'),
  KUW: iso2ToEmoji('KW'),
  OMN: iso2ToEmoji('OM'),
  BAH: iso2ToEmoji('BH'),
  YEM: iso2ToEmoji('YE'),
  THA: iso2ToEmoji('TH'),
  VIE: iso2ToEmoji('VN'),
  PHI: iso2ToEmoji('PH'),
  MAS: iso2ToEmoji('MY'),
  SYR: iso2ToEmoji('SY'),
  PAL: iso2ToEmoji('PS'),
  LEB: iso2ToEmoji('LB'),
  KGZ: iso2ToEmoji('KG'),
  TAJ: iso2ToEmoji('TJ'),
  TKM: iso2ToEmoji('TM'),

  // ── Oceania (OFC) ──
  NZL: iso2ToEmoji('NZ'),
  FIJ: iso2ToEmoji('FJ'),
  PNG: iso2ToEmoji('PG'),
  SOL: iso2ToEmoji('SB'),
  VAN: iso2ToEmoji('VU'),
};

/**
 * Returns the flag emoji for a team given its TLA code.
 * Falls back to 🏳 if not mapped.
 */
export function getFlagByTla(tla: string): string {
  return TLA_TO_FLAG[tla.toUpperCase()] ?? '🏳';
}

/**
 * Returns the flag emoji using a raw ISO-2 code (e.g. 'BR' → '🇧🇷').
 * Useful when you already have an ISO-2 code.
 */
export function getFlagByIso2(iso2: string): string {
  return iso2ToEmoji(iso2);
}
