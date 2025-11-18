(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Omi-AI-1/context/guest-mode-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GuestModeProvider",
    ()=>GuestModeProvider,
    "useGuestMode",
    ()=>useGuestMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/next@16.0.3_@opentelemetry+_162ef2eee2977cfe0d3476575909914c/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/next@16.0.3_@opentelemetry+_162ef2eee2977cfe0d3476575909914c/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const GuestModeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const STORAGE_KEY = "omi_guest_mode";
function GuestModeProvider({ children }) {
    _s();
    const [isGuestMode, setIsGuestMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GuestModeProvider.useEffect": ()=>{
            try {
                const stored = window.localStorage.getItem(STORAGE_KEY);
                setIsGuestMode(stored === "true");
            } catch (error) {
                console.warn("Unable to read guest mode flag", error);
            }
        }
    }["GuestModeProvider.useEffect"], []);
    const updateGuestMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GuestModeProvider.useCallback[updateGuestMode]": (value)=>{
            setIsGuestMode(value);
            try {
                window.localStorage.setItem(STORAGE_KEY, value.toString());
            } catch (error) {
                console.warn("Unable to persist guest mode flag", error);
            }
        }
    }["GuestModeProvider.useCallback[updateGuestMode]"], []);
    const clearGuestMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GuestModeProvider.useCallback[clearGuestMode]": ()=>{
            setIsGuestMode(false);
            try {
                window.localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                console.warn("Unable to clear guest mode flag", error);
            }
        }
    }["GuestModeProvider.useCallback[clearGuestMode]"], []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GuestModeProvider.useMemo[value]": ()=>({
                isGuestMode,
                setGuestMode: updateGuestMode,
                clearGuestMode
            })
    }["GuestModeProvider.useMemo[value]"], [
        clearGuestMode,
        isGuestMode,
        updateGuestMode
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GuestModeContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Omi-AI-1/context/guest-mode-context.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_s(GuestModeProvider, "VCE4FZvCqZZvtIjsUsBm4QNiCnI=");
_c = GuestModeProvider;
function useGuestMode() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(GuestModeContext);
    if (!context) {
        throw new Error("useGuestMode must be used within GuestModeProvider");
    }
    return context;
}
_s1(useGuestMode, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "GuestModeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Omi-AI-1/lib/supabase-browser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBrowserSupabaseClient",
    ()=>getBrowserSupabaseClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/next@16.0.3_@opentelemetry+_162ef2eee2977cfe0d3476575909914c/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$81$2e$1$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/@supabase+supabase-js@2.81.1/node_modules/@supabase/supabase-js/dist/module/index.js [app-client] (ecmascript) <locals>");
"use client";
;
let browserClient = null;
function getBrowserSupabaseClient() {
    if (!browserClient) {
        const url = ("TURBOPACK compile-time value", "https://cnysdbjajxnpmrugnpme.supabase.co") || "https://placeholder.supabase.co";
        const anonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueXNkYmphanhucG1ydWducG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzA4MzUsImV4cCI6MjA3NTU0NjgzNX0.H5AvV68Br-taWHCQdD1QOmKf-TXK9zlBGzUW8nOT_d4") || "placeholder-key";
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        browserClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$81$2e$1$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
        });
    }
    return browserClient;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Omi-AI-1/context/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/next@16.0.3_@opentelemetry+_162ef2eee2977cfe0d3476575909914c/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/next@16.0.3_@opentelemetry+_162ef2eee2977cfe0d3476575909914c/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$lib$2f$supabase$2d$browser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/lib/supabase-browser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$context$2f$guest$2d$mode$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/context/guest-mode-context.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AuthProvider.useMemo[supabase]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$lib$2f$supabase$2d$browser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBrowserSupabaseClient"])()
    }["AuthProvider.useMemo[supabase]"], []);
    const { isGuestMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$context$2f$guest$2d$mode$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGuestMode"])();
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            let subscription = null;
            if (isGuestMode) {
                setSession(null);
                setUser(null);
                setLoading(false);
                return ({
                    "AuthProvider.useEffect": ()=>{
                        subscription?.data.subscription.unsubscribe();
                    }
                })["AuthProvider.useEffect"];
            }
            supabase.auth.getSession().then({
                "AuthProvider.useEffect": ({ data })=>{
                    setSession(data.session);
                    setUser(data.session?.user ?? null);
                }
            }["AuthProvider.useEffect"]).finally({
                "AuthProvider.useEffect": ()=>setLoading(false)
            }["AuthProvider.useEffect"]);
            subscription = supabase.auth.onAuthStateChange({
                "AuthProvider.useEffect": (_event, nextSession)=>{
                    setSession(nextSession);
                    setUser(nextSession?.user ?? null);
                }
            }["AuthProvider.useEffect"]);
            return ({
                "AuthProvider.useEffect": ()=>{
                    subscription?.data.subscription.unsubscribe();
                }
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], [
        isGuestMode,
        supabase
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AuthProvider.useMemo[value]": ()=>({
                session,
                user,
                loading
            })
    }["AuthProvider.useMemo[value]"], [
        loading,
        session,
        user
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Omi-AI-1/context/auth-context.tsx",
        lineNumber: 66,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "/A6lLMfWoLbzZzZSmykPDfMe4Po=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$context$2f$guest$2d$mode$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGuestMode"]
    ];
});
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Omi-AI-1/lib/sentry-client.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initSentry",
    ()=>initSentry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/next@16.0.3_@opentelemetry+_162ef2eee2977cfe0d3476575909914c/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f40$sentry$2b$browser$40$10$2e$25$2e$0$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$dev$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/@sentry+browser@10.25.0/node_modules/@sentry/browser/build/npm/esm/dev/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f40$sentry$2b$browser$40$10$2e$25$2e$0$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$dev$2f$sdk$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/@sentry+browser@10.25.0/node_modules/@sentry/browser/build/npm/esm/dev/sdk.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f40$sentry$2b$browser$40$10$2e$25$2e$0$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$dev$2f$tracing$2f$browserTracingIntegration$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/@sentry+browser@10.25.0/node_modules/@sentry/browser/build/npm/esm/dev/tracing/browserTracingIntegration.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f40$sentry$2d$internal$2b$replay$40$10$2e$25$2e$0$2f$node_modules$2f40$sentry$2d$internal$2f$replay$2f$build$2f$npm$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/@sentry-internal+replay@10.25.0/node_modules/@sentry-internal/replay/build/npm/esm/index.js [app-client] (ecmascript)");
