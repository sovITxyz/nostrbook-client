import { NostrSwarm } from 'nostr-swarm'

// All configuration is driven by environment variables.
// See nostr-swarm's loadConfig/loadWotConfig for the full list:
//   WS_PORT, WS_HOST, STORAGE_PATH, SWARM_TOPIC,
//   RELAY_NAME, RELAY_DESCRIPTION, RELAY_CONTACT,
//   WOT_OWNER_PUBKEY, WOT_MAX_DEPTH, WOT_DISCOVERY, etc.

const relay = new NostrSwarm()
await relay.start()
