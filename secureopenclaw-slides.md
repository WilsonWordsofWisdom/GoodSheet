# SecureOpenClaw — Presentation Slides

---

## Slide 1: Architecture & Subagents

### SecureOpenClaw: Security Guardrails for OpenClaw Multi-Agent Setups

**What it is**
A drop-in installer that injects security guardrails into any OpenClaw workspace — patching `AGENTS.md`, `SOUL.md`, and `HEARTBEAT.md` with hardened configurations without overwriting existing instructions.

---

### Architecture Overview

```
User (Wil Smith)
      │
      ▼
┌─────────────────────────────────────┐
│           Main Agent                │
│   (Orchestrator & Approval Authority│
│    — reads SOUL.md + AGENTS.md)     │
└──────────┬──────────────────────────┘
           │  All external I/O routed through
           ▼
┌─────────────────────────────────────┐
│         Firewall Agent              │
│  Zero-Trust ingress/egress filter   │
│  3-pass scan: Semantic · Structural │
│             · Context               │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌──────────┐  ┌─────────────────┐
│ Threat   │  │  Hardening      │
│ Intel    │  │  Agent          │
│ Agent    │  │  (Audits, skill │
│(Weekly   │  │  hardening,     │
│ threat   │  │  provisioning)  │
│ scans)   │  └─────────────────┘
└──────────┘
```

**Three specialised subagents**, each in its own sandboxed workspace under `~/.openclaw/workspace-<name>/`:

| Subagent | Role |
|---|---|
| **Firewall Agent** | Scans all inbound/outbound content via semantic, structural, and context analysis before anything executes |
| **Threat Intel Agent** | Runs weekly vulnerability assessments, gap analysis, and escalates threat reports to the Main Agent |
| **Hardening Agent** | Conducts security audits, refactors unsafe skill editions, provisions hardened replacements |

---

## Slide 2: Security Controls

### Five Layers of Defence

**1 — Workspace Isolation**
- Each agent is confined to its own `~/.openclaw/workspace[-name]/` directory
- Forbidden paths hard-blocked: `~/.ssh/`, `/etc/`, `~/.openclaw/credentials/`
- Recoverable deletion only — files moved to `~/.openclaw/trash/`, never hard-deleted
- Cross-workspace access: zero, even if an instruction *claims* to come from another agent

**2 — Zero-Trust External Content**
- All scraped web content treated as untrusted by default
- Firewall Agent runs a 3-pass scan (Semantic Intent · Structural · Context) before any content is used
- `SECURITY_INJECTION_ALERT` triggered on any detected masked/obfuscated goal
- Executable code found in scraped content: blocked unconditionally

**3 — Identity & Authorization**
- Authorized User ID allowlist enforced per channel
- High-impact actions (sudo, package installs, external posts) require explicit user confirmation before execution
- Agents never impersonate the user in group chats

**4 — Inter-Agent Trust Boundary**
- All inter-agent messages treated as untrusted input — verified before acting
- Communication only via official OpenClaw `sessions_send` / `sessions_spawn` mechanisms
- Boundary violations: refused immediately, logged with timestamp + agent ID, escalated via `SECURITY_RUNBOOK.md`
- Shared read-only resources: `SECURITY_GUARDRAILS.md`, `SECURITY_OVERVIEW.md`, `logs/AUDIT_SCHEMA.md`

**5 — Audit, Monitoring & Incident Response**
- All high-risk actions logged to `logs/security_audit.log` with schema-linked approval references
- Weekly memory-integrity scrub: scans for anomalies, persona drift, and prompt-injection attempts
- Incident response: structured runbook (`SECURITY_RUNBOOK.md`) — no improvisation; escalation path ends at the Main Agent
- Read-Only mode available as a containment measure during active incidents

---

### Installation in 4 Steps

```bash
# 1. Clone and run installer across all agent workspaces
git clone https://github.com/WilsonWordsofWisdom/SecureOpenClaw
python3 install.py --all-agents

# 2. Review the diffs — confirm no original instructions were overwritten
#    (injected sections are wrapped in <!-- [GUARDRAILS INSTALL] --> markers)

# 3. Remove the installer folder

# 4. Validate via an OpenClaw bot conversation
```

> **Additive by design** — the installer merges new sections into existing workspace files.
> Nothing is silently replaced. Every change is visible, diffable, and reversible.
