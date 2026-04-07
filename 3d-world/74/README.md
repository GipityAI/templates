# 3D World Template

A 3D multiplayer engine for building games, social spaces, and interactive worlds on [Gipity](https://gipity.ai).

Built on **Three.js** (rendering) + **Rapier** (physics) + **Colyseus** (multiplayer). Stylized 3D with sub-voxel detail (3x3x3 grid per part).

## Engine Modules

| Module | File | Description |
|--------|------|-------------|
| **Core** | `js/core.js` | Game loop, module exports, version, hot reload |
| **World** | `js/world.js` | Workspace management, lighting, fog, time-of-day |
| **Physics** | `js/physics.js` | Rapier physics wrapper, collision detection |
| **Primitives** | `js/primitives.js` | Parts, spawn points, sub-voxel shapes, snap system |
| **Constraints** | `js/constraints.js` | Weld, hinge, spring connections between parts |
| **Player** | `js/player.js` | Player controller, camera modes, spawn logic |
| **Network** | `js/network.js` | Colyseus multiplayer, room management, state sync |
| **Assets** | `js/assets.js` | CDN asset loading (voxel models, sounds) |
| **UI** | `js/ui.js` | Info panels, debug overlay, HUD system |
| **Styles** | `css/engine.css` | Engine UI styling |

## Quick Start

```bash
# Create a new 3D World project on Gipity
gipity scaffold "My World" --type 3d-world
gipity deploy dev
```

All modules are available via a single import in your game code:

```js
import {
  world, assets, physics, player, network, ui,
  primitives, constraints, workspace,
  THREE, onInit, onUpdate, setConfig
} from '../template/js/core.js';
```

## What is Gipity?

Most AI tools give you a chatbot. We gave ours a computer.

[Gipity](https://gipity.ai) is an AI agent with 90+ tools and a full cloud platform behind it — app hosting, databases, file storage, deployment, scheduled workflows, and sandboxed code execution. No setup. No API keys. No config files.

Describe what you want. Your agent writes the code, builds the app, sets up the database, deploys it to a live URL, and keeps it running. From idea to production in one conversation.

**Get started:** `npm install -g gipity && gipity start-cc`

## License

MIT
