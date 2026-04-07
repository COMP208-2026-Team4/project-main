import { createSlice, createSelector } from '@reduxjs/toolkit';
import { actions as api } from './api';
import { notInArray } from './utils/filter';
import { getHeaders } from './utils/rest-headers';

const slice = createSlice({
  name: 'users',
  initialState: [] as Store.AppState['entities']['users'],
  reducers: {
    // fetch all users from API
    fetched: (users, { payload }: Store.Action<Entity.User[]>) => {
      users.push(...payload.filter(notInArray(users)));
    }
  },
});

export const actions = slice.actions;
export default slice.reducer;

/**
 * Send API request to update the current user (update their profile).
 */
export const updateSelf = (payload: Partial<Entity.User>) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: '/user',
    method: 'patch',
    data: { ...payload, ...getHeaders() },
  }));
}

/**
 * Send API request to delete an account.
 */
export const deleteSelf = () => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: '/user',
    method: 'delete',
    data: { ...getHeaders() },
  }));
}

/**
 * Send API request to upload an avatar.
 */
export const uploadUserAvatar = (file: File) => (dispatch: any) => {
  const uploadCallback = async ({ url }: any) =>
    dispatch(updateSelf({ avatarURL: url }));
  dispatch(uploadFile(file, uploadCallback));
}

/**
 * Upload a file associated with a user.
 */ 
export const uploadFile = (file: File, callback?: (args: any) => any) => (dispatch: any) => {
  const formData = new FormData();
  formData.append('file', file);

  dispatch(api.restCallBegan({
    method: 'post',
    url: '/users/upload',
    data: formData,
    headers: {
      ...getHeaders(),
      'Content-Type': 'multipart/form-data',
    },
    callback,
  }));
}

/**
 * Get a user from the store, by their ID.
 */
export const getUser = (id: string) => createSelector(
  (state: Store.AppState) => state.entities.users,
  users => users.find(u => u.id === id) ?? {
    avatarURL: '/avatars/unknown.png',
    username: 'Unknown',
  } as unknown as Entity.User,
);