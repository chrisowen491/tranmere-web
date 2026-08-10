/**
 * Historic abbreviations and data-entry mistakes mapped to the canonical name
 * used by the Tranmere-Web database.
 */
const clubNameAliases = new Map([
  ['Bradford', 'Bradford City'],
  ['Bristol R', 'Bristol Rovers'],
  ['Carlisle', 'Carlisle United'],
  ['Colchester', 'Colchester United'],
  ['Crawley', 'Crawley Town'],
  ['Forest Green', 'Forest Green Rovers'],
  ['Newport Co', 'Newport County'],
  ['Northampton', 'Northampton Town'],
  ['Oldham', 'Oldham Athletic'],
  ['Oxford', 'Oxford United'],
  ['Scunthorpe', 'Scunthorpe United'],
  ['Southend', 'Southend United'],
  ['Stevege Borough', 'Stevenage']
]);

export function canonicalizeClubName(name) {
  return clubNameAliases.get(name) ?? name;
}
