import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import api from './middleware/rest';
import users from './users';
import sessions from './sessions';
import git from './git';
import search from './search';
import auth from './auth';

export default () => configureStore<Store.AppState>({
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({ serializableCheck: false }),
    api,
  ] as any,
  reducer: combineReducers({
    auth,
    entities: combineReducers({
      users,
      sessions,
      git,
      search,
    })
  }),
});
