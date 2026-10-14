# Novene Revival

Independent Novene app built around the supplied original `reference/novene.svg`. The original home, sidebar, settings, tabs, colors and entrance animation are retained. New controls extend that interface.

## Run locally

```powershell
npm ci
npm run build
npm start
```

Open http://localhost:8081. Nyx on port 8080 is a separate installation. `PORT`, `HOST`, `WORKER_PORT` and `COMMUNITY_DATA` may be set in the process environment. Default binding is loopback. No new VPS or public domain is configured yet.

## Community

The speech-bubble sidebar button opens announcements, general, links and bugs. Accounts have owner or member roles, enforced by the server. Members can chat, edit their own profiles, delete their own messages and exchange private messages. Announcements are owner-only. Owners can manage roles, remove members and delete messages. The last active owner cannot be removed.

Profiles have a banner, avatar, presence indicator, display name, handle, account number and bio. Click your name at the bottom of the channel sidebar to edit yours. Images are resized locally before upload.

To claim the owner account, open `data/community/owner-setup.txt` locally and enter its contents in the optional owner setup code field during account creation. Do not publish or send this file. The code is removed after the owner account is created. Ordinary registration never grants owner access automatically.

Accounts, hashed passwords, hashed session tokens and messages persist in `data/community/community.json`, excluded from Git. Keep this directory backed up and private. This storage supports one app process; use a shared database before running multiple replicas. Live chat uses the same-origin `/api/community/socket` endpoint. A deployment reverse proxy must forward WebSocket upgrades. Production account recovery, email verification and distributed storage are not configured.

## Appearance

Settings retains the original theme and wallpaper switches. The new wallpaper browser offers 10 real nature photographs for each of five themes, with originals at least 3840 by 2160 pixels. Photos are darkened by a CSS overlay. Thumbnails are local; full-resolution images load from Wikimedia Commons only when selected. Attribution is shown with each selected image and retained in `public/wallpapers.json`.

Custom wallpapers are stored only in this browser's IndexedDB: up to 12 images, 15 MB each. Selection is remembered per theme. The original background can be restored. Each Novene title letter zooms independently on hover with a 160 ms transition.

## Connection and AI

The browsing stack uses pinned matching Scramjet/controller assets, libcurl transport and a local Wispurr bridge. The bridge rejects private destinations and UDP and restricts TCP destinations to ports 80 and 443. Build-time patches fix missing/null history URL arguments and libcurl socket cleanup; patches fail closed when expected upstream code changes.

AI setup is intentionally deferred until the owner's new VPS/domain is ready. The AI panel uses the local `/api/ai` endpoint, which reports that it is not configured. No Nyx server credentials were copied and no requests are sent to the old frontend's AI provider.

Third-party sites can challenge or reject proxied connections. A completed search route does not guarantee a site's CAPTCHA or media licensing will work.

## Checks

```powershell
npm test
npm run test:browser
npm audit --omit=dev
```

The first browser suite expects this app running on 8081. The community browser suite runs its own temporary server and accounts; it does not add test users to the normal installation. Tests cover live messages, private room access, owner restrictions, profile persistence, wallpaper uploads and browser navigation/history.

## Sources

- Original frontend: user-supplied `novene.svg`, retained unchanged under `reference/`.
- Service-worker reference: https://github.com/arsenicdisc2/Novene/blob/f2bf5320a1849df08dc8e9fbe8c4c45a3478130d/novene-sw.js
- Scramjet/controller/libcurl: Mercury Workshop packages, versions in `package-lock.json`.
- Wispurr: version pinned in `package-lock.json`.
- Photographs: individual Wikimedia Commons source pages, author names and license URLs in `public/wallpapers.json`.

Dependency licenses remain applicable. The AGPL text is included for the connection stack; it does not relicense the supplied frontend or photographs. Verify permission for the original frontend before public redistribution. Generated vendor assets, credentials, account data and test artifacts are excluded from Git.
