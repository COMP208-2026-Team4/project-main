/**
 * The store is the central state management system for the application.
 * - All data fetched from the API is cached here (users, repositories, etc.)
 */
declare namespace Store {
  interface AuthUser {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
  }

  export interface AppState {
    auth: {
      user: AuthUser | null;
      loading: boolean;
    };
    entities: {
      users: Entity.User[];
      sessions: Entity.Session[];
    };
  }

  /**
   * Actions are objects that describe a change to the store.
   */
  export interface Action<P> {
    type: string;
    payload: P;
  }
}
