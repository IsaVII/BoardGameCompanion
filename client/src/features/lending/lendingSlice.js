import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
import { seed } from '../../data/initialState';

const adapter = createEntityAdapter({
  sortComparer: (a, b) => b.lentAt.localeCompare(a.lentAt),
});

const slice = createSlice({
  name: 'lending',
  initialState: adapter.getInitialState(undefined, seed.loans),
  reducers: {
    loanCreated: {
      reducer: adapter.addOne,
      prepare: (loan) => ({
        payload: {
          id: nanoid(),
          lentAt: new Date().toISOString().slice(0, 10),
          returnedAt: null,
          reminderDays: 30,
          notes: '',
          ...loan,
        },
      }),
    },
    loanReturned: (state, action) => {
      adapter.updateOne(state, {
        id: action.payload,
        changes: { returnedAt: new Date().toISOString().slice(0, 10) },
      });
    },
    loanUpdated: adapter.updateOne,
    loanRemoved: adapter.removeOne,
  },
});

export const { loanCreated, loanReturned, loanUpdated, loanRemoved } = slice.actions;
export const lendingSelectors = adapter.getSelectors((s) => s.lending);
export default slice.reducer;
