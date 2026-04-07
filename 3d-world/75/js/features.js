/**
 * 3D World — Features Module (READ-ONLY, overwritten on deploy)
 * Opt-in gameplay features that games enable via config.features.
 *
 * Usage in config.js:
 *   features: { 'rocket-launcher': true }            // enable with defaults
 *   features: { 'rocket-launcher': { speed: 200 } }  // enable with overrides
 */

// Dynamic import map — feature modules only loaded when enabled
const featureLoaders = {
  'rocket-launcher': () => import('./features/rocket-launcher.js'),
};

const active = new Map(); // name → instance

/**
 * Initialize enabled features. Called during boot, after gameInit.
 * @param {Object} featureConfig - e.g. { 'rocket-launcher': true }
 * @param {Object} deps - template module references
 */
export async function initFeatures(featureConfig, deps) {
  if (!featureConfig) return;
  for (const [name, config] of Object.entries(featureConfig)) {
    if (!config) continue; // false/null/undefined = disabled
    const loader = featureLoaders[name];
    if (!loader) {
      console.warn(`[Features] Unknown feature: "${name}". Available: ${Object.keys(featureLoaders).join(', ')}`);
      continue;
    }
    const mod = await loader();
    const settings = config === true ? {} : config;
    const instance = mod.create({ ...mod.DEFAULTS, ...settings }, deps);
    await instance.init();
    active.set(name, instance);
    console.log(`[Features] Enabled: ${name}`);
  }
}

/** Called every frame from the game loop. */
export function updateFeatures(dt) {
  for (const inst of active.values()) inst.update(dt);
}

/** Get a feature instance by name, or null if not enabled. */
export function get(name) { return active.get(name) || null; }

/** Check if a feature is enabled. */
export function isEnabled(name) { return active.has(name); }
