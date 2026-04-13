import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { actions as api } from './api';
import { getHeaders } from './utils/rest-headers';

const initialState: Store.GitState = {
  branches: [],
  commits: [],
  tree: [],
  treeRef: '',
  treePath: '',
  blob: null,
  diff: null,
  loading: false,
  error: null,
  meta: null,
  commitPreview: null,
};

const slice = createSlice({
  name: 'git',
  initialState,
  reducers: {
    branchesFetched: (state, { payload }: PayloadAction<Entity.Branch[]>) => {
      state.branches = payload;
    },
    commitsFetched: (state, { payload }: PayloadAction<{ commits: Entity.Commit[]; append: boolean }>) => {
      state.commits = payload.append ? [...state.commits, ...payload.commits] : payload.commits;
    },
    commitsCleared: (state) => {
      state.commits = [];
    },
    treeFetched: (state, { payload }: PayloadAction<{ ref: string; path: string; entries: Entity.TreeEntry[] }>) => {
      state.tree = payload.entries;
      state.treeRef = payload.ref;
      state.treePath = payload.path;
    },
    blobFetched: (state, { payload }: PayloadAction<Entity.Blob | null>) => {
      state.blob = payload;
    },
    diffFetched: (state, { payload }: PayloadAction<Entity.CommitDiff | null>) => {
      state.diff = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setError: (state, { payload }: PayloadAction<string | null>) => {
      state.error = payload;
    },
    metaFetched: (state, { payload }: PayloadAction<Entity.RepoMeta | null>) => {
      state.meta = payload;
    },
    commitPreviewFetched: (state, { payload }: PayloadAction<Entity.CommitPreview | null>) => {
      state.commitPreview = payload;
    },
  },
});

export const actions = slice.actions;
export default slice.reducer;

const camelCommit = (c: any): Entity.Commit => ({
  sha: c.sha,
  authorName: c.author_name,
  authorEmail: c.author_email,
  timestamp: c.timestamp,
  message: c.message,
});

const camelDiff = (d: any): Entity.CommitDiff => ({
  sha: d.sha,
  authorName: d.author_name,
  authorEmail: d.author_email,
  timestamp: d.timestamp,
  message: d.message,
  stats: {
    filesChanged: d.stats?.files_changed ?? 0,
    insertions: d.stats?.insertions ?? 0,
    deletions: d.stats?.deletions ?? 0,
  },
  diff: d.diff,
});

const camelBlob = (b: any): Entity.Blob => ({
  ref: b.ref,
  path: b.path,
  content: b.content,
  isBinary: b.is_binary,
  size: b.size,
});

export const fetchBranches = (owner: string, repo: string) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/branches`,
    method: 'get',
    headers: getHeaders(),
    callback: (data: any) =>
      dispatch(actions.branchesFetched((data?.branches ?? []).map((name: string) => ({ name })))),
    errorCallback: (resp: any) =>
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to fetch branches')),
  }));
};

export const fetchCommits = (
  owner: string,
  repo: string,
  branch: string,
  page: number = 1,
) => (dispatch: any) => {
  dispatch(actions.setLoading(true));
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/commits?branch=${encodeURIComponent(branch)}&page=${page}`,
    method: 'get',
    headers: getHeaders(),
    callback: (data: any) => {
      dispatch(actions.commitsFetched({
        commits: (data?.commits ?? []).map(camelCommit),
        append: page > 1,
      }));
      dispatch(actions.setLoading(false));
    },
    errorCallback: (resp: any) => {
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to fetch commits'));
      dispatch(actions.setLoading(false));
    },
  }));
};

export const fetchTree = (
  owner: string,
  repo: string,
  ref: string,
  path: string,
) => (dispatch: any) => {
  dispatch(actions.setLoading(true));
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/tree?ref=${encodeURIComponent(ref)}&path=${encodeURIComponent(path)}`,
    method: 'get',
    headers: getHeaders(),
    callback: (data: any) => {
      dispatch(actions.treeFetched({
        ref: data?.ref ?? ref,
        path: data?.path ?? path,
        entries: data?.entries ?? [],
      }));
      dispatch(actions.setLoading(false));
    },
    errorCallback: (resp: any) => {
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to fetch tree'));
      dispatch(actions.setLoading(false));
    },
  }));
};

export const fetchBlob = (
  owner: string,
  repo: string,
  ref: string,
  path: string,
) => (dispatch: any) => {
  dispatch(actions.setLoading(true));
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/blob?ref=${encodeURIComponent(ref)}&path=${encodeURIComponent(path)}`,
    method: 'get',
    headers: getHeaders(),
    callback: (data: any) => {
      dispatch(actions.blobFetched(camelBlob(data)));
      dispatch(actions.setLoading(false));
    },
    errorCallback: (resp: any) => {
      dispatch(actions.blobFetched(null));
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to fetch file'));
      dispatch(actions.setLoading(false));
    },
  }));
};

