import { createEntityFeature } from '../createEntityFeature';

const priorityRank = { high: 0, medium: 1, low: 2 };

const feature = createEntityFeature('wishlist', {
  sortComparer: (a, b) =>
    (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3) ||
    a.title.localeCompare(b.title),
  prepare: (input) => ({ priority: 'medium', estimatedPrice: 0, notes: '', ...input }),
});

export const {
  fetchAll: fetchWishlist,
  addItem: addWish,
  editItem: editWish,
  removeItem: removeWish,
} = feature.actions;
export const wishlistSelectors = feature.selectors;
export default feature.reducer;
