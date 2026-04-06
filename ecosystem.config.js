module.exports = {
    apps: [
        {
            name: "git-agent",
            cwd: "./git-agent",
            script: "cmd",
            args: "/c cargo run",
            autorestart: false
        },
        {
            name: "users-api",
            cwd: "./users-api",
            script: "cmd",
            args: "/c npm run dev",
            autorestart: false
        },
        {
            name: "sessions-api",
            cwd: "./sessions-api",
            script: "cmd",
            args: "/c npm run dev",
            autorestart: false
        },
        {
            name: "rest-api",
            cwd: "./rest-api",
            script: "cmd",
            args: "/c npm run dev",
            autorestart: false
        },
        {
            name: "frontend",
            cwd: "./frontend",
            script: "cmd",
            args: "/c vite",
            autorestart: false
        },
        {
            name: "docs",
            cwd: "./docs",
            script: "cmd",
            args: "/c npm run dev",
            autorestart: false
        }
    ]
};