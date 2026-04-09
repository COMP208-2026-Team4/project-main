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

  interface GitState {
    branches: Entity.Branch[];
    commits: Entity.Commit[];
    tree: Entity.TreeEntry[];
    treeRef: string;
    treePath: string;
    blob: Entity.Blob | null;
    diff: Entity.CommitDiff | null;
    loading: boolean;
    error: string | null;
  }

  export interface AppState {
    auth: {
      user: AuthUser | null;
      loading: boolean;
    };
    entities: {
      users: Entity.User[];
      sessions: Entity.Session[];
      git: GitState;
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
