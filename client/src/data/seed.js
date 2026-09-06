import { nanoid } from '@reduxjs/toolkit';

// Small starter shelf so the app is explorable on first run.
// mood: 'strategy' | 'competitive' | 'cooperative' | 'party'
// condition: 'mint' | 'good' | 'worn' | 'damaged'
export function buildSeed() {
  const g = (o) => ({
    id: nanoid(),
    categories: [],
    condition: 'good',
    estimatedValue: 0,
    notes: '',
    thumbnail: '',
    bggId: null,
    acquiredAt: '2024-01-01',
    ...o,
  });

  const games = [
    g({ title: 'Azul', minPlayers: 2, maxPlayers: 4, minTime: 30, maxTime: 45, weight: 1.8, mood: 'strategy', estimatedValue: 32, categories: ['abstract'] }),
    g({ title: 'Codenames', minPlayers: 2, maxPlayers: 8, minTime: 15, maxTime: 30, weight: 1.3, mood: 'party', estimatedValue: 18, categories: ['word', 'team'] }),
    g({ title: 'Wingspan', minPlayers: 1, maxPlayers: 5, minTime: 40, maxTime: 70, weight: 2.4, mood: 'strategy', estimatedValue: 55, categories: ['engine-building'] }),
    g({ title: 'Pandemic', minPlayers: 2, maxPlayers: 4, minTime: 45, maxTime: 60, weight: 2.4, mood: 'cooperative', estimatedValue: 36, categories: ['co-op'] }),
    g({ title: 'Catan', minPlayers: 3, maxPlayers: 4, minTime: 60, maxTime: 120, weight: 2.3, mood: 'competitive', estimatedValue: 44, condition: 'worn', categories: ['trading'] }),
    g({ title: '7 Wonders', minPlayers: 3, maxPlayers: 7, minTime: 30, maxTime: 40, weight: 2.3, mood: 'competitive', estimatedValue: 42, categories: ['drafting'] }),
    g({ title: 'Ticket to Ride', minPlayers: 2, maxPlayers: 5, minTime: 45, maxTime: 60, weight: 1.9, mood: 'competitive', estimatedValue: 40, categories: ['route-building'] }),
    g({ title: 'The Crew', minPlayers: 2, maxPlayers: 5, minTime: 15, maxTime: 30, weight: 2.0, mood: 'cooperative', estimatedValue: 15, categories: ['trick-taking'] }),
    g({ title: 'Brass: Birmingham', minPlayers: 2, maxPlayers: 4, minTime: 90, maxTime: 150, weight: 3.9, mood: 'strategy', estimatedValue: 75, condition: 'mint', categories: ['economic'] }),
    g({ title: 'Just One', minPlayers: 3, maxPlayers: 7, minTime: 15, maxTime: 20, weight: 1.1, mood: 'party', estimatedValue: 20, categories: ['word', 'co-op'] }),
  ];

  const players = ['You', 'Sam', 'Alex', 'Jordan'].map((name) => ({ id: nanoid(), name }));

  const byTitle = (t) => games.find((x) => x.title === t).id;
  const pid = (n) => players.find((p) => p.name === n).id;
  const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);

  const plays = [
    { id: nanoid(), gameId: byTitle('Azul'), date: daysAgo(3), minutes: 40, playerIds: [pid('You'), pid('Sam')], winnerIds: [pid('Sam')] },
    { id: nanoid(), gameId: byTitle('Wingspan'), date: daysAgo(9), minutes: 65, playerIds: [pid('You'), pid('Alex'), pid('Jordan')], winnerIds: [pid('You')] },
    { id: nanoid(), gameId: byTitle('Pandemic'), date: daysAgo(12), minutes: 55, playerIds: [pid('You'), pid('Sam'), pid('Alex')], winnerIds: [pid('You'), pid('Sam'), pid('Alex')], cooperativeWin: true },
    { id: nanoid(), gameId: byTitle('Azul'), date: daysAgo(20), minutes: 38, playerIds: [pid('You'), pid('Jordan')], winnerIds: [pid('You')] },
    { id: nanoid(), gameId: byTitle('Catan'), date: daysAgo(28), minutes: 95, playerIds: [pid('You'), pid('Sam'), pid('Alex'), pid('Jordan')], winnerIds: [pid('Alex')] },
    { id: nanoid(), gameId: byTitle('Codenames'), date: daysAgo(28), minutes: 25, playerIds: [pid('You'), pid('Sam'), pid('Alex'), pid('Jordan')], winnerIds: [pid('You'), pid('Alex')] },
  ];

  const loans = [
    { id: nanoid(), gameId: byTitle('Ticket to Ride'), borrower: 'Chris', lentAt: daysAgo(41), returnedAt: null, reminderDays: 30 },
  ];

  const wishlist = [
    { id: nanoid(), title: 'Ark Nova', priority: 'high', estimatedPrice: 90, notes: 'Wait for restock' },
    { id: nanoid(), title: 'Sky Team', priority: 'medium', estimatedPrice: 25, notes: '' },
  ];

  return { games, players, plays, loans, wishlist };
}
