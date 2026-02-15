<div align="center">
<img src="assets/banner.png" alt="npmx.dev for Raycast banner">
</div>

Raycast extension for searching npm packages with data from the [npmx.dev](https://npmx.dev) API.

> [!IMPORTANT]
> This project is still in active development and is not finished yet.

## What It Does

`npmx.dev` helps you quickly inspect package quality and metadata without leaving Raycast.

### Highlights

- Search npm packages directly from Raycast.
- Enrich results with additional package insights:
  - GitHub stars
  - Provenance status/provider
  - Version-distribution downloads
- Open useful links in one step:
  - Repository
  - Changelog (GitHub releases)
  - npmx package page
  - Issues/Bugs
  - Bundlephobia
- Preview package README inside Raycast.
- Copy install commands for `npm`, `yarn`, `pnpm`, and `bun`.
- Persist search/package history with configurable history size.

## Screenshots

<!-- Replace placeholders with real screenshots when ready -->

![Search results placeholder](./assets/screenshots/search-results.png)
![Package actions placeholder](./assets/screenshots/package-actions.png)
![README preview placeholder](./assets/screenshots/readme-preview.png)

## Preferences

The extension supports configurable preferences in Raycast:

- Default and secondary package manager for copy actions
- Default open action for package entries
- History count
- Optional "View on npmx.dev" search-result row
- Search strategy (`hybrid` or `opensearch`)

## Development

### Requirements

- Node.js (LTS recommended)
- pnpm
- Raycast

### Install

```bash
pnpm install
```

### Run in development

```bash
pnpm dev
```

### Quality checks

```bash
pnpm test:tscheck
pnpm test:lint
```

### Build

```bash
pnpm build
```

## Publish

```bash
pnpm publish
```

## License

MIT
