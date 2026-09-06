import { describe, it, expect } from 'vitest';
import { parseBggCsv, parseBggXml, parseBggExport } from './bggImport';

const csv = [
  'objectname,objectid,minplayers,maxplayers,minplaytime,maxplaytime,avgweight,own',
  'Azul,230802,2,4,30,45,1.76,1',
  '"Wingspan, Deluxe",266192,1,5,40,70,2.45,1',
  'Not Owned,1,2,2,10,10,1,0',
].join('\n');

describe('parseBggCsv', () => {
  it('parses owned rows and skips own=0', () => {
    const games = parseBggCsv(csv);
    expect(games.map((g) => g.title)).toEqual(['Azul', 'Wingspan, Deluxe']);
  });

  it('normalizes numeric fields and clamps weight to 1..5', () => {
    const [azul] = parseBggCsv(csv);
    expect(azul).toMatchObject({ bggId: 230802, minPlayers: 2, maxPlayers: 4, minTime: 30, maxTime: 45 });
    expect(azul.weight).toBeGreaterThanOrEqual(1);
    expect(azul.weight).toBeLessThanOrEqual(5);
  });

  it('falls back to defaults for blank/invalid values', () => {
    const out = parseBggCsv('objectname,minplayers\nMystery Box,\n');
    expect(out[0]).toMatchObject({ title: 'Mystery Box', minPlayers: 1, maxPlayers: 4 });
  });

  it('returns [] when there are no data rows', () => {
    expect(parseBggCsv('objectname\n')).toEqual([]);
  });
});

describe('parseBggXml', () => {
  const xml = `<items>
    <item objectid="13">
      <name>Catan</name>
      <thumbnail>t.jpg</thumbnail>
      <stats minplayers="3" maxplayers="4" minplaytime="60" maxplaytime="120" />
      <status own="1" />
    </item>
    <item objectid="99"><name>Sold</name><status own="0" /></item>
  </items>`;

  it('parses owned items only', () => {
    const games = parseBggXml(xml);
    expect(games).toHaveLength(1);
    expect(games[0]).toMatchObject({ title: 'Catan', bggId: 13, minPlayers: 3, maxPlayers: 4, thumbnail: 't.jpg' });
  });

  it('returns [] on malformed XML', () => {
    expect(parseBggXml('<items><oops>')).toEqual([]);
  });
});

describe('parseBggExport', () => {
  it('dispatches to the XML parser when the text looks like XML', () => {
    expect(parseBggExport('  <items><item objectid="1"><name>X</name><status own="1"/></item></items>')).toHaveLength(1);
  });

  it('dispatches to the CSV parser otherwise', () => {
    expect(parseBggExport(csv).map((g) => g.title)).toEqual(['Azul', 'Wingspan, Deluxe']);
  });
});
