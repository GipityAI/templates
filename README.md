# Gipity Templates

Project templates for [Gipity](https://gipity.ai) — the AI-native app platform. Tell your AI agent what to build, and it handles the rest: code, hosting, databases, deployment, multiplayer, and more.

Templates are the starting points. Each one is a production-ready scaffold with a locked engine and open game/app logic. Your AI agent (or you) writes the creative part — the template handles the infrastructure.

## Available Templates

### 3D World

A 3D multiplayer voxel engine for building games, social spaces, chat rooms, and interactive worlds.

**Stack:** Three.js (rendering) + Rapier (physics) + Colyseus (multiplayer networking)

**What you get:**
- Real-time 3D rendering with voxel art style
- Physics (gravity, collisions, constraints)
- Multiplayer out of the box (rooms, state sync, player identity)
- Camera modes (orbit, first-person, top-down, fixed)
- World primitives (parts, spawn points, lighting, fog, time-of-day)
- Sub-voxel shape system (3x3x3 grid per part — stairs, slopes, arches)
- Debug panel, info panels, in-game UI system
- Asset loading from CDN

**Build with it:** Obby/parkour, tycoon, simulator, PvP combat, shooter, tower defense, horror, racing, RPG, social spaces, chat rooms, virtual events.

```bash
# Via Gipity CLI
gipity scaffold "My World" --type 3d-world

# Via Gipity web agent
app_scaffold type=3d-world title="My World"
```

**Project structure:**
```
src/
  template/         # Engine (read-only, updated on deploy)
    js/             # core, world, physics, assets, player, network, ui, primitives, constraints
    css/            # engine styles
  js/
    config.js       # Game metadata (title, version)
    settings.js     # Tunable values (speed, gravity, etc.)
    strings.js      # Display text
    objects.js      # Entity factories
    game.js         # Game orchestrator — your main logic
  index.html
```

Files in `src/template/` are managed by the engine — don't edit them. Everything else is yours.

*More templates coming soon: web app, mobile game, enterprise web app, and more.*

## Using Templates Outside Gipity

These templates are designed for the Gipity platform, but the engine code is standard JavaScript with no proprietary dependencies. The 3D World template uses Three.js, Rapier, and Colyseus — all open-source libraries. You can use these files in any project.

## What is Gipity?

[Gipity](https://gipity.ai) is an AI agent with 64+ built-in tools and its own cloud infrastructure. It can write code, run it, deploy it, manage databases, browse the web, generate images, send emails, and more — autonomously.

Use all of it or just the parts you need:

- **Supercharge Claude Code** — add databases, deployment, browser testing, image gen, and 30+ other tools to your local workflow
- **Automate tasks** — scheduled workflows that research, process, and act without you
- **Build and host apps** — from idea to live URL in one conversation
- **Mix and match** — use Gipity tools from Claude Code locally, or let the Gipity agent handle everything in the cloud

**Get started:** `npm install -g gipity && gipity start-cc`

## License

MIT
