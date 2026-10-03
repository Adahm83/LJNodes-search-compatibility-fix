# Verification

Run from the repository root with Node.js (no package installation needed):

```powershell
node --test tests/search_behavior.test.mjs
Get-Content -Raw ui_helpers.js | node --input-type=module --check
```

The tests cover current frontend search selection, older frontends, disabled search, group-title editing, exception-safe restoration, and unchanged keyboard/reroute helpers. They execute the actual helper with stubbed imports and model the installed frontend's search dispatch; they are not browser tests.

Live verification on 2026-10-03 used the installed ComfyUI frontend 1.53.10: empty-canvas double-click opened only the new popup, with the search input focused. Other frontend versions have automated compatibility coverage only.

SHA256 of the repaired helper inside the installation archive:
`722485C4D7260562E7195AD769D11CE5421F0C81BDB7738D58C879B4DBF4BE47`.

SHA256 of the bundled original backup:
`EF8B2F8A6E35421720C39EA8D22A62C7B7AEC8E616816B953D74971E1F23DE3C`.

The supplied archive is preserved byte-for-byte for upload. Its two entries match the installed helper and original backup byte-for-byte, including CRLF line endings. The repository source and upstream test fixture use LF line endings; their text matches the archive after newline normalization. The test fixture is not an installation backup.
