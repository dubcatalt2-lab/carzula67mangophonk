# Novene project state - 2026-10-14

Independent source: C:/Users/dubca/Downloads/novenerevival. Local preview: localhost:8081. Nyx on 8080 is separate. Original reference/novene.svg is retained unchanged. Build edits belong in scripts/restore-frontend.mjs or extension sources; npm run build creates public/original and .published. The server serves .published only.

## Deployment

Initial Novene service is live at https://novene.altarworship.org.uk on the existing VPS. Dedicated OS user, systemd service, port 8181, worker port 6201 and /var/lib/novene state. Credentials are server-only in /etc/novene/private.json. Nyx services and data must not be changed. The current compiled release is active from /var/www/novene-access-20261014 through a scoped novene.service drop-in. Nyx remains unchanged.

Novene uses its own scrypt sign-in and sessions. Same Firebase project, separate Novene Firestore collections; this is not a Firebase Auth tenant or shared Nyx login. One writer process is supported. Media stays in the Novene state directory. Local data/local-backend.json forwards account and AI requests to the independent public Novene service; do not commit that private local file.

AI uses the server-side OpenRouter key with authenticated Novene requests, image/PDF input, provider routing, saved frontend conversations, math rendering and model catalog refresh. Model access now matches the inspected Nyx policy: standard models for regular members, gpt-5.6-luna for active Premium/owners, gpt-5.6-sol-pro for owners only. Catalog filtering and request checks use the same policy. Current guard is 10 requests/minute; requested durable usage quotas, owner dashboard and explicit vdrtes promotion are outstanding. Do not report them complete.

## Publication

Published paths and application-owned engine/connection identifiers are renamed, variables minified and first-party literal strings Unicode-escaped. 63 distinctive DOM IDs and matching references are consistently mapped. Semantic DOM order remains intact. Native APIs and wire protocol fields remain valid. Dependency coordinates, reference SVG and required licenses/source attribution retain their upstream names. Wisp protocol remains Wisp despite endpoint naming; obfuscation is not access control. The server bridge entry is lib/net-bridge.mjs, startCourier.

Credits say Nyx for AI with https://discord.gg/lightspeed. Required license texts are shipped separately. Error notices use compact bottom-right cards with retry/dismiss controls and do not intercept clicks through the notice body.

## Working features and verification

Moon photograph shared by all themes, custom uploads and reset, per-letter title hover, separate community channels, profile editing, friends, DMs, blocking/muting, attachments and voice recordings. Owner/member permissions are enforced server-side. Close protection is a configurable beforeunload prompt subject to browser restrictions.

Search defaults to DuckDuckGo; Bing RSS remains an optional reader; query, subsequent query, result click and Back are browser-tested. Brave/Google challenges remain possible. RSS terms remain applicable; this is not a guarantee of arbitrary site or media compatibility. The worker upgrade race and missing/null history URL regression are covered.

Run npm run build, npm test, npm run test:browser, npm audit --omit=dev. Published browser tests translate selectors through the same DOM mapping. Community browser tests use isolated temporary accounts rather than production data.

## Release constraints

User requires a change summary and supplies the commit message before GitHub updates. Do not commit/push until supplied. Preserve unrelated user changes. Do not commit data, credentials, setup keys, generated vendor assets or private deployment configuration. Earlier temporary setup keys were revoked. The user explicitly authorized retaining the dedicated novene_accounts_ui_deploy SSH key for future deployments; do not revoke or delete it after deployment. Private key stays outside the repository in the local .ssh directory; the authorized-key comment still says novene-accounts-ui-temporary but access is now intentionally persistent.

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

## AI grouping and ad-free access release

Model picker groups OpenAI, Anthropic, Google, xAI, then other providers. Login/logout refreshes the catalog. Premium is a separate server-managed expiry, assigned/revoked by owners in Appearance account access tools. Ad-free keys grant no AI privileges: random 192-bit secrets are displayed once, SHA-256 hashes stored in noveneAdFreeKeys, redemption is serialized/single-use, redemption window is 30 days and access duration 1-3650 days. Owner revocation immediately removes the linked ad-free entitlement. Existing owners are ad-free. Account access tools also provide redemption and owner key listing/revocation. Future Adsterra integration must call window.noveneCanShowAds() before inserting any script or popup; no Adsterra tags were added. Fifteen tests pass, including forged-tier rejection and concurrent key redemption; built UI fixtures verify provider order and owner controls. Activated at /var/www/novene-access-20261014. Public and localhost checks pass for provider order, unauthenticated restricted-model filtering, entitlement endpoint, and owner-tool visibility. Restart took the 90-second systemd stop timeout because existing browsing sockets remained open; a future shutdown fix should explicitly close those sockets.

