(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/AppGuides.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
const TWBS_DOCS_URL = "https://getbootstrap.com/docs/5.3";
const GUIDES = [
    {
        url: `${TWBS_DOCS_URL}/getting-started/introduction/`,
        title: "Bootstrap quick start guide"
    },
    {
        url: `${TWBS_DOCS_URL}/getting-started/webpack/`,
        title: "Bootstrap Webpack guide"
    },
    {
        url: `${TWBS_DOCS_URL}/getting-started/parcel/`,
        title: "Bootstrap Parcel guide"
    },
    {
        url: `${TWBS_DOCS_URL}/getting-started/vite/`,
        title: "Bootstrap Vite guide"
    },
    {
        url: `${TWBS_DOCS_URL}/getting-started/contribute/`,
        title: "Contributing to Bootstrap"
    }
];
const AppGuides = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Guides"
            }, void 0, false, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/AppGuides.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Read more detailed instructions and documentation on using or contributing to Bootstrap."
            }, void 0, false, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/AppGuides.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            GUIDES.map((guide)=>{
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    className: "d-flex align-items-center mb-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            width: "24",
                            height: "24",
                            fill: "currentColor",
                            className: "bi bi-arrow-right-circle-fill me-2",
                            viewBox: "0 0 16 16",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"
                            }, void 0, false, {
                                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/AppGuides.tsx",
                                lineNumber: 45,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/AppGuides.tsx",
                            lineNumber: 37,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: guide.url,
                            target: "_blank",
                            rel: "noopener",
                            children: guide.title
                        }, void 0, false, {
                            fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/AppGuides.tsx",
                            lineNumber: 47,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, guide.title, true, {
                    fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/AppGuides.tsx",
                    lineNumber: 36,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0));
            })
        ]
    }, void 0, true);
};
_c = AppGuides;
const __TURBOPACK__default__export__ = AppGuides;
var _c;
__turbopack_context__.k.register(_c, "AppGuides");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Footer.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
const Footer = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                className: "mt-5 mb-4"
            }, void 0, false, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Footer.tsx",
                lineNumber: 4,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-muted",
                children: "Created and open sourced by the Bootstrap team. Licensed MIT."
            }, void 0, false, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Footer.tsx",
                lineNumber: 5,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Footer.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Footer;
const __TURBOPACK__default__export__ = Footer;
var _c;
__turbopack_context__.k.register(_c, "Footer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/next/link.js [client] (ecmascript)");
;
;
const Header = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "d-flex justify-content-between align-items-md-center pb-3 mb-5 border-bottom",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "h4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "d-flex align-items-center text-dark text-decoration-none",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            width: "32",
                            height: "32",
                            fill: "currentColor",
                            className: "bi bi-bootstrap-fill d-inline-block me-2",
                            viewBox: "0 0 16 16",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M6.375 7.125V4.658h1.78c.973 0 1.542.457 1.542 1.237 0 .802-.604 1.23-1.764 1.23zm0 3.762h1.898c1.184 0 1.81-.48 1.81-1.377 0-.885-.65-1.348-1.886-1.348H6.375z"
                                }, void 0, false, {
                                    fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx",
                                    lineNumber: 19,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M4.002 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4zm1.06 12V3.545h3.399c1.587 0 2.543.809 2.543 2.11 0 .884-.65 1.675-1.483 1.816v.1c1.143.117 1.904.931 1.904 2.033 0 1.488-1.084 2.396-2.888 2.396z"
                                }, void 0, false, {
                                    fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx",
                                    lineNumber: 20,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx",
                            lineNumber: 11,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "React"
                        }, void 0, false, {
                            fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx",
                    lineNumber: 7,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx",
                lineNumber: 6,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: "https://github.com/twbs/examples/tree/main/react-nextjs/",
                target: "_blank",
                rel: "noopener",
                children: "View on GitHub"
            }, void 0, false, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx",
        lineNumber: 5,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Header;
