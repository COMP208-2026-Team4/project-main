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
}