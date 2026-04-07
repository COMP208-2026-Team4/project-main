// from https://github.com/theADAMJR/acrd.app/blob/dev/frontend/src/store/api.ts

import { createAction } from '@reduxjs/toolkit';

export const actions = {
  restCallBegan: createAction<APIArgs>('api/restCallBegan'),
  restCallSucceded: createAction<{}>('api/restCallSucceeded'),
  restCallFailed: createAction<{}>('api/restCallFailed'),
};

export interface APIArgs {
  data?: object;
  headers?: object;
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  onSuccess?: string[];
  url: string;
  /** Callback to handle side effects. */
  callback?: (payload: any) => any | Promise<any>;
  errorCallback?: (payload: any) => any | Promise<any>;
}