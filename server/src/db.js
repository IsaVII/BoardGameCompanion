import { JSONFilePreset } from 'lowdb/node';

const DEFAULT = {
  collection: { ids: [], entities: {} },
  plays: { ids: [], entities: {} },
  lending: { ids: [], entities: {} },
  wishlist: { ids: [], entities: {} },
  players: { ids: [], entities: {} },
  updatedAt: 0,
};

export const db = await JSONFilePreset('shelf.db.json', DEFAULT);
