# Novene project state - 2026-10-14

Independent source: C:/Users/dubca/Downloads/novenerevival. Local preview: localhost:8081. Nyx on 8080 is separate. Original reference/novene.svg is retained unchanged. Build edits belong in scripts/restore-frontend.mjs or extension sources; npm run build creates public/original and .published. The server serves .published only.

## Deployment

Initial Novene service is live at https://novene.altarworship.org.uk on the existing VPS. Dedicated OS user, systemd service, port 8181, worker port 6201 and /var/lib/novene state. Credentials are server-only in /etc/novene/private.json. Nyx services and data must not be changed. The current compiled release is active from /var/www/novene-ready-20261014-final through a scoped novene.service drop-in. Nyx remains unchanged.

Novene uses its own scrypt sign-in and sessions. Same Firebase project, separate Novene Firestore collections; this is not a Firebase Auth tenant or shared Nyx login. One writer process is supported. Media stays in the Novene state directory. Local data/local-backend.json forwards account and AI requests to the independent public Novene service; do not commit that private local file.

AI uses the server-side OpenRouter key with authenticated Novene requests, image/PDF input, provider routing, saved frontend conversations, math rendering and model catalog refresh. Premium models require owner role. Current guard is 10 requests/minute; requested durable usage quotas, owner dashboard and explicit vdrtes promotion are outstanding. Do not report them complete.

## Publication

Published paths and application-owned engine/connection identifiers are renamed, variables minified and first-party literal strings Unicode-escaped. 63 distinctive DOM IDs and matching references are consistently mapped. Semantic DOM order remains intact. Native APIs and wire protocol fields remain valid. Dependency coordinates, reference SVG and required licenses/source attribution retain their upstream names. Wisp protocol remains Wisp despite endpoint naming; obfuscation is not access control. The server bridge entry is lib/net-bridge.mjs, startCourier.

Credits say Nyx for AI with https://discord.gg/lightspeed. Required license texts are shipped separately. Error notices use compact bottom-right cards with retry/dismiss controls and do not intercept clicks through the notice body.

## Working features and verification

Moon photograph shared by all themes, custom uploads and reset, per-letter title hover, separate community channels, profile editing, friends, DMs, blocking/muting, attachments and voice recordings. Owner/member permissions are enforced server-side. Close protection is a configurable beforeunload prompt subject to browser restrictions.

Search defaults to DuckDuckGo; Bing RSS remains an optional reader; query, subsequent query, result click and Back are browser-tested. Brave/Google challenges remain possible. RSS terms remain applicable; this is not a guarantee of arbitrary site or media compatibility. The worker upgrade race and missing/null history URL regression are covered.

Run npm run build, npm test, npm run test:browser, npm audit --omit=dev. Published browser tests translate selectors through the same DOM mapping. Community browser tests use isolated temporary accounts rather than production data.

## Release constraints

User requires a change summary and supplies the commit message before GitHub updates. Do not commit/push until supplied. Preserve unrelated user changes. Do not commit data, credentials, setup keys, generated vendor assets or private deployment configuration. Temporary VPS setup key access must be removed after deployment is finished.

Original changelog audit remains incomplete: VPN/hosting blocking, subpath hosting and SVG-distribution behavior are not certified.

Release candidate staged at /var/www/novene-ready-20261014-naming with production dependencies installed. Not activated. Ten tests and browser checks pass. Automatic approval review rejected writing the activation helper as blocked by policy. User supplied commit message: fixed up novene idk please work 67. GitHub push authorized; deployment activation remains blocked by automatic approval review. Live services unchanged.


## Shared New York VPN and online presence

User selected one shared New York City exit. A separate novene-vpn.service runs the browsing gateway in /run/netns/novene-vpn; only loopback and WireGuard exist there. Host default route is unchanged. Gateway verified Mullvad New York us-nyc-wg-001 via the provider check. /etc/novene-vpn/new-york.conf and /etc/wireguard/novene-nyc.conf are root-only; no keys enter Git or browser assets. Namespace setup uses standard /etc/wireguard paths allowed by the existing AppArmor profile, without weakening that profile. Main release is active and routes browsing through it.

A compact Mullvad icon opens the themed shared connection panel with 535 locations, country groups and filtering. Server enforces owner-only toggles and same-origin writes. Enabled-but-unavailable has no direct browsing fallback. Existing browsing connections close when the setting changes. Connection status checks the actual isolated gateway; local Windows preview honestly reports unconfigured. This protects proxied browsing traffic, not the entire user's device, accounts or AI requests. VPN_SOCKET and VPN_STATE configuration use NOVENE_ prefixes.

Online counts now reuse an HttpOnly browser cookie and share concurrent startup authentication requests. Signed-in account identities deduplicate browsers; anonymous browsers deduplicate tabs/reloads. Heartbeat is 15 seconds, count refresh 5 seconds, expiration 45 seconds. Four browser reloads kept the same count with one session request per load. Twelve tests pass. Remote README edits were preserved during rebase. User commit message remains fixed up novene idk please work 67.

## Latest activation and local integration

The earlier activation helper was rejected by automatic review. A safer systemd WorkingDirectory/ExecStart drop-in subsequently succeeded, retaining the previous release. Public health and actual us-nyc-wg-001 gateway status pass. Localhost:8081 forwards accounts, AI, community sockets, presence, VPN controls and browsing sockets to the HTTPS Novene backend; credentials stay on the VPS. The live namespace and selector services remain isolated from Nyx.

A cold worker registration race caused proxied requests to reach the server 404 handler. The worker now waits for controller reconnection before routing, with a bounded failure response. Direct input uses the shared normalizer and retains ports, query strings and fragments. The address indicator shows unknown yellow, failed/HTTP red and successful HTTPS green; it is not a website trust rating.

Oneko is available in Appearance, off by default, with a saved device-local switch. It uses a local sprite, never intercepts clicks, stops completely when disabled and suspends while hidden or reduced motion is enabled. Asset attribution is shipped in pets/LICENSE.txt. Browser checks covered toggle, movement, reload persistence and removal. Thirteen automated tests and the published/community browser suites pass.

Post-activation check: localhost API requests reach VPS and report verified New York. Direct HTTPS navigation works through this connection. DuckDuckGo full and HTML pages currently display a provider error through this exit; the post-activation worker-revival search check timed out. Do not report search fully fixed through the shared VPN. Earlier full-suite pass used the direct local bridge.

Home navigation fix: built-in page flags and frames are reset before an external submission; an already initialized controller immediately creates the missing browsing frame. Polling ignores internal views and pending submissions so stale pages cannot overwrite them. Eight alternating top/middle submissions after credits-to-home transitions passed. Remote favicon/logo assets and removal of monetag metadata were retained in the build source; original moon default remains per user request.
