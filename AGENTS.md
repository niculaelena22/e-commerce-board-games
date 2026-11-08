# Spree Commerce Project

Instructions for coding agents. `CLAUDE.md` only imports this file — edit this one.

## Project Structure

| Directory | Description | Agent instructions |
|-----------|-------------|--------------------|
| `server/` | The Spree API — a Rails application | `server/AGENTS.md` |
| `apps/dashboard/` | Admin Dashboard — React SPA | `apps/dashboard/AGENTS.md` |
| `apps/storefront/` | Next.js storefront | `apps/storefront/CLAUDE.md` |

Read the instructions for the directory you are working in before changing anything there.

## Run everything through the Spree CLI

The Spree API, its database and its background jobs run in Docker containers managed by
the Spree CLI (`@spree/cli`, installed in this directory). The CLI is the only supported
way to run commands against the API.

- Run it from this directory as `npx spree <command>`.
- **Never run `bin/rails`, `bin/rake`, `rake`, `bundle`, `rspec`, `bin/setup`, `bin/dev`, `ruby` or `rails` directly** —
  not on the host and not through `docker compose exec`. They run against the wrong Ruby, the
  wrong database, or no database at all.
- **Never call `docker compose` directly.** The CLI picks the right compose files and environment.
- **Don't use the `package.json` scripts in this directory** (`npm run dev`, `npm run console`, …).
  They are shortcuts for humans that wrap the CLI — call the CLI command itself.
- When no dedicated command exists, fall back to `npx spree rails <args>`, `npx spree rake <task>` or
  `npx spree exec <command>`, which run inside the container.

The apps under `apps/` are ordinary JavaScript projects with their own tooling — inside them,
follow their own instructions.

```bash
npx spree dev --no-open          # start the stack in the foreground (the developer usually has it running)
npx spree stop                   # stop it
npx spree restart                # reload after initializer changes
npx spree logs                   # API logs
npx spree console                # Rails console
npx spree migrate                # run pending migrations
npx spree generate <generator>   # Rails and Spree generators
npx spree add <extension>        # install an extension end to end (stripe, paypal, avatax, …)
npx spree bundle add <gem>       # add any other gem
npx spree rspec [path]           # run tests against the test database
npx spree routes                 # list routes
npx spree --help                 # every command
```

`server/AGENTS.md` maps every Rails command to its CLI equivalent.

Never run `npx spree db:reset` or `npx spree eject` without asking the developer first. The same goes for
`npx spree add <extension>` on a project that is not ejected, because it ejects the project.

### Changes to `server/` need an ejected project

A new project runs the prebuilt Spree Docker image, so edits in `server/` — including files
written by `npx spree generate` and gems added with `npx spree bundle` — have no effect until the
developer runs `npx spree eject`, which builds the API from `server/` with live reloading. The
project is ejected when `docker-compose.yml` mounts `./server:/rails`.

## Querying the Admin API

Project setup mints a read-only secret key into `.spree/credentials.json`
(gitignored) — and `spree api` mints it on first use if setup was skipped —
so the Admin API client works without further configuration. Use it to
inspect live data instead of guessing at the schema:

```bash
npx spree api get products                      # list products
npx spree api get orders -q status_eq=placed    # Ransack filters
npx spree api endpoints                         # every endpoint + its required scope
npx spree api schema "POST /products"           # request/response schema for an operation
```

The default key is read-only. For writes, create a scoped key and pass it via
`SPREE_API_KEY`: `npx spree api-key create --name "Agent writes" --type secret --scopes write_products`, then
`SPREE_API_KEY=sk_... npx spree api post products --data '{"name":"New product","prices":[{"currency":"USD","amount":"29.99"}]}'`.

## Spree Documentation

The full developer documentation is installed locally as Markdown:

```
node_modules/@spree/docs/dist/
├── developer/
│   ├── core-concepts/     # Products, orders, payments, inventory, etc.
│   ├── customization/     # Events, workflow hooks, dependencies, extensions
│   ├── cli/               # Every Spree CLI command
│   ├── dashboard/         # Admin Dashboard: customization, recipes, plugins
│   ├── storefront/        # Storefront building guides
│   ├── sdk/               # TypeScript SDK documentation
│   └── tutorial/          # Step-by-step tutorials
├── api-reference/
│   ├── store-api/         # Store API v3 guides
│   ├── admin-api/         # Admin API v3 guides
│   ├── store.yaml         # Store API OpenAPI spec (endpoints, params, schemas)
│   └── admin.yaml         # Admin API OpenAPI spec
└── integrations/          # Stripe, Meilisearch, etc.
```

Read these files when you need Spree-specific guidance.

## Spree agent skills

The official Spree skills cover API conventions, the data model, events, testing,
security, deployment, the Admin Dashboard and the storefront. If `.agents/skills/`
is missing, install them with `npx spree add ai --no-mcp`.

## Searching the Spree docs

The `spree-docs` MCP server (configured in `.mcp.json`, `.cursor/mcp.json` and
`.vscode/mcp.json`) searches the latest published Spree docs.
Use it when you do not know which page covers a topic, then read the page from
`node_modules/@spree/docs/dist/`. The server can be ahead of the Spree version this
project runs — when the two disagree, the local files are right for this project.
