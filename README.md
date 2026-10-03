## LJNodes search compatibility fix

Based on [ComfyUI-LJNodes](https://github.com/coolzilj/ComfyUI-LJNodes) by Jin Liu (`coolzilj`). This repository provides a search compatibility fix. The original MIT license and author attribution are preserved in [LICENSE](LICENSE) and [ATTRIBUTION.md](ATTRIBUTION.md).

#### About:

The repair preserves ComfyUI's `allow_searchbox` value rather than enabling legacy search on every click. The temporary suppression used for group-title editing now restores the previous value, including when the wrapped handler throws.

#### Other LJNodes helpers are unchanged.

The original `js/ui_helpers.js` is backed up beside the installed helper as `ui_helpers.js.before-search-fix-20261003.bak`. It is an exact copy of the file before this repair, verified with SHA256:
`EF8B2F8A6E35421720C39EA8D22A62C7B7AEC8E616816B953D74971E1F23DE3C`.

#### Installation and usage:

Download [ui_helpers.zip from the latest release](https://github.com/Adahm83/LJNodes-search-compatibility-fix/releases/latest/download/ui_helpers.zip). Use this installation archive, not GitHub's automatically generated source-code archives.

Unpack files to: `ComfyUI-LJNodes/js/`, overwrite existing file.

After installation, save the current workflow and refresh the ComfyUI page with **Ctrl+F5**. No backend restart is needed for this JavaScript-only repair. Choose `default` under Node search box implementation to use the new popup; it already focuses its search field when opened.

To undo the repair, copy `ui_helpers.js.before-search-fix-20261003.bak` over the installed `ComfyUI-LJNodes/js/ui_helpers.js`, then refresh the page. An LJNodes update may overwrite the local repair. Keep this backup and the tested staging copy under the workspace `work/ljnodes-search-fix-20261003` folder.

Verification on 2026-10-03: all nine behavior tests and the JavaScript syntax check passed against the installed helper. ComfyUI served the exact repaired file. In a separate browser tab, double-clicking empty canvas displayed only the new search popup, with `Add a node...` focused automatically. No nodes were added and no workflow was saved during verification.
