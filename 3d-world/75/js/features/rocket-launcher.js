/**
 * 3D World — Rocket Launcher Feature (READ-ONLY, overwritten on deploy)
 * Opt-in projectile weapon with explosions and physics knockback.
 *
 * Enable in config.js:
 *   features: { 'rocket-launcher': true }
 *   features: { 'rocket-launcher': { speed: 200, cooldown: 1.0 } }
 */

export const DEFAULTS = {
  speed: 120,
  cooldown: 0.15,
  size: 2.0,
  color: 0xff4400,
  trailColor: 0xff8800,
  maxDistance: 150,
  blastRadius: 10,
  blastForce: 40,
  blastColor: 0xff6600,
  showCrosshair: true,
  debugKey: 'KeyB',
};

export function create(config, deps) {
  const { world, scene, camera, physics, player, network, ui, assets, THREE } = deps;

  const rockets = [];
  const explosions = [];
  let cooldownTimer = 0;
  let debugMode = false;
  const debugLines = [];

  // Event hooks
  const hooks = { fire: [], hit: [], explode: [] };
  function emit(type, ...args) { for (const cb of hooks[type]) cb(...args); }

  // --- Rocket mesh ---

  function buildRocketMesh() {
    const s = config.size;
    const group = new THREE.Group();

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.12 * s, 0.3 * s, 6),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee }),
    );
    cone.position.y = 0.4 * s;
    group.add(cone);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12 * s, 0.12 * s, 0.5 * s, 6),
      new THREE.MeshStandardMaterial({ color: config.color }),
    );
    body.position.y = 0.1 * s;
    group.add(body);

    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * s, 0.14 * s, 0.16 * s, 6),
      new THREE.MeshStandardMaterial({ color: 0x444444 }),
    );
    nozzle.position.y = -0.22 * s;
    group.add(nozzle);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.1 * s, 0.3 * s, 6),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 }),
    );
    flame.position.y = -0.46 * s;
    flame.rotation.x = Math.PI;
    group.add(flame);

    return group;
  }

  // --- Aiming ---

  function getAimTarget() {
    const camPos = camera.position.clone();
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    const hit = physics.castRay(
      { x: camPos.x, y: camPos.y, z: camPos.z },
      { x: camDir.x, y: camDir.y, z: camDir.z },
      100,
    );
    if (hit) return new THREE.Vector3(hit.point.x, hit.point.y, hit.point.z);

    // Fallback: intersect ground plane y=0
    if (camDir.y !== 0) {
      const t = -camPos.y / camDir.y;
      if (t > 0) return new THREE.Vector3(camPos.x + camDir.x * t, 0, camPos.z + camDir.z * t);
    }

    return camPos.clone().add(camDir.multiplyScalar(100));
  }

  // --- Firing ---

  function fire() {
    if (cooldownTimer > 0) return;
    cooldownTimer = config.cooldown;

    const pos = player.getPosition();
    const chest = new THREE.Vector3(pos.x, pos.y + 1.0, pos.z);
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const target = getAimTarget();

    // Horizontal offset to clear the player model
    const horizDir = new THREE.Vector3(camDir.x, 0, camDir.z).normalize();
    const origin = chest.clone().add(horizDir.multiplyScalar(2));

    // Direction from spawn point to crosshair target
    const dir = target.clone().sub(origin);
    if (dir.length() < 1) {
      camera.getWorldDirection(dir);
    } else {
      dir.normalize();
    }

    const mesh = buildRocketMesh();
    mesh.position.copy(origin);
    const up = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize()));
    scene.add(mesh);

    rockets.push({
      mesh,
      direction: dir.clone().normalize(),
      distanceTraveled: 0,
      trailPoints: debugMode ? [origin.clone()] : null,
      trailLine: null,
    });

    // Multiplayer sync
    network.sendMessage('rocket-fire', {
      x: origin.x, y: origin.y, z: origin.z,
      dx: dir.x, dy: dir.y, dz: dir.z,
    });

    emit('fire', origin, dir);
  }

  // --- Explosions ---

  function explodeAt(position) {
    const { blastRadius, blastColor, blastForce } = config;

    // Expanding sphere
    const geo = new THREE.SphereGeometry(0.5, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: blastColor, transparent: true, opacity: 0.9 });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.copy(position);
    scene.add(sphere);
    explosions.push({ mesh: sphere, age: 0 });

    // Particle debris
    for (let i = 0; i < 12; i++) {
      const particle = assets.createVoxelBox(blastColor, 0.2);
      particle.position.copy(position);
      scene.add(particle);
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.5,
        (Math.random() - 0.5) * 2,
      ).normalize();
      explosions.push({
        mesh: particle, age: 0, isParticle: true,
        velocity: dir.multiplyScalar(8 + Math.random() * 6),
      });
    }

    // Blast impulse + torque to all dynamic bodies in radius
    const nearby = physics.queryNearby(
      { x: position.x, y: position.y, z: position.z },
      blastRadius,
    );
    for (const { body } of nearby) {
      if (!body.isDynamic()) continue;
      const bp = body.translation();
      const dx = bp.x - position.x;
      const dy = bp.y - position.y;
      const dz = bp.z - position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist > blastRadius || dist < 0.01) continue;

      const falloff = 1 - dist / blastRadius;
      const strength = blastForce * falloff;
      const blastDir = new THREE.Vector3(dx / dist, dy / dist, dz / dist);

      body.wakeUp();

      // Impulse away from blast + upward kick
      const impulse = blastDir.clone().multiplyScalar(strength);
      impulse.y += strength * 0.5;
      body.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);

      // Torque: cross product for realistic off-center spin
      const offset = new THREE.Vector3(
        position.x - bp.x, position.y - bp.y, position.z - bp.z,
      ).normalize();
      const torque = new THREE.Vector3().crossVectors(offset, blastDir).multiplyScalar(strength * 0.4);
      body.applyTorqueImpulse({ x: torque.x, y: torque.y, z: torque.z }, true);
    }

    emit('explode', position);
  }

  // --- Debug ---

  function drawDebugLine(from, to, color) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    debugLines.push(line);
  }

  function clearDebugLines() {
    for (const line of debugLines) scene.remove(line);
    debugLines.length = 0;
  }

  // --- Update loops ---

  function updateRockets(dt) {
    const { speed, maxDistance } = config;

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      const move = r.direction.clone().multiplyScalar(speed * dt);
      r.mesh.position.add(move);
      r.distanceTraveled += speed * dt;

      // Debug trail
      if (r.trailPoints) {
        r.trailPoints.push(r.mesh.position.clone());
        if (r.trailLine) {
          scene.remove(r.trailLine);
          const idx = debugLines.indexOf(r.trailLine);
          if (idx !== -1) debugLines.splice(idx, 1);
        }
        const geo = new THREE.BufferGeometry().setFromPoints(r.trailPoints);
        r.trailLine = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffff00 }));
        scene.add(r.trailLine);
        debugLines.push(r.trailLine);
      }

      // Collision: query nearby bodies at rocket position
      let hit = false;
      const rp = r.mesh.position;
      const nearby = physics.queryNearby({ x: rp.x, y: rp.y, z: rp.z }, 0.5);
      for (const { body } of nearby) {
        if (body.isFixed() || body.isDynamic()) { hit = true; break; }
      }

      // Ground hit
      if (rp.y <= 0.2) hit = true;

      if (hit || r.distanceTraveled > maxDistance) {
        if (hit) {
          explodeAt(rp.clone());
          emit('hit', rp.clone());
        }
        scene.remove(r.mesh);
        rockets.splice(i, 1);
      }
    }
  }

  function updateExplosions(dt) {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const e = explosions[i];
      e.age += dt;

      if (e.isParticle) {
        e.mesh.position.add(e.velocity.clone().multiplyScalar(dt));
        e.velocity.y -= 15 * dt;
        const life = 0.6;
        e.mesh.scale.setScalar(Math.max(0, 1 - e.age / life));
        if (e.age > life) { scene.remove(e.mesh); explosions.splice(i, 1); }
      } else {
        const life = 0.4;
        const t = e.age / life;
        e.mesh.scale.setScalar(1 + t * config.blastRadius * 2);
        e.mesh.material.opacity = Math.max(0, 0.9 * (1 - t));
        if (e.age > life) { scene.remove(e.mesh); explosions.splice(i, 1); }
      }
    }
  }

  // --- Input handlers ---

  let mouseHeld = false;
  function onMouseDown(e) { if (e.button === 0) mouseHeld = true; }
  function onMouseUp(e) { if (e.button === 0) mouseHeld = false; }
  function onKeyDown(e) {
    if (e.code === config.debugKey) {
      debugMode = !debugMode;
      if (!debugMode) clearDebugLines();
      console.log(`[Rocket debug] ${debugMode ? 'ON' : 'OFF'}`);
    }
  }

  // --- Network handlers ---

  function spawnRemoteRocket(x, y, z, dx, dy, dz) {
    const mesh = buildRocketMesh();
    mesh.position.set(x, y, z);
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(up, dir));
    scene.add(mesh);
    rockets.push({ mesh, direction: dir, distanceTraveled: 0, trailPoints: null, trailLine: null });
  }

  // --- Public API ---

  return {
    config,

    async init() {
      // Input
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);
      window.addEventListener('keydown', onKeyDown);

      // Crosshair
      if (config.showCrosshair) {
        ui.setHud('center', '<div style="font-size:36px;color:rgba(255,255,255,0.7);pointer-events:none">+</div>');
      }

      // Multiplayer: receive remote rockets
      network.onMessage('rocket-fire', (data) => {
        spawnRemoteRocket(data.x, data.y, data.z, data.dx, data.dy, data.dz);
      });
    },

    update(dt) {
      if (cooldownTimer > 0) cooldownTimer -= dt;

      // Fire on held mouse click
      if (mouseHeld && cooldownTimer <= 0) fire();

      updateRockets(dt);
      updateExplosions(dt);
    },

    destroy() {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      // Clean up scene objects
      for (const r of rockets) scene.remove(r.mesh);
      for (const e of explosions) scene.remove(e.mesh);
      clearDebugLines();
      rockets.length = 0;
      explosions.length = 0;
      if (config.showCrosshair) ui.clearHud('center');
    },

    fire,

    onFire(cb) { hooks.fire.push(cb); },
    onHit(cb) { hooks.hit.push(cb); },
    onExplode(cb) { hooks.explode.push(cb); },
  };
}
