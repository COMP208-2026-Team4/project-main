# Git API

**Aim: Create a web-based version control system using Git.**

Frontend can:
- List individual commits for a selected repository and branch.
- Create, read, update, and delete files
- Make new commits in the browser.
- View all branches in a repository.
- Preview file content, then parse and render them as markdown (if appropriate).
- Preview diffs (changes) in each commit.
- Preview the repository, from a particular commit (checkout).
- Preview the repository, from a particular branch (checkout).

**Implement a REST API wrapper around the Git CLI.**

API can:
- Retrieve a list of all commits & diffs.
- Retrieve a list of all branches.
- Create a new commit, which creates a commit in the backend repository.
- Retrieve all diffs for a particular Git commit.
