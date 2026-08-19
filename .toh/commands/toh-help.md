---
command: /toh-help
aliases: ["/toh-h", "/toh-?"]
description: Display all Toh Framework commands and quick usage guide
---

# Toh Framework - Help

When user calls `/toh-help`, display the following:

<help_response>
## 🎯 Toh Framework v2.1.0

**"Type anything, AI does it for you"** - AI-Orchestration Driven Development

---

### ✨ Smart Single Command

```
/toh [type anything]
```

**No need to memorize commands** - AI analyzes → picks Agent → executes!

**Examples:**
```
/toh scroll overflow                  → Fix Agent
/toh make it prettier                 → Design Agent
/toh add login page                   → UI + Dev Agent
/toh connect Supabase                 → Connect Agent
/toh create coffee shop chatbot       → Plan → Vibe Agent
```

---

### 🚀 Quick Commands (Power User)

| Command | Shortcut | Description |
|---------|----------|-------------|
| `/toh` | - | 🧠 **Smart Command** - Type anything, AI picks the right Agent |
| `/toh-plan` | `/toh-p` | 📋 **Plan** - เขียน `.toh/plan.md` อนุมัติครั้งเดียว สร้างจนจบเอง |
| `/toh-vibe` | `/toh-v` | 🎨 **Create Project** - UI + Logic + Mock Data in one command |
| `/toh-ui` | `/toh-u` | 🖼️ **Create UI** - Pages, Components, Layouts |
| `/toh-dev` | `/toh-d` | ⚙️ **Add Logic** - TypeScript, Zustand, Forms |
| `/toh-design` | `/toh-ds` | ✨ **Polish Design** - Make it beautiful, not AI-looking |
| `/toh-test` | `/toh-t` | 🧪 **Test** - Auto test & fix |
| `/toh-connect` | `/toh-c` | 🔌 **Connect Backend** - Supabase, Auth, RLS |
| `/toh-line` | `/toh-l` | 💚 **LINE MINI App** (convert) |
| `/toh-mobile` | `/toh-m` | 📱 **Mobile App** - PWA / Capacitor |
| `/toh-fix` | `/toh-f` | 🔧 **Fix Bug** - Evidence-first debug: prove the root cause before touching code |
| `/toh-ship` | `/toh-s` | 🚀 **Deploy** - Vercel, Production ready |
| `/toh-protect` | `/toh-pt` | 🔐 **Security Audit** - Full security check |
| `/toh-help` | `/toh-h` | 📖 **Help** - Show every command, agent, and skill |

---

### 💡 Usage Examples

**Easiest - use /toh:**
```
/toh create expense tracker
/toh add expense chart
/toh bug - button not working
/toh connect database
```

**Power User - use specific commands:**
```
/toh-vibe coffee shop management system
/toh-plan read PRD and build according to spec
/toh-design make it more professional
```

---

### 💾 Memory System (7 Files · Tiered Loading)

```
.toh/memory/
├── Tier 1 · ALWAYS read at start (~800 tokens)
│   ├── active.md       # Current task
│   └── summary.md      # Project summary
├── Tier 2 · read per task type
│   ├── architecture.md # Project structure  (build/code work)
│   ├── components.md   # Component registry  (build/code work)
│   └── changelog.md    # Session changes     (debug work)
├── Tier 3 · read only when referenced
│   ├── decisions.md    # Key decisions
│   └── agents-log.md   # Agent activity
└── archive/            # Historical data
```

**Writes:** always update `active.md`; update `summary.md` when the project
shape changes; update the rest per relevance.

---

### 📝 Response Format

Every response from Toh includes:

1. **✅ What was done** - Files created/modified
2. **🎁 What you got** - Features, URLs
3. **👉 What you need to do** - Next steps (if any)

**No need to ask follow-up questions!**

---

### 🏗️ Tech Stack (Fixed)

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase
- **Language:** TypeScript

---

### 🤖 Sub-Agents (8)

