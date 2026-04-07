// from https://github.com/theADAMJR/acrd.app/blob/dev/frontend/src/store/middleware/rest.ts

import axios from 'axios';
import { actions, APIArgs } from '../api';

export default (store: any) => (next: any) => async (action: any) => {
  if (action.type !== actions.restCallBegan.type)
    return next(action);

  const { url, method, data, onSuccess, headers, callback, errorCallback } = action.payload as APIArgs;

  next(action);

  try {
    const { data: payload } = await axios.request({
      baseURL: import.meta.env.VITE_API_URL,
      data,
      method,
      url,
      headers,
    });

    store.dispatch(actions.restCallSucceded({ url, response: payload }));
    if (onSuccess)
      for (const type of onSuccess)
        store.dispatch({ type, payload });

    if (callback) await callback(payload);
  } catch (error) {
    const response = (error as any).response;
    store.dispatch(actions.restCallFailed({ url, response }));

    if (errorCallback) await errorCallback(response);
  }
};