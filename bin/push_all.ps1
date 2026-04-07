$repos = ".", "docs", "frontend", "git-agent", "rest-api", "sessions-api", "users-api"

$rootDir = Get-Location

foreach ($repo in $repos) {
    Write-Host "Pushing $repo..."
    Push-Location (Join-Path $rootDir $repo)
    git add .
    git commit -m "update" 2>$null
    git push
    Pop-Location
}