export const fetchDiff = (owner: string, repo: string, sha: string) => (dispatch: any) => {
  dispatch(actions.setLoading(true));
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/commits/${sha}/diff`,
    method: 'get',
    headers: getHeaders(),
    callback: (data: any) => {
      dispatch(actions.diffFetched(camelDiff(data)));
      dispatch(actions.setLoading(false));
    },
    errorCallback: (resp: any) => {
      dispatch(actions.diffFetched(null));
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to fetch diff'));
      dispatch(actions.setLoading(false));
    },
  }));
};

export interface WriteBlobPayload {
  path: string;
  content: string;
  message: string;
  branch: string;
  author_name: string;
  author_email: string;
}

export interface DeleteBlobPayload {
  path: string;
  message: string;
  branch: string;
  author_name: string;
  author_email: string;
}

export const createBlob = (
  owner: string,
  repo: string,
  payload: WriteBlobPayload,
  callback?: (resp: any) => void,
  errorCallback?: (resp: any) => void,
) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/blob`,
    method: 'post',
    headers: getHeaders(),
    data: payload,
    callback,
    errorCallback,
  }));
};

export const updateBlob = (
  owner: string,
  repo: string,
  payload: WriteBlobPayload,
  callback?: (resp: any) => void,
  errorCallback?: (resp: any) => void,
) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/blob`,
    method: 'put',
    headers: getHeaders(),
    data: payload,
    callback,
    errorCallback,
  }));
};

export const fetchMeta = (owner: string, repo: string) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/meta`,
    method: 'get',
    headers: getHeaders(),
    callback: (data: any) => {
      dispatch(actions.metaFetched({
        visibility: data?.visibility ?? 'public',
        description: data?.description ?? '',
        starCount: data?.star_count ?? 0,
        starredByMe: data?.starred_by_me ?? false,
        collaborators: data?.collaborators ?? [],
        createdAt: data?.created_at ?? '',
        updatedAt: data?.updated_at ?? '',
      }));
    },
    errorCallback: () => dispatch(actions.metaFetched(null)),
  }));
};

export const updateSettings = (
  owner: string,
  repo: string,
  settings: { visibility?: string; description?: string },
  callback?: () => void,
) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/settings`,
    method: 'put',
    headers: getHeaders(),
    data: settings,
    callback: () => {
      dispatch(fetchMeta(owner, repo));
      if (callback) callback();
    },
    errorCallback: (resp: any) =>
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to update settings')),
  }));
};

export const starRepo = (owner: string, repo: string) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/star`,
    method: 'post',
    headers: getHeaders(),
    callback: () => dispatch(fetchMeta(owner, repo)),
    errorCallback: (resp: any) =>
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to star')),
  }));
};

export const unstarRepo = (owner: string, repo: string) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/star`,
    method: 'delete',
    headers: getHeaders(),
    callback: () => dispatch(fetchMeta(owner, repo)),
    errorCallback: (resp: any) =>
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to unstar')),
  }));
};

export const addCollaborator = (
  owner: string,
  repo: string,
  userId: string,
  callback?: () => void,
  errorCallback?: (resp: any) => void,
) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/collaborators`,
    method: 'post',
    headers: getHeaders(),
    data: { user_id: userId },
    callback: () => {
      dispatch(fetchMeta(owner, repo));
      if (callback) callback();
    },
    errorCallback,
  }));
};

export const removeCollaborator = (
  owner: string,
  repo: string,
  userId: string,
  callback?: () => void,
) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/collaborators/${userId}`,
    method: 'delete',
    headers: getHeaders(),
    callback: () => {
      dispatch(fetchMeta(owner, repo));
      if (callback) callback();
    },
    errorCallback: (resp: any) =>
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to remove collaborator')),
  }));
};

export const fetchCommitPreview = (
  owner: string,
  repo: string,
  sha: string,
) => (dispatch: any) => {
  dispatch(actions.setLoading(true));
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/commits/${sha}/preview`,
    method: 'get',
    headers: getHeaders(),
    callback: (data: any) => {
      dispatch(actions.commitPreviewFetched({
        sha: data?.sha ?? sha,
        authorName: data?.author_name ?? '',
        authorEmail: data?.author_email ?? '',
        timestamp: data?.timestamp ?? 0,
        message: data?.message ?? '',
        branches: data?.branches ?? [],
        diffStat: data?.diff_stat ?? '',
        diff: data?.diff ?? '',
        tree: data?.tree ?? [],
      }));
      dispatch(actions.setLoading(false));
    },
    errorCallback: (resp: any) => {
      dispatch(actions.commitPreviewFetched(null));
      dispatch(actions.setError(resp?.data?.error ?? 'Failed to fetch commit preview'));
      dispatch(actions.setLoading(false));
    },
  }));
};

export const deleteBlob = (
  owner: string,
  repo: string,
  payload: DeleteBlobPayload,
  callback?: (resp: any) => void,
  errorCallback?: (resp: any) => void,
) => (dispatch: any) => {
  dispatch(api.restCallBegan({
    url: `/repositories/${owner}/${repo}/blob`,
    method: 'delete',
    headers: getHeaders(),
    data: payload,
    callback,
    errorCallback,
  }));
};