const __TURBOPACK__default__export__ = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExamplePopover.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Anchor$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react-bootstrap/esm/Anchor.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$OverlayTrigger$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react-bootstrap/esm/OverlayTrigger.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Popover$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react-bootstrap/esm/Popover.js [client] (ecmascript)");
;
;
;
;
const ExamplePopover = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$OverlayTrigger$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
        trigger: "click",
        placement: "right",
        overlay: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Popover$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Popover$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Header, {
                    as: "h3",
                    children: "Custom popover"
                }, void 0, false, {
                    fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExamplePopover.tsx",
                    lineNumber: 12,
                    columnNumber: 11
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Popover$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Body, {
                    children: "This is a Bootstrap popover."
                }, void 0, false, {
                    fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExamplePopover.tsx",
                    lineNumber: 13,
                    columnNumber: 11
                }, void 0)
            ]
        }, void 0, true, {
            fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExamplePopover.tsx",
            lineNumber: 11,
            columnNumber: 9
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Anchor$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
            className: "text-success",
            children: "Example popover"
        }, void 0, false, {
            fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExamplePopover.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExamplePopover.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = ExamplePopover;
const __TURBOPACK__default__export__ = ExamplePopover;
var _c;
__turbopack_context__.k.register(_c, "ExamplePopover");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Button$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react-bootstrap/esm/Button.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Dropdown$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react-bootstrap/esm/Dropdown.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$DropdownButton$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react-bootstrap/esm/DropdownButton.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Offcanvas$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react-bootstrap/esm/Offcanvas.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
const ExampleOffcanvas = ({ className })=>{
    _s();
    const [show, setShow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Button$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                onClick: ()=>setShow((s)=>!s),
                className: className,
                children: "Toggle offcanvas"
            }, void 0, false, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Offcanvas$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                placement: "end",
                show: show,
                onHide: ()=>setShow(false),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Offcanvas$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Header, {
                        closeButton: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Offcanvas$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Title, {
                            as: "h5",
                            children: "Offcanvas"
                        }, void 0, false, {
                            fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                            lineNumber: 21,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Offcanvas$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Body, {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: "Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc."
                            }, void 0, false, {
                                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                                lineNumber: 24,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$DropdownButton$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                variant: "secondary",
                                title: "Dropdown button",
                                className: "mt-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Dropdown$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Item, {
                                        href: "#",
                                        children: "Action"
                                    }, void 0, false, {
                                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                                        lineNumber: 34,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Dropdown$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Item, {
                                        href: "#",
                                        children: "Another action"
                                    }, void 0, false, {
                                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                                        lineNumber: 35,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Dropdown$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Item, {
                                        href: "#",
                                        children: "Something else here"
                                    }, void 0, false, {
                                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                                        lineNumber: 36,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
_s(ExampleOffcanvas, "NKb1ZOdhT+qUsWLXSgjSS2bk2C4=");
_c = ExampleOffcanvas;
const __TURBOPACK__default__export__ = ExampleOffcanvas;
var _c;
__turbopack_context__.k.register(_c, "ExampleOffcanvas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleComponents.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Col$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react-bootstrap/esm/Col.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$ExamplePopover$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExamplePopover.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$ExampleOffcanvas$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleOffcanvas.tsx [client] (ecmascript)");
;
;
;
;
const ExampleComponents = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Col$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                lg: 8,
                className: "px-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "fs-4",
                        children: [
                            "You've successfully loaded the Bootstrap + React example! It's loaded up with ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://getbootstrap.com/",
                                children: "Bootstrap 5"
                            }, void 0, false, {
                                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleComponents.tsx",
                                lineNumber: 11,
                                columnNumber: 19
                            }, ("TURBOPACK compile-time value", void 0)),
                            " and uses React and Next.js to compile and bundle our Sass. It also features a handful of custom React components built using",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://react-bootstrap.github.io/",
                                children: "React Bootstrap"
                            }, void 0, false, {
                                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleComponents.tsx",
                                lineNumber: 14,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleComponents.tsx",
                        lineNumber: 9,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "If this button appears blue and the link appears purple, you've done it!"
                    }, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleComponents.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleComponents.tsx",
                lineNumber: 8,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$ExampleOffcanvas$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                className: "me-3"
            }, void 0, false, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleComponents.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$ExamplePopover$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleComponents.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
_c = ExampleComponents;
const __TURBOPACK__default__export__ = ExampleComponents;
var _c;
__turbopack_context__.k.register(_c, "ExampleComponents");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/next/head.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Container$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/node_modules/react-bootstrap/esm/Container.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$AppGuides$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/AppGuides.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$Footer$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Footer.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$Header$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/Header.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$ExampleComponents$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/components/ExampleComponents.tsx [client] (ecmascript)");
;
;
;
;
;
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                        children: "Bootstrap w/ React"
                    }, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 12,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "description",
                        content: "Generated by create next app"
                    }, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1"
                    }, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 14,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        href: "/favicon.ico"
                    }, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Container$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                as: "main",
                className: "py-4 px-3 mx-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$Header$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: "Build Bootstrap with React"
                    }, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$ExampleComponents$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                        className: "col-1 my-5 mx-0"
                    }, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$AppGuides$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$EITI$2f$PAP$2f$project$2f$FrontendWebApp$2f$examples$2f$react$2d$nextjs$2f$src$2f$components$2f$Footer$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/EITI/PAP/project/FrontendWebApp/examples/react-nextjs/src/pages/index.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__82ae46f0._.js.map