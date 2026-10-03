import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

const filename = process.env.LJNODES_UI_FILE ?? new URL("../ui_helpers.js", import.meta.url);
const source = fs.readFileSync(filename, "utf8");
const original = fs.readFileSync(new URL("./fixtures/ui_helpers.upstream.js", import.meta.url), "utf8");

function fixture({ implementation = "default", modern = true, enabled = !modern, group = null } = {}) {
    const events = [];
    const settings = new Map([["Comfy.NodeSearchBoxImpl", implementation]]);
    let clock = 1000;
    let fail = false;
    class FakeCanvas {
        constructor() {
            this.allow_searchbox = enabled;
            this.graph = { getGroupOnPos: () => group };
            this.selected_group = null;
            this.dragging_canvas = true;
        }
        adjustMouseEvent(event) { event.canvasX = 100; event.canvasY = 100; }
        processMouseDown(event) {
            events.push({ kind: "base", flag: this.allow_searchbox });
            if (fail) throw new Error("base handler failed");
            // Match installed LiteGraph's empty-double-click paths: the
            // canvas flag opens legacy search directly, then the current
            // frontend event listener opens the chosen implementation.
            if (event.double && !group) {
                if (this.allow_searchbox) events.push({ kind: "legacy" });
                if (modern) events.push({ kind: implementation === "litegraph (legacy)" ? "legacy" : "new" });
            }
            return "base result";
        }
        processKey() { return "key result"; }
    }
    class FakeNode {}
    const context = {
        app: { registerExtension() {}, ui: { settings: {
            getSettingValue: (id, fallback) => settings.has(id) ? settings.get(id) : fallback,
        } } },
        LGraphCanvas: FakeCanvas,
        LGraphNode: FakeNode,
        LiteGraph: {},
        clickedOnGroupTitle: () => group?.titleHit === true,
        window: { prompt: () => { events.push({ kind: "rename" }); return "Renamed"; } },
        Date: class { getTime() { return clock; } },
    };
    // Execute the actual helper, supplying only its imported dependencies.
    vm.runInNewContext(source.replace(/^import[\s\S]*?;\r?\n/gm, ""), context, { filename: String(filename) });
    const canvas = new FakeCanvas();
    return {
        canvas, events, settings,
        click(double = false) { clock += 100; return canvas.processMouseDown({ double }); },
        setFailure(value) { fail = value; },
    };
}

for (const implementation of ["default", "v1 (legacy)"]) {
    test(`${implementation}: only the selected modern search opens`, () => {
        const f = fixture({ implementation });
        assert.equal(f.click(), "base result");
        assert.equal(f.click(true), "base result");
        assert.deepEqual(f.events.filter(e => ["legacy", "new"].includes(e.kind)), [{ kind: "new" }]);
        assert.equal(f.canvas.allow_searchbox, false);
    });
}

test("explicit LiteGraph selection opens legacy once through the current frontend", () => {
    const f = fixture({ implementation: "litegraph (legacy)" });
    f.click(); f.click(true);
    assert.deepEqual(f.events.filter(e => ["legacy", "new"].includes(e.kind)), [{ kind: "legacy" }]);
});

test("older frontend keeps its enabled legacy search flag", () => {
    const f = fixture({ modern: false, enabled: true });
    f.click(); f.click(true);
    assert.equal(f.canvas.allow_searchbox, true);
    assert.deepEqual(f.events.filter(e => e.kind === "legacy"), [{ kind: "legacy" }]);
});

test("explicitly disabled search stays disabled on older frontends", () => {
    const f = fixture({ modern: false, enabled: false });
    f.click(); f.click(true);
    assert.equal(f.canvas.allow_searchbox, false);
    assert.equal(f.events.filter(e => e.kind === "legacy").length, 0);
});

for (const enabled of [false, true]) {
    test(`group-title rename restores previous search flag ${enabled}`, () => {
        const group = { title: "Original", titleHit: true };
        const f = fixture({ enabled, group });
        f.click(); f.click(true);
        assert.equal(group.title, "Renamed");
        assert.equal(f.events.at(-1).flag, false);
        assert.equal(f.canvas.allow_searchbox, enabled);
        assert.equal(f.canvas.selected_group, null);
        assert.equal(f.canvas.dragging_canvas, false);
    });
}

test("group-title handling restores search state even if the base handler throws", () => {
    const f = fixture({ enabled: true, group: { title: "Original", titleHit: true } });
    f.click(); f.setFailure(true);
    assert.throws(() => f.click(true), /base handler failed/);
    assert.equal(f.canvas.allow_searchbox, true);
    assert.equal(f.canvas.selected_group, null);
});

test("other LJNodes extension hooks and keyboard/reroute helpers are unchanged", () => {
    const beforeMouse = text => text.slice(0, text.indexOf("let lastClickedTime;"));
    const afterMouse = text => text.slice(text.indexOf("const origProcessKey"));
    const normalize = text => text.replace(/\r\n/g, "\n");
    assert.equal(normalize(beforeMouse(source)), normalize(beforeMouse(original)));
    assert.equal(normalize(afterMouse(source)), normalize(afterMouse(original)));
});
