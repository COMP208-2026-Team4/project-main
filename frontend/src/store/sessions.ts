import { createSlice, createSelector } from '@reduxjs/toolkit';
import { actions as api } from './api';
import { notInArray } from './utils/filter';
import { getHeaders, token } from './utils/rest-headers';

const slice = createSlice({
  name: 'sessions',
  initialState: [] as Store.AppState['entities']['sessions'],
  reducers: {
    // fetch all users from API
    fetched: (sessions, { payload }: Store.Action<Entity.Session[]>) => {
      sessions.push(...payload.filter(notInArray(sessions)));
    }
  },
});

export const actions = slice.actions;
export default slice.reducer;

export const deleteSession = (id: String) => {
  // DELETE -> /sessions
};