"use client";
;
function initSentry() {
    const sentryDsn = __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
        __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f40$sentry$2b$browser$40$10$2e$25$2e$0$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$dev$2f$sdk$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["init"]({
            dsn: sentryDsn,
            integrations: [
                __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f40$sentry$2b$browser$40$10$2e$25$2e$0$2f$node_modules$2f40$sentry$2f$browser$2f$build$2f$npm$2f$esm$2f$dev$2f$tracing$2f$browserTracingIntegration$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserTracingIntegration"](),
                __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f40$sentry$2d$internal$2b$replay$40$10$2e$25$2e$0$2f$node_modules$2f40$sentry$2d$internal$2f$replay$2f$build$2f$npm$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["replayIntegration"]()
            ],
            tracesSampleRate: 1.0,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            environment: ("TURBOPACK compile-time value", "development")
        });
    }
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Omi-AI-1/components/providers/app-providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProviders",
    ()=>AppProviders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/next@16.0.3_@opentelemetry+_162ef2eee2977cfe0d3476575909914c/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/node_modules/.pnpm/next@16.0.3_@opentelemetry+_162ef2eee2977cfe0d3476575909914c/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$context$2f$guest$2d$mode$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/context/guest-mode-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$context$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Omi-AI-1/context/auth-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$lib$2f$sentry$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Omi-AI-1/lib/sentry-client.ts [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function AppProviders({ children }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProviders.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$lib$2f$sentry$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initSentry"])();
        }
    }["AppProviders.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$context$2f$guest$2d$mode$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GuestModeProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_$40$opentelemetry$2b$_162ef2eee2977cfe0d3476575909914c$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Omi$2d$AI$2d$1$2f$context$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: children
        }, void 0, false, {
            fileName: "[project]/Omi-AI-1/components/providers/app-providers.tsx",
            lineNumber: 15,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Omi-AI-1/components/providers/app-providers.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_s(AppProviders, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = AppProviders;
var _c;
__turbopack_context__.k.register(_c, "AppProviders");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Omi-AI-1_d9e21269._.js.map