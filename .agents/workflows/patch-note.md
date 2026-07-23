---
description: Add patch notes, update the current version, update README, and verify build
---

# Add Patch Notes & Update README Workflow

When executing a release or patch note update:

1. **Update `components/patch-notes-modal.tsx`:**
   - Prepend a new entry to the `PATCH_NOTES` array following the `PatchEntry` type:
     ```ts
     {
       version: "vX.Y.Z",
       date: "YYYY-MM-DD",
       title: "Feature Title",
       emoji: "🚀",
       changes: [
         { type: "new", text: "Added feature..." },
         { type: "improve", text: "Enhanced performance..." },
         { type: "fix", text: "Fixed bug..." },
       ],
     }
     ```
   - **CRITICAL:** Update the `CURRENT_VERSION` constant at the top of the file to match the new version string (e.g., `"v1.2.0"`).
   - Ensure `STORAGE_KEY` dynamically uses `CURRENT_VERSION` or matches the new version format.

2. **Sync Documentation (`README.md`):**
   - Review changes in the patch and update `README.md` if any **Key Features**, **Tech Stack**, or **Database Schemas** were modified.

3. **Build & Type Check:**
   - Run `npm run build` in the terminal to ensure no TypeScript, syntax, or bundler errors were introduced.