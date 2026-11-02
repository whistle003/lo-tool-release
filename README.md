# LO Tool Release

A shared build and release hub for LO tools, with an Astro download site powered by GitHub Releases.

## Tomato branch

This branch builds `whistle003/g-wolf-toolkit` and publishes only to `whistle003/lo-tool-release`. Source tags must be reachable from the source `tomato` branch. See [Tomato setup](docs/tomato-release.md) for local commands and first-time GitHub configuration.

## Development

Requires Bun 1.4+.

```sh
bun install --frozen-lockfile
bun run dev
```

Local site: <http://127.0.0.1:4321/>.

## Build

```sh
bun run sync      # Update the release snapshot
bun run verify    # Run tests, type checks, and build
bun run preview   # Preview the build locally
```

Build output: `dist/`. Use `bun run build` to build without running checks.

## Releases

Publish releases with tags such as `tool-name/v1.0.0`. The site automatically groups releases by tool and lists their download assets.

Use `Tool Name v1.0.0` as the release title. Put concise user-facing changes in `notes/<tool-id>/<version>.md`; publishing uses that file, or the registered description when no changelog exists. Keep installation instructions in the packaged README. Release bodies do not append build metadata or source identifiers.

For automated builds, register the source repository, runner, and ZIP filenames in `catalog/builds.json`. Each source repository provides a `.github/actions/build-release` composite action accepting a `version` input.

G-Wolf Toolkit uses `g-wolf-toolkit/v...` tags. The `df-assembly-tool` identifier is retained as a registry alias for historical build requests and catalogue grouping; old releases and links remain valid. Version 0.1.20 also has a one-time `df-assembly-tool/v0.1.20` upgrade entry with the same checked ZIP for clients whose updater only recognises the old prefix. It is not marked latest; future builds publish only the canonical tag. Keep both prefixes grouped on the site and prefer canonical assets for the same version.

Source publish commands push a tag and send `workflow_dispatch` to `release.yml` with `ref=tomato` and inputs `tool`, `tag`, `sha`. `Release Tomato` resolves the tag, verifies its immutable SHA and membership in the source `tomato` branch, builds, and publishes. It can also be started manually with the `tomato` ref. Plain source tag pushes do not publish.

Public source uses the hub's `GITHUB_TOKEN`; private source can supply the optional `SOURCE_TOKEN` secret with Contents read access. Publication is restricted to `whistle003/lo-tool-release` on `tomato` and uses that repository's own `GITHUB_TOKEN`.

The `Site Tomato` workflow builds pushes and PRs targeting `tomato`, plus explicit manual dispatches. Only non-PR runs on `tomato` deploy, using the separate `tomato-pages` environment and `https://whistle003.github.io/lo-tool-release/`. After a successful release, the release workflow explicitly dispatches `pages.yml` at `tomato`. There is no `workflow_run` subscription that could load a workflow from the default branch.

Both workflow files already exist in the cloned default branch, which is required for manual dispatch registration. Keep the main branches unchanged; the selected ref supplies the tomato workflow contents. The new release workflow name also avoids the old default-branch site's `Release` subscription. Repository Pages must use GitHub Actions, and the `tomato-pages` environment must permit the `tomato` branch before deployment.