| Agent | File | Specialty |
|-------|------|-----------|
| 🎨 UI Builder | `ui-builder.md` | Pages, Components, Layouts |
| ⚙️ Dev Builder | `dev-builder.md` | Logic, State, API |
| 🔌 Backend Connector | `backend-connector.md` | Supabase, Auth, RLS |
| ✨ Design Reviewer | `design-reviewer.md` | Polish, Animation |
| 🧪 Test Runner | `test-runner.md` | Auto test & fix |
| 🧠 Plan Orchestrator | `plan-orchestrator.md` | Analyze, Plan |
| 📱 Platform Adapter | `platform-adapter.md` | LINE, Mobile, Desktop |
| 🔍 Root Cause Debugger | `root-cause-debugger.md` | Investigate & prove bug root cause (read-only) |

**Vibe Mode** = Orchestration Pattern (not an agent)
```
/toh-vibe → plan → ui → dev → design → test → ✅ Working App
```

---

### 📊 Framework Stats

- 🤖 **8 Sub-Agents v2.1** - UI, Dev, Design, Test, Connect, Plan, Platform, root-cause-debugger
- 🎯 **14 Commands** - Including `/toh` smart command & `/toh-protect`
- 📚 **23 Skills** - Including Orchestration Protocol & Security Engineer
- 🎨 **Design Identity** - Per-project DESIGN.md design identity + versioned AVOID-LIST
- 📦 **15 Component Templates** - Ready-to-use premium components
- 🌐 **6 IDEs** - Claude Code, Cursor, Antigravity (+ Antigravity CLI), Codex (CLI + desktop app), ZCode, Gemini CLI (legacy)

---

### 🆕 What's New in v2.1.0

- 🔌 **Codex Un-truncated** - Codex now reads the whole framework instead of silently dropping 6 of 8 agents: `AGENTS.md` slimmed from ~117 KB to under 13 KB with a hard size guard (Codex เห็นทีมผู้ช่วยครบทุกตัวแล้ว)
- 🌌 **Antigravity + Antigravity CLI (agy)** - a native target with the full workspace `.agents/` surface: rules, workflows, subagents, skills + a deterministic Stop hook (Gemini CLI แบบเดิมยังใช้ได้ผ่าน `--legacy-gemini`)
- 🧩 **Shared `.agents/skills/`** - one write, four tools: Codex, Cursor 2.4, Antigravity, and ZCode all discover the same 37 skills — 23 framework skills + 14 `/toh-*` command skills (ลงครั้งเดียว ใช้ได้สี่เครื่องมือ)
- 💠 **ZCode (Z.ai) supported** - reads `AGENTS.md` + `.agents/skills/`, plus 14 native `/toh-*` slash commands from `.agents/commands/`; verified live with `zcode skills list` / `zcode commands list` (ZCode ใช้ /toh ได้ครบเหมือน IDE อื่น)
- ⌨️ **Real Slash Aliases** - `/toh-v`, `/toh-p`, `/toh-pt` are now real Claude Code commands — no more "Unknown command"; `/toh-p` belongs solely to `/toh-plan`, `/toh-protect` moved to `/toh-pt` (ทางลัดใช้ได้จริงทุกตัว)
- 🤖 **Native Agent Upgrades** - Claude Code subagents preload their skills natively, and Cursor 2.4 runs all 8 agents as native subagents instead of being told they don't exist (ทีมผู้ช่วยทำงานเต็มระบบทั้งใน Claude Code และ Cursor)

---

### 🌐 Supported IDEs

| IDE | Config Location |
|-----|-----------------|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/*.mdc` |
| Antigravity CLI (agy) + IDE | `.agents/` — rules, skills, `.agents/workflows/` (legacy: `.agent/workflows/`) |
| Codex (CLI + desktop app) | `AGENTS.md` |
| ZCode (Z.ai) | `AGENTS.md` + `.agents/` — skills and `/toh-*` commands |
| Gemini CLI (legacy, `--legacy-gemini`) | `.gemini/GEMINI.md` |

---

### 🔗 Links

- **Website:** [tohframework.dev](https://tohframework.dev)
- **npm:** `npm install -g toh-framework`
- **Install / update:** `npx toh-framework install` — **Remove:** `npx toh-framework uninstall` (shows a preview and asks first; your plan, work log and notes are kept unless you say otherwise)
- **GitHub:** [github.com/wasintoh/toh-framework](https://github.com/wasintoh/toh-framework)

</help_response>
