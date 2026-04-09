FROM caddy:2-alpine

WORKDIR /etc/caddy

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 3001

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
