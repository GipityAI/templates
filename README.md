# Gipity Templates

Project templates for [Gipity](https://gipity.ai) — an AI agent with 90+ tools and a full cloud platform. Tell your AI agent what to build, and it handles the rest: code, hosting, databases, deployment, multiplayer, and more.

Templates are the starting points. Each one is a production-ready scaffold with all files fully editable. Your AI agent (or you) writes the creative part — the template handles the infrastructure.

## Available Templates

### 3D World

A 3D multiplayer engine for building games, social spaces, chat rooms, and interactive worlds.

**Stack:** Three.js (rendering) + Rapier (physics) + Colyseus (multiplayer networking)

**What you get:**
- Real-time 3D rendering
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
  js/
    core.js         # Engine — game loop, boot, module exports
    world.js        # Three.js scene, renderer, lighting
    physics.js      # Rapier physics world
    assets.js       # CDN asset loader
    player.js       # Character controller, camera
    network.js      # Colyseus multiplayer
    ui.js           # HUD, loading screen
    primitives.js   # Part system, workspace, snap
    constraints.js  # Weld, hinge, spring joints
    config.js       # Game metadata (title, version)
    settings.js     # Tunable values (speed, gravity, etc.)
    strings.js      # Display text
    objects.js      # Entity factories
    game.js         # Game orchestrator — your main logic
  css/
    engine.css      # Engine UI styles
    game.css        # Your custom styles
  index.html
```

All files are fully editable.

*More templates coming soon: web app, mobile game, enterprise web app, and more.*

## Using Templates Outside Gipity

These templates are designed for the Gipity platform, but the engine code is standard JavaScript with no proprietary dependencies. The 3D World template uses Three.js, Rapier, and Colyseus — all open-source libraries. You can use these files in any project.

## What is Gipity?

Most AI tools give you a chatbot. We gave ours a computer.

[Gipity](https://gipity.ai) is an AI agent with 90+ tools and a full cloud platform behind it — app hosting, databases, file storage, deployment, scheduled workflows, and sandboxed code execution. No setup. No API keys. No config files.

Describe what you want. Your agent writes the code, builds the app, sets up the database, deploys it to a live URL, and keeps it running. From idea to production in one conversation.

**Get started:** `npm install -g gipity && gipity start-cc`

## License

MIT
