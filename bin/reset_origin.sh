#!/bin/bash
set -e

git fetch
git reset --hard origin/main

echo ""
echo "Done resetting repository."
