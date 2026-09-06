import { createEntityFeature } from '../createEntityFeature';

const feature = createEntityFeature('loans', {
  sortComparer: (a, b) => b.lentAt.localeCompare(a.lentAt),
  prepare: (input) => ({
    lentAt: new Date().toISOString().slice(0, 10),
    returnedAt: null,
    reminderDays: 30,
    notes: '',
    ...input,
  }),
});

export const {
  fetchAll: fetchLoans,
  addItem: createLoan,
  editItem: editLoan,
  removeItem: removeLoan,
} = feature.actions;
export const lendingSelectors = feature.selectors;
export default feature.reducer;
