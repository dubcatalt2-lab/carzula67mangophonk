# Novene project state — 2026-10-14

This is an independent project at `C:/Users/dubca/Downloads/novenerevival`, served locally on port 8081. Nyx on 8080 is untouched. The original supplied SVG remains the frontend source, not a replacement design. Build extracts its original markup/styles and adapts the runtime through `scripts/restore-frontend.mjs`. Change extensions or extraction logic, then run `npm run build`.

Working additions: per-letter title hover, 50 attributed nature wallpapers (10 per theme), custom wallpaper upload/persistence, a chat sidebar entry, four community channels, owner/member accounts, persistent private messages, live delivery, editable profiles with banner/avatar, and owner moderation. Server permissions are independent of UI controls. The owner must claim a private setup code from `data/community/owner-setup.txt`; first signup alone does not grant ownership.

Runtime: pinned SJv2/controller, libcurl, Wispurr. Build patches the omitted/null history URL regression and libcurl socket cleanup. Automated checks cover these areas plus profile and room permissions. Community data is a private JSON store for a single process and excluded from version control. Back it up before deployment.

AI setup is explicitly deferred by the user until a new VPS/domain is available. `/api/ai` returns an unconfigured response. No credentials were taken from the Nyx VPS. No public Novene deployment or DNS setup has happened.

Browser checks use real Chromium, isolated temporary accounts for chat, and fresh browser contexts for wallpapers. Third-party search providers may challenge connections; do not describe a CAPTCHA response as successful search results.

Live search check: Brave and Google returned upstream HTTP429/challenge responses on this connection. HTTPS document loading and Google nested challenge assets load through the bridge, but successful search results were not verified. Preserve this limitation in release notes.
