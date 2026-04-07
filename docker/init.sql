-- Initialise both databases on first container start.
-- MariaDB runs scripts in /docker-entrypoint-initdb.d/ only when the
-- data directory is empty (i.e. first-ever launch).

CREATE DATABASE IF NOT EXISTS `users`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `sessions`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
