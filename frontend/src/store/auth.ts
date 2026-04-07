import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { actions as api } from './api';
import { getHeaders } from './utils/rest-headers';

interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  /** True while fetching /users/me on app boot */
  loading: boolean;
}

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: !!localStorage.getItem('token') } as AuthState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { loginSuccess, logout, setLoading } = slice.actions;
export default slice.reducer;

/** Fetch the authenticated user from the API and store in Redux. */
export const fetchMe = (callback?: () => void) => (dispatch: any) => {
  dispatch(setLoading(true));
  dispatch(
    api.restCallBegan({
      url: '/users/me',
      method: 'get',
      headers: getHeaders(),
      onSuccess: [loginSuccess.type],
      callback,
      errorCallback: () => dispatch(setLoading(false)),
    })
  );
};

/** Selector: authenticated user */
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