Accounts settings: account status, profile/sign-in entry, ad-free redemption and owner access tools now live in a dedicated Accounts sidebar section instead of Appearance. Source/build updated locally; browser checks passed navigation, sign-in dialog and hidden controls when switching sections. Pushed in 04e2286 and deployed to /var/www/novene-access-20261014 without a restart. Live browser checks passed Accounts navigation, sign-in dialog, and separation from Appearance. The three previous published files are backed up in /home/ubuntu/novene-setup/accounts-ui-before.tar.gz.

Deployed UI update: removed ad-free redemption from Accounts and moved owner key creation/listing to Keys. Keys copy now says: No ads yet. Contact @vdrtes on Discord or dubcatalt2@gmail.com for inquiries. Removed the legacy external key-check request so it cannot overwrite this notice. Built and deployed without a restart; live browser checks passed Accounts cleanup and the persistent corrected Keys notice.

## Game loading repair

Catalog sources now load concurrently and publish results as each arrives, with a 10-second per-source timeout. Absolute game/cover URLs stay intact, negative-ID announcement entries are excluded, and root-relative game assets retain their meaning. Game HTML downloads check HTTP status, time out after 20 seconds, show a failure message, and cancel when leaving or switching games. Local browser checks reached playable OvO and 2048 screens; first catalog display measured 238 ms in that run (not a general latency guarantee). Twenty automated tests pass, including three loader regressions. The UGS catalog endpoint currently returns 404; other catalogs remain usable. Upstream game assets can still fail or load slowly independently.

The separate Cloudflare fallback is work in progress in the working tree; it is not part of this game-loading deployment and no solver service is active.

Shared VPN selection changed at the user's request to us-qas-wg-304 (Ashburn, VA, USA). The isolated gateway verified that exact Mullvad exit; /var/lib/novene-vpn/selection.json persists the choice across namespace startup. Earlier New York descriptions are historical.

Local theme expansion: synced upstream 307ea60 and retained __90638 naming and publication cleanup. Added eight opaque-ID color modes (lavender, dark purple, hot pink, light pink, teal, amber, coral, midnight blue), matching accent/panel/favicon colors and a scrollable picker. Green defaults to existing n.png; black keeps moon.jpg; custom uploads still override defaults. Local browser checks passed all eight selections, reload persistence, both wallpaper paths and renamed engine asset availability. Windows build invokes python while other systems retain python3; the upstream obfuscation script is unchanged. These theme changes are built on localhost:8081 and not yet pushed or deployed.

## HTTPS and built-in page audit

Configured testing.itcode.fyi as an additional Caddy hostname for Novene port 8181. Let's Encrypt issuance succeeded and the public Cloudflare endpoint returned HTTP 200 with /healthz ready=true; the previous 525 came from the unconfigured hostname. Existing Novene hostname remains active. Shared Ashburn connection remains enabled and verified.

Interactive audit covered home, game catalog/playback, AI model/provider controls and signed-out submission handling, apps catalog, history, partners, changelogs, credits, all six Settings sections, theme persistence, custom wallpaper lifecycle, Oneko and navigation. Isolated community browser tests cover sign-up, live messages, profile editing, announcement restrictions, image/video/voice attachments, DMs, friends, mute/block and close protection. Production signed-in AI generation and owner-only workflows were not exercised with a real owner account. No claim of exhaustive absence of bugs is made.

DuckDuckGo still renders its Unexpected error page through the shared exit. Bing reader query/result/back navigation and direct addresses pass. The worker revival regression now uses a stable direct document, independent of search-provider availability; the DuckDuckGo failure remains open. The UGS catalog 404 and unfinished Cloudflare solver integration remain open. Theme release includes upstream __90638 obfuscation changes and Windows Python executable selection.

