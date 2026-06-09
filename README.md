<div align="center">

![Apparatus Banner](docs/assets/apparatus-banner.png)

![Node.js](https://img.shields.io/badge/Node.js-v23-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Multi-Protocol](https://img.shields.io/badge/Protocols-13%2B-orange)
![Open Source](https://img.shields.io/badge/License-MIT-black)

All-in-one cybersecurity testing and simulation lab platform for red teams, chaos engineering, defense validation, and security tool testing.

</div>

---

## What is Apparatus?

Apparatus is a **comprehensive security testing platform** that simulates real-world attacks, defense mechanisms, and infrastructure chaos in a controlled, sandboxed environment. It's designed for:

- 🎯 **Red Teams** - Autonomous AI-driven exploitation and payload testing
- 🛡️ **Blue Teams** - Defense validation, WAF testing, deception engineering
- ⚙️ **Chaos Engineers** - Resilience testing, fault injection, system recovery
- 🔬 **Security Researchers** - Protocol fuzzing, vulnerability simulation, attack pattern modeling
- 📚 **Training** - Security tool evaluation, incident response drills, threat intelligence

Think of it as **OWASP WebGoat meets Chaos Monkey meets a full-featured security lab**—all in one platform.

---

## Key Features

### 🎭 Deception & Honeypots
- **AI-Powered Honeypot** - Fake admin consoles, shell terminals, and databases with contextual AI responses
- **Ghost Traffic** - Generate synthetic legitimate-looking traffic to confuse attribution
- **Deception Events** - Real-time tracking and streaming of honeypot interactions
- **Multi-Layer Traps** - Fake `.env` files, `/etc/passwd`, SQLi detection honeypots

### 🔴 Red Team & Exploitation
- **AI Autopilot** - Autonomous red team agent that intelligently selects and executes tools
- **Payload Validator** - Test app resilience to XSS, SQLi, path traversal, command injection, NoSQL injection
- **Scenario Engine** - Template-based multi-step attack/defense sequences
- **SSRF/Proxy Testing** - Test for request-based vulnerabilities

### 🛡️ Defense & Mitigation
- **Active Shield (WAF)** - Pattern-based request blocking with rule management
- **Tarpit Defense** - Honeypot that traps attackers in slow-response connections
- **Moving Target Defense (MTD)** - Dynamic API hiding with rotating prefixes
- **Self-Healing QoS** - Autonomous load shedding and event loop monitoring
- **Rate Limiting** - Per-IP rate limit enforcement with 429 responses

### ⚙️ Chaos Engineering
- **CPU Spike** - Trigger high CPU utilization for resilience testing
- **Memory Spike** - Allocate memory to simulate OOM scenarios
- **Crash Scenarios** - Test graceful shutdown and recovery
- **Cluster Attacks** - Coordinate chaos across distributed nodes via UDP gossip

### 🌐 Network & Diagnostics
- **DNS Resolver** - Query A/AAAA/MX/TXT/SRV/NS/CNAME records
- **TCP Ping** - Connectivity testing to remote hosts
- **Bandwidth Generator** - 1B to 1GB data streaming for load testing
- **Packet Capture (PCAP)** - tcpdump-based traffic recording
- **HAR Replay** - Replay HTTP requests from archive files

### 🔐 Security Testing
- **Data Exfiltration Testing** - DLP generator with credit cards, SSNs, emails, fake SQL errors
- **Container Escape Testing** - Egress channel and escape vector validation
- **Cloud Credential Harvesting** - Simulated AWS/GCP/Azure metadata endpoints
- **Supply Chain Attacks** - Package manager poisoning simulation
- **Victim App** - Intentionally vulnerable application with XSS, SQLi, CSRF, auth bypass

### 📡 Multi-Protocol Support
- **HTTP/1.1** (port 8090)
- **HTTP/2 TLS** (port 8443)
- **HTTP/2 Cleartext (h2c)** (port 8091)
- **WebSocket** (/ws)
- **gRPC** (port 50051) with 4 RPC methods
- **Redis Mock** (port 6379) with full RESP protocol
- **MQTT** (port 1883)
- **SMTP** (port 2525)
- **Syslog** (ports 5140/5514)
- **ICAP** (port 1344)
- **TCP/UDP Echo** (ports 9000/9001)

### 📊 Real-Time Monitoring
- **Web Dashboard** - React-based UI with real-time SSE streaming
- **Terminal UI** - 18+ widget types for terminal-based monitoring
- **SSE Broadcasting** - Push events to all connected clients
- **Request History** - Store and inspect recent requests
- **Prometheus Metrics** - Request duration histograms and counters

### 🧠 Advanced Features
- **AI Chat API** - LLM-powered context-aware responses
- **Identity Testing** - OIDC/OAuth provider simulation, JWT debugging
- **GraphQL Endpoint** - Full GraphQL API with introspection attacks
- **JavaScript Execution** - Sandboxed VM for custom code testing
- **Echo Handler** - Reflect all request details for debugging
- **Webhook Sink** - Capture and inspect incoming webhooks

---

## Installation

### npm (recommended)

```bash
# Server
npm install -g @atlascrew/apparatus
apparatus
```

Starts the full Apparatus platform on **http://localhost:8090** — HTTP/1.1, HTTP/2, gRPC, WebSocket, dashboard, and all protocol servers in a single process.

### Docker

```bash
docker run -p 8090:8090 -p 8443:8443 -p 50051:50051 nickcrew/apparatus
```

Also available from GitHub Container Registry: `ghcr.io/nickcrew/apparatus`.

Open **http://localhost:8090/dashboard** to access the web UI.

### CLI

```bash
npm install -g @atlascrew/apparatus-cli
apparatus health
```

The CLI provides command-line access to all server APIs plus an interactive REPL.

**Connect to a running server:**

```bash
# Default: http://localhost:8090
apparatus health

# Override with flag or env var
apparatus -u http://myserver:8090 health
export APPARATUS_URL=http://myserver:8090
```

**Command categories:**

| Category | Examples |
|---|---|
| `core` | `health`, `echo /api/users`, `config` |
| `chaos` | `chaos cpu --duration 5000`, `chaos memory` |
| `security` | `security redteam`, `security scan` |
| `defense` | `defense shield`, `defense tarpit` |
| `identity` | `identity forge`, `identity verify` |
| `traffic` | `traffic history`, `traffic replay` |
| `scenarios` | `scenarios list`, `scenarios run` |
| `drills` | `drills start cpu`, `drills status` |
| `autopilot` | `autopilot start`, `autopilot status` |
| `webhooks` | `webhooks list`, `webhooks create` |
| `network` | `network dns`, `network proxy` |
| `labs` | `labs fuzzer`, `labs pcap` |
| `graphql` | `graphql query` |
| `simulator` | `simulator attack` |

**Interactive REPL:**

```bash
apparatus repl
# Supports tab completion, command history, and shortcuts
# e.g. h → health, cpu → chaos cpu, dns → network dns
```

**Global options:** `-u <url>`, `-j/--json`, `-v/--verbose`, `--no-color`, `--config <file>`

**Config file:** `~/.apparatus/config.json` — persists base URL, timeout, format preferences.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Bind address |
| `PORT_HTTP1` | `8090` | HTTP/1.1 port |
| `PORT_HTTP2` | `8443` | HTTP/2 TLS port |
| `DEMO_MODE` | `false` | Enable all dangerous endpoints without localhost check |
| `TLS_KEY` | `certs/server.key` | TLS private key path |
| `TLS_CRT` | `certs/server.crt` | TLS certificate path |
| `ANTHROPIC_API_KEY` | — | Claude API key (for AI honeypot and autopilot) |
| `ENABLE_COMPRESSION` | `true` | Enable gzip compression |
| `BODY_LIMIT` | `50mb` | Request body size limit |
| `CLUSTER_SHARED_SECRET` | — | Cluster authentication token |

---

## Integration with Chimera

Apparatus works seamlessly with **[Chimera](https://github.com/NickCrew/Chimera)** — a vulnerable web application and REST API with 450+ endpoints and 12 UIs that provides realistic attack targets for security testing.

```bash
# Clone both repositories
cd ~/Developer
git clone https://github.com/NickCrew/apparatus.git
git clone https://github.com/NickCrew/Chimera.git

# Start the full lab (Apparatus + Chimera)
cd apparatus
docker compose --profile chimera up
```

This starts:
- **Apparatus**: http://localhost:8090/dashboard (testing platform)
- **VulnWeb**: http://localhost:3000 (vulnerable web app) — `chimera` profile only
- **VulnAPI**: http://localhost:5000 (vulnerable API) — `chimera` profile only

Without the `chimera` profile, only Apparatus starts: `docker compose up`.

---

## Development

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 23+ |
| pnpm | latest |

Optional: `tcpdump` (for PCAP capture), Docker (for containerized deployment).

### Run from source

```bash
git clone https://github.com/NickCrew/apparatus.git
cd apparatus
pnpm install

# Generate TLS certificates (self-signed)
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -keyout certs/server.key \
  -out certs/server.crt -days 365 -nodes -subj "/CN=localhost"

pnpm build
pnpm start
```

The server will start on:
- **HTTP/1.1**: http://localhost:8090
- **Dashboard**: http://localhost:8090/dashboard
- **HTTP/2 TLS**: https://localhost:8443
- **gRPC**: localhost:50051
- **WebSocket**: ws://localhost:8090/ws

---

## Usage Examples

### 1. Test Your Web App with the Red Team AI

```bash
# CLI
apparatus autopilot start "Find auth bypass vulnerabilities" \
  --max-iterations 20 --interval 2000 \
  --tools chaos.cpu,cluster.attack,mtd.rotate
apparatus autopilot status
apparatus autopilot reports

# curl
curl -X POST http://localhost:8090/api/redteam/autopilot/start \
  -H "Content-Type: application/json" \
  -d '{
    "target": "http://myapp.local",
    "config": {
      "interval": 2000,
      "maxIterations": 20,
      "allowedTools": ["chaos.cpu", "cluster.attack", "mtd.rotate"]
    }
  }'
curl http://localhost:8090/api/redteam/autopilot/status
curl http://localhost:8090/api/redteam/autopilot/reports
```

### 2. Validate Payload Detection

```bash
# CLI
apparatus security redteam http://myapp --path /search --method GET

# curl
curl "http://localhost:8090/redteam/validate?target=http://myapp&path=/search&method=GET"
```

### 3. Run a Chaos Scenario

```bash
# CLI
apparatus chaos cpu --duration 5000         # 5s CPU spike
apparatus chaos memory --size 104857600     # 100MB allocation
apparatus scenarios list                    # List saved scenarios
apparatus scenarios run <scenario_id> --wait

# curl
curl -X POST http://localhost:8090/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "distributed-attack",
    "steps": [
      { "id": "1", "action": "chaos.cpu", "params": { "duration": 5000 } },
      { "id": "2", "action": "delay", "params": { "duration": 2000 } },
      { "id": "3", "action": "cluster.attack", "params": { "target": "http://127.0.0.1:8090/echo", "rate": 100 } }
    ]
  }'
curl -X POST http://localhost:8090/scenarios/{scenario_id}/run
curl http://localhost:8090/scenarios/{scenario_id}/status?executionId={execution_id}
```

### 4. Activate Defense Mechanisms

```bash
# CLI
apparatus defense sentinel add block-admin "/admin" --action block
apparatus defense tarpit list
apparatus defense mtd enable
apparatus defense mtd rotate
apparatus defense blackhole add 10.0.0.50 --reason "port scan"

# curl
curl -X POST http://localhost:8090/sentinel/rules \
  -H "Content-Type: application/json" \
  -d '{"pattern": "/admin", "action": "block"}'
curl -X POST http://localhost:8090/mtd -d '{"prefix": "xyz123"}'
# Now all APIs require xyz123 prefix: /xyz123/echo, /xyz123/healthz, etc.
```

### 5. Monitor Real-Time Traffic

```bash
# Web dashboard
open http://localhost:8090/dashboard

# Terminal UI
pnpm tui

# CLI
apparatus traffic status

# SSE stream
curl http://localhost:8090/sse
```

### 6. Capture and Replay Traffic

```bash
# curl
curl "http://localhost:8090/capture.pcap?duration=30&iface=eth0" -o traffic.pcap
curl -X POST http://localhost:8090/replay \
  -H "Content-Type: application/json" \
  -d @requests.har
```

---

## Architecture

### Monorepo Structure

```
apparatus/
├── apps/
│   ├── apparatus/              # Main server
│   │   ├── src/
│   │   │   ├── app.ts          # Express app with all routes
│   │   │   ├── chaos.ts        # CPU/memory/crash chaos handlers
│   │   │   ├── deception.ts    # AI honeypot engine
│   │   │   ├── tarpit.ts       # Tarpit defense
│   │   │   ├── sentinel.ts     # Active Shield (WAF)
│   │   │   ├── scenarios.ts    # Scenario engine
│   │   │   ├── ai/             # AI autopilot and chat
│   │   │   ├── server-*.ts     # Protocol servers (HTTP/2, gRPC, Redis, etc.)
│   │   │   └── dashboard/      # React dashboard (Vite)
│   │   ├── test/               # Integration tests (39+ tests)
│   │   └── dist/               # Compiled output
│   └── cli/                    # CLI application
└── libs/                       # Shared libraries
```

### Middleware Execution Order

1. **MTD** - Polymorphic route hiding
2. **Self-Healing** - Load shedding
3. **Deception** - Honeypot trap
4. **Tarpit** - Slow-down trap
5. **Metrics** - Collection
6. **Compression** - Response compression
7. **Logging** - Pino logger
8. **Body Parsing** - JSON/URL/raw/text
9. **Active Shield** - WAF
10. **CORS** - Cross-origin handling
11. **Routes** - Endpoint handlers
12. **Echo** - Catch-all reflection

---

## Configuration

See [Environment Variables](#environment-variables) in the Installation section for the full configuration reference.

### Feature Toggles

```bash
# Toggle demo mode (enables all features without localhost check)
curl -X POST http://localhost:8090/_sensor/demo/toggle

# View configuration
curl http://localhost:8090/_sensor/config/integrations

# Update integrations
curl -X PUT http://localhost:8090/_sensor/config/integrations \
  -H "Content-Type: application/json" \
  -d '{"tunnel_url": "https://ngrok.io/...", "tunnel_api_key": "..."}'
```

---

## Testing

### Run All Tests

```bash
pnpm test                       # Run all tests
pnpm test -- --reporter=verbose # Verbose output
pnpm test -- test/chaos.test.ts # Run specific test file
```

### Coverage

Tests cover:
- ✅ Scenario validation (unknown actions, SQL injection patterns, param sanitization)
- ✅ Chaos operations (CPU spike, memory allocation, concurrent spike detection)
- ✅ Webhook capture and trimming (50 webhook limit per hook ID)
- ✅ Attack scenario execution and failure tracking
- ✅ Multi-protocol echo and SSE broadcasting
- ✅ 38+ integration tests across all major features

---

## Use Cases

### 🎓 Security Training
- Simulate realistic attack scenarios for incident response drills
- Train teams on detection and mitigation techniques
- Safe environment for learning security concepts

### 🔒 Defense Validation
- Test WAF/IDS/IPS effectiveness against known attack patterns
- Validate SIEM detection rules
- Measure incident response time

### 🧪 Tool Testing
- Evaluate security scanning tools (Burp, OWASP ZAP, Nessus)
- Test SIEMs, DLP systems, log aggregation
- Benchmark performance under chaos conditions

### 🚀 Chaos Engineering
- Inject faults to test application resilience
- Validate auto-recovery mechanisms
- Measure system performance degradation

### 🔍 Security Research
- Model attack vectors and defense patterns
- Test novel security concepts
- Develop and validate exploitation techniques

### 🏢 Red Team Operations
- Run automated red team campaigns with AI autopilot
- Generate realistic attack scenarios
- Validate security controls comprehensively

---

## Technology Stack

| Component | Tech |
|-----------|------|
| **Runtime** | Node.js 23+ |
| **Language** | TypeScript (strict) |
| **Framework** | Express.js |
| **Protocols** | HTTP/1.1, HTTP/2, gRPC, WebSocket, Redis, MQTT, SMTP, Syslog, ICAP |
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Terminal UI** | Blessed + blessed-contrib |
| **Monitoring** | Prometheus metrics, Pino logging |
| **Testing** | Vitest + Supertest |
| **Build** | Nx monorepo, TypeScript compiler, Vite |
| **Package Manager** | pnpm |

---

## Security Notice

⚠️ **Apparatus is designed for testing and lab environments only.** It is NOT suitable for production use:

- All data is stored in-memory (no persistence)
- No authentication/authorization on most endpoints
- Deliberately vulnerable features (victim app, honeypots, chaos)
- No audit trails or compliance features
- Run only on isolated networks or localhost

Use Apparatus in:
- ✅ Development environments
- ✅ Lab networks
- ✅ Isolated test systems
- ✅ Docker containers
- ✅ VMs on your machine

Do NOT use in:
- ❌ Production systems
- ❌ Public-facing networks
- ❌ Shared infrastructure
- ❌ Systems with real data

---

## Contributing

Contributions are welcome! Areas for expansion:

- [ ] Additional protocol servers
- [ ] More chaos engineering scenarios
- [ ] Enhanced AI models for autopilot
- [ ] Persistence layer (PostgreSQL)
- [ ] Kubernetes operator
- [ ] Additional defense mechanisms
- [ ] CLI enhancements
- [ ] Dashboard visualizations

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License - See [LICENSE](LICENSE) for details

---

## Documentation

- **[Quick Reference](docs/quick-reference.md)** - Common commands, endpoints, and scenarios
- **[Features](docs/features.md)** - Complete catalog of 58+ features
- **[Architecture](docs/architecture.md)** - System design, data flow, and components
- **[API Reference](docs/api.md)** - Detailed endpoint documentation
- **[Related: Chimera](../Chimera)** - Vulnerable web app and API (450+ endpoints, 12 UIs)

---

## Support

- 📖 [Full Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/NickCrew/apparatus/issues)
- 💬 [Discussions](https://github.com/NickCrew/apparatus/discussions)
- 📧 Contact: nick@atlascrew.dev

---

## Acknowledgments

Apparatus builds on ideas from:
- OWASP WebGoat (intentional vulnerabilities)
- Chaos Monkey (fault injection)
- Gremlin (chaos engineering)
- Honeypots and deception research
- Red team methodology and tools

---

**Made with ❤️ for the security community**

## Project tracking

Development is tracked on the [Atlas Crew Security project board](https://github.com/orgs/atlas-crew/projects/8), shared across Synapse, Crucible, Chimera, Bridge, and Apparatus. Issues carry a **Type** (Feature / Bug / Task / Chore / Spike) and move through Backlog → Todo → In Progress → Blocked → Done. Execution order comes from issue dependencies (`blocked-by`), reconstructed into waves by [`gh-seq`](https://github.com/NickCrew/gh-seq):

```bash
gh extension install NickCrew/gh-seq
gh seq --project 8 --owner atlas-crew --order-by Priority
```

To contribute, pick an unblocked issue, comment to claim it, and open a PR.
