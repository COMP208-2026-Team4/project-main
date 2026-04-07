#!/bin/bash

repos=". docs frontend git-agent rest-api sessions-api users-api"

for r in $repos; do
    echo "========================="
    echo "Resetting $r..."
    echo "========================="

    pushd "$r" > /dev/null

    git fetch
    git reset --hard origin/main

    popd > /dev/null
done

echo ""
echo "Done resetting all repositories."
read -p "Press Enter to continue..."