Release 92d752b deployed: public testing.itcode.fyi HTTPS, browsing/WebSocket and verified Ashburn status pass. Theme assets match the built release hash. Follow-up color menu fix chooses available space above/below the trigger and bounds its height to the Settings viewport, with a theme-colored scrollbar. Checks at 2016x1200, 1280x720 and 390x844 confirmed no added Settings scroll height and successful color selection.

Chat emoji update uses the Nyx shortcode catalog and matching case-insensitive expansion, with ranked colon suggestions, arrow-key selection, Enter/Tab insertion, Escape dismissal, Enter-to-send and Shift+Enter for new lines. IME composition is not submitted. Unknown shortcodes remain literal text. Source and obfuscated browser account/chat tests verify emoji transmission and keyboard behavior. Owner promotion was requested for the existing vdrtes account #2; verification is recorded separately after activation.

Verified vdrtes account #2 is owner in Firestore after a controlled service stop, transactional role change and restart. No other account roles changed. Existing sessions remain valid; reopening chat reloads the role and owner controls. Emoji UI deployed in dfc6f84; final live HTTPS and shortcode checks pass. The stop took the existing 90-second shutdown timeout.

## Roles and owner dashboard

Added owner/admin/dev/mod/booster/member with server-enforced hierarchy. Owners manage all roles, bans and access; admins can assign lower roles, moderate lower-ranked public messages and post announcements; moderators can moderate lower-ranked members/public messages but cannot assign roles. Dev and Booster are display roles without automatic moderation, Premium or AI privileges. Private DMs remain private, and the final active owner cannot be removed. Existing vdrtes ownership is unchanged.

Settings > Accounts > Owner dashboard lists members, roles, ban/restore controls and public activity counts. Premium controls stay in Accounts; ad-free key controls stay in Keys. Community-uploaded role artwork from the user-supplied emoji.gg directory is shipped locally with attribution; it is not an official Discord six-role set. New frontend code uses the existing Unicode/minification/DOM mapping build without altering __90638.

DuckDuckGo full/HTML/Lite endpoints still return upstream errors through the shared Ashburn exit. A direct request from that same namespace also returned DuckDuckGo's human challenge. The error page now offers Retry DuckDuckGo and an explicitly labeled optional Bing search; DuckDuckGo remains the default, with no silent provider switch. Do not report the upstream restriction fixed. The unfinished Cloudflare integration remains excluded.

Validation: 21 working-tree unit tests pass (including two dormant solver tests); source and published owner dashboard role/ban/restore tests pass; the published browsing and community suites pass. Error recovery was tested through the live connection and reaches Bing results without changing the default preference. Deployment status is recorded after activation.

Release 16d848e activated at /var/www/novene-access-20261014. Clean release: 19 tests pass, obfuscated dashboard and chat browser checks pass. Both public hostnames return HTTPS 200 and healthy backend responses; deployed commons.js/reading.js hashes match the tested package. Anonymous dashboard access returns 401 and the owner button stays hidden. Live DuckDuckGo error recovery reaches explicitly labeled Bing results while retaining the DuckDuckGo preference. Backup: /home/ubuntu/novene-setup/before-roles-16d848e.tar.gz. Service restart completed after the existing stop timeout; unfinished solver files were excluded.

## 2026-10-15 - Ashburn VPN default

Owner requested us-qas-wg-304 (Ashburn, VA; WireGuard endpoint 23.234.97.127:51820). Selected the existing validated private profile through the restricted control socket; selection.json now persists that hostname. Public /api/connection and fresh gateway provider check both confirm enabled/connected and exact hostname; WireGuard latest handshake is nonzero. A raw ip-netns curl initially failed DNS because it does not inherit the service's resolv.conf bind; the actual gateway check passed. The endpoint address is not necessarily the public browsing exit IP.

Startup now defaults to that profile when no saved selection exists, preserves saved owner choices, and rejects invalid/missing profile paths rather than silently using New York. Syntax and isolated selection checks passed (default, saved choice, invalid hostname, missing profile). Deployed only /opt/novene-vpn/deploy/vpn-namespace.py, exact SHA256 verified; backup vpn-namespace.before-ashburn-default.py retained. No service restart required for current selection. Nyx and other app files unchanged.

Prepared from origin/main abe77cc in .artifacts/ashburn-default to preserve collaborator changes and unrelated dirty VPN/solver work. GitHub push pending owner's commit message.
