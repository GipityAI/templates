# 3D World Template

A 3D multiplayer voxel engine for building games, social spaces, and interactive worlds on [Gipity](https://gipity.ai).

Built on **Three.js** (rendering) + **Rapier** (physics) + **Colyseus** (multiplayer). High-res voxel art style with sub-voxel detail (3x3x3 grid per part).

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

[Gipity](https://gipity.ai) is an AI agent with 64+ built-in tools and its own cloud infrastructure. It can write code, run it, deploy it, manage databases, browse the web, generate images, send emails, and more — autonomously.

Use all of it or just the parts you need:

- **Supercharge Claude Code** — add databases, deployment, browser testing, image gen, and 30+ other tools to your local workflow
- **Automate tasks** — scheduled workflows that research, process, and act without you
- **Build and host apps** — from idea to live URL in one conversation
- **Mix and match** — use Gipity tools from Claude Code locally, or let the Gipity agent handle everything in the cloud

**Get started:** `npm install -g gipity && gipity start-cc`

## License

MIT
