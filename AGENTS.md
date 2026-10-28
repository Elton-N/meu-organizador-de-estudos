<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep task domain logic in a browser-safe module and use React session state until remote persistence is requested and its access model is approved; this preserves the existing no-login workflow.
- Write all app code in JavaScript/JSX (routes, lib, hooks, components, tests, server entry); only auto-generated files (src/integrations/supabase/*, src/routeTree.gen.ts) and tool configs (vite.config.ts, vitest.config.ts, tsconfig.json) stay in TypeScript because the tooling regenerates or requires them.
- Use semantic priority color tokens for task signals so labels remain readable and themes stay consistent.
- Do not implement or enable SMS delivery until a provider connection is linked; never represent local scheduling as an active SMS reminder.
