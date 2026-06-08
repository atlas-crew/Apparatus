# Apparatus

Cybersecurity testing and simulation lab platform with 58+ features spanning deception, chaos engineering, red team automation, and multi-protocol support.

Part of the [Inferno Lab](https://atlascrew.dev/inferno) security testing suite.

## Quick Start

```bash
docker run -p 8090:8090 -p 8443:8443 nickcrew/apparatus
```

- Dashboard: [localhost:8090/dashboard](http://localhost:8090/dashboard)
- HTTP/1.1 API: [localhost:8090](http://localhost:8090)
- HTTP/2 TLS: `localhost:8443`

## Exposed Ports

| Port       | Protocol               |
| ---------- | ---------------------- |
| `8090`     | HTTP/1.1 + WebSocket   |
| `8443`     | HTTP/2 TLS             |
| `8091`     | HTTP/2 cleartext (h2c) |
| `50051`    | gRPC                   |
| `9000`     | TCP echo               |
| `9001`     | UDP echo               |
| `6379`     | Redis mock             |
| `1883`     | MQTT                   |
| `2525`     | SMTP                   |
| `5514`     | Syslog                 |
| `1344`     | ICAP                   |
| `7946/udp` | Cluster gossip         |

## Configuration

| Variable                | Default            | Description                                  |
| ----------------------- | ------------------ | -------------------------------------------- |
| `HOST`                  | `127.0.0.1`        | Bind address                                 |
| `PORT_HTTP1`            | `8090`             | HTTP/1.1 port                                |
| `PORT_HTTP2`            | `8443`             | HTTP/2 TLS port                              |
| `DEMO_MODE`             | `false`            | Enable all endpoints without localhost check |
| `TLS_KEY`               | `certs/server.key` | TLS private key path                         |
| `TLS_CRT`               | `certs/server.crt` | TLS certificate path                         |
| `ANTHROPIC_API_KEY`     | —                  | Claude API key for AI autopilot features     |
| `CLUSTER_SHARED_SECRET` | —                  | Shared secret for cluster authentication     |

### Enable demo mode

```bash
docker run -p 8090:8090 -e DEMO_MODE=true nickcrew/apparatus
```

### Expose all protocols

```bash
docker run \
  -p 8090:8090 -p 8443:8443 -p 50051:50051 \
  -p 9000:9000 -p 9001:9001/udp \
  -p 6379:6379 -p 1883:1883 -p 2525:2525 \
  -e DEMO_MODE=true \
  nickcrew/apparatus
```

## Using with Chimera

[Chimera](https://hub.docker.com/r/nickcrew/chimera) provides a realistic vulnerable target for Apparatus to test against. Chimera has a built-in Apparatus integration that enables ghost traffic generation and coordinated simulations.

```bash
docker run -d --name apparatus -p 8090:8090 -e DEMO_MODE=true nickcrew/apparatus
docker run -d --name chimera -p 8880:8880 \
  -e DEMO_MODE=full \
  -e APPARATUS_ENABLED=true \
  -e APPARATUS_BASE_URL=http://host.docker.internal:8090 \
  nickcrew/chimera
```

## Full Security Lab (Compose)

Run all three Inferno Lab products — Apparatus for simulation, Chimera as the vulnerable target, and Crucible for assessment scoring:

```yaml
services:
  apparatus:
    image: nickcrew/apparatus
    ports:
      - "8090:8090"
      - "8443:8443"
    environment:
      DEMO_MODE: "true"
    networks:
      - lab

  chimera:
    image: nickcrew/chimera
    ports:
      - "8880:8880"
    environment:
      DEMO_MODE: "full"
      APPARATUS_ENABLED: "true"
      APPARATUS_BASE_URL: http://apparatus:8090
    networks:
      - lab

  crucible:
    image: nickcrew/crucible
    ports:
      - "3000:3000"
    environment:
      CRUCIBLE_TARGET_URL: http://chimera:8880
    volumes:
      - crucible-data:/app/data
    networks:
      - lab

networks:
  lab:

volumes:
  crucible-data:
```

```bash
docker compose up -d
```

| Service             | URL                                                         |
| ------------------- | ----------------------------------------------------------- |
| Apparatus Dashboard | [localhost:8090/dashboard](http://localhost:8090/dashboard) |
| Chimera Portal      | [localhost:8880](http://localhost:8880)                     |
| Chimera Swagger     | [localhost:8880/swagger](http://localhost:8880/swagger)     |
| Crucible UI         | [localhost:3000](http://localhost:3000)                     |

## CLI

A dedicated CLI is available for scripting and automation:

```bash
npm install -g @atlascrew/apparatus-cli
apparatus health
apparatus chaos cpu --duration 5000
apparatus autopilot start "Find vulnerabilities"
```

## Links

- [Documentation](https://apparatus.atlascrew.dev)
- [GitHub](https://github.com/atlas-crew/Apparatus)
- [npm](https://www.npmjs.com/package/@atlascrew/apparatus)
