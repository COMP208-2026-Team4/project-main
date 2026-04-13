/**
 * Entities are objects retrieved from the API.
 */
namespace Entity {
  class User {
    id: String;
    username: String;
    email?: String;
    avatarURL?: String;
  }

  class Session {
    id: String;
    quality: Number;
    duration: Number;
    createdAt: String;
  }

  class Repository {
    id: string;
    name: string;
    owner: string;
    createdAt: string;
    visibility: string;
    description: string;
    starCount: number;
    updatedAt: string;
  }

  class Branch {
    name: string;
  }

  class Commit {
    sha: string;
    authorName: string;
    authorEmail: string;
    timestamp: number;
    message: string;
  }

  class TreeEntry {
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    size: number | null;
    name: string;
  }

  class Blob {
    ref: string;
    path: string;
    content: string;
    isBinary: boolean;
    size: number;
  }

  class CommitDiff {
    sha: string;
    authorName: string;
    authorEmail: string;
    timestamp: number;
    message: string;
    stats: { filesChanged: number; insertions: number; deletions: number };
    diff: string;
  }

  class RepoMeta {
    visibility: string;
    description: string;
    starCount: number;
    starredByMe: boolean;
    collaborators: string[];
    createdAt: string;
    updatedAt: string;
  }

  class SearchResult {
    type: 'user' | 'repo' | 'commit';
    // user fields
    id?: string;
    username?: string;
    avatarUrl?: string;
    // repo fields
    owner?: string;
    name?: string;
    description?: string;
    visibility?: string;
    starCount?: number;
    // commit fields
    repo?: string;
    sha?: string;
    author?: string;
    message?: string;
  }

  class CommitPreview {
    sha: string;
    authorName: string;
    authorEmail: string;
    timestamp: number;
    message: string;
    branches: string[];
    diffStat: string;
    diff: string;
    tree: TreeEntry[];
  }
}
