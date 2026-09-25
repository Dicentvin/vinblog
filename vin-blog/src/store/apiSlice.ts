diff --git a/vin-blog/src/store/apiSlice.ts b/vin-blog/src/store/apiSlice.ts
index a0de3dc..c31b8f9 100644
--- a/vin-blog/src/store/apiSlice.ts
+++ b/vin-blog/src/store/apiSlice.ts
@@ -145,14 +145,14 @@ export const apiSlice = createApi({
     }),
 
     // ── AI assist ─────────────────────────────────────────────────────────────
-    aiAssist: builder.mutation
+    aiAssist: builder.mutation<
       { requestId: string; status: string; result?: string },
       { type: string; content?: string; title?: string }
     >({
       query: body => ({ url: '/api/ai/assist', method: 'POST', body }),
     }),
 
-    getAiResult: builder.query
+    getAiResult: builder.query<
       { id: string; status: string; result?: string; type: string },
       string
     >({
