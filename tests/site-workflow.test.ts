import { expect, test } from 'bun:test'

async function workflow(name: string) {
  return Bun.YAML.parse(
    await Bun.file(
      new URL(`../.github/workflows/${name}.yml`, import.meta.url),
    ).text(),
  ) as Record<string, any>
}

test('Pages builds tomato and uses explicit dispatch instead of default-branch events', async () => {
  const site = await workflow('pages')
  expect(site.on.release).toBeUndefined()
  expect(site.on.workflow_run).toBeUndefined()
  expect(site.on.push.branches).toEqual(['tomato'])
  expect(site.on.pull_request.branches).toEqual(['tomato'])
  expect(Object.keys(site.on)).toContain('workflow_dispatch')
  expect(site.jobs.build.if).toContain(
    "github.repository == 'whistle003/lo-tool-release'",
  )
  expect(site.jobs.build.if).toContain("github.ref == 'refs/heads/tomato'")
  expect(
    await Bun.file(
      new URL('../.github/workflows/site.yml', import.meta.url),
    ).exists(),
  ).toBe(false)
})

test('site PR checks cannot deploy, and tomato uses its own Pages environment', async () => {
  const site = await workflow('pages')
  expect(site.permissions).toEqual({ contents: 'read' })
  expect(site.jobs.build.permissions?.actions).toBeUndefined()
  expect(site.jobs.deploy.if).toContain("github.event_name != 'pull_request'")
  expect(site.jobs.deploy.if).toContain("github.ref == 'refs/heads/tomato'")
  expect(site.jobs.deploy.environment.name).toBe('tomato-pages')
  expect(site.jobs.deploy.permissions).toEqual({
    pages: 'write',
    'id-token': 'write',
  })
  const verify = site.jobs.build.steps.find(
    (step: any) => step.run === 'bun run verify',
  )
  expect(verify.env.SITE_URL).toBe('https://whistle003.github.io')
})

test('release builds are pinned to tomato and only successful publishing refreshes the tomato site', async () => {
  const release = await workflow('release')
  expect(release.name).toBe('Release Tomato')
  expect(release.on.repository_dispatch).toBeUndefined()
  expect(Object.keys(release.on)).toEqual(['workflow_dispatch'])
  expect(release.jobs.resolve.if).toContain(
    "github.repository == 'whistle003/lo-tool-release'",
  )
  expect(release.jobs.resolve.if).toContain("github.ref == 'refs/heads/tomato'")
  expect(release.jobs.build.steps[0].with.ref).toBe(
    '${{ needs.resolve.outputs.source_sha }}',
  )
  expect(release.jobs['refresh-site'].needs).toBe('publish')
  expect(release.jobs['refresh-site'].permissions).toEqual({ actions: 'write' })
  expect(release.jobs['refresh-site'].steps[0].run).toContain('--ref tomato')
  const publish = await workflow('publish')
  expect(publish.jobs.release.if).toContain(
    "github.repository == 'whistle003/lo-tool-release'",
  )
  expect(publish.jobs.release.if).toContain("github.ref == 'refs/heads/tomato'")
})
