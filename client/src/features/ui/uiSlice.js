import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  picker: {
    players: 4,
    minutes: 45,
    mood: 'any', // 'any' | 'strategy' | 'competitive' | 'cooperative' | 'party'
    maxWeight: 5,
  },
  collectionFilters: {
    query: '',
    players: 0, // 0 = ignore
    maxMinutes: 0,
    maxWeight: 0,
    mood: 'any',
  },
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    pickerChanged: (state, action) => {
      state.picker = { ...state.picker, ...action.payload };
    },
    collectionFiltersChanged: (state, action) => {
      state.collectionFilters = { ...state.collectionFilters, ...action.payload };
    },
    collectionFiltersReset: (state) => {
      state.collectionFilters = initialState.collectionFilters;
    },
  },
});

export const { pickerChanged, collectionFiltersChanged, collectionFiltersReset } = slice.actions;
export default slice.reducer;
