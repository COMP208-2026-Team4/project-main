$repos = ".", "docs", "frontend", "git-agent", "sessions-api", "users-api"

foreach ($repo in $repos) {
    Write-Host "Pushing $repo..."
    cd $repo
    git add .
    git commit -m "update" 2>$null
    git push
    cd ..
}