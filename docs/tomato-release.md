# tomato 发布中心

源码：`whistle003/g-wolf-toolkit:tomato`。发布与下载站：`whistle003/lo-tool-release:tomato`。本分支不写入 `Loudomian` 仓库。

## 本地验证

```powershell
git switch tomato
bun install --frozen-lockfile
bun run verify
bun run dev
```

本地网站地址为 `http://127.0.0.1:4321/`。浏览器从 `whistle003/lo-tool-release` 读取 Releases；没有发布版本时显示空目录。`bun run sync` 更新本地版本快照。上述命令不执行云端发布或部署。

## 首次启用

1. 分别提交并推送两个仓库的 `tomato` 分支，发布中心优先。保持 `main` 不变。
2. 在本发布仓库启用 GitHub Actions，Settings → Pages → Source 选择 GitHub Actions。
3. `tomato-pages` 环境允许 `tomato` 分支部署。原 `github-pages` 环境不参与本分支部署。
4. 源码公开时使用内置 `GITHUB_TOKEN`。私有源码需在本仓库的 Actions secrets 设置仅有源码 Contents 读取权限的 `SOURCE_TOKEN`。
5. `release.yml` 和 `pages.yml` 必须已存在于 fork 的默认分支，以便 GitHub 注册手动工作流；克隆时的 `main` 已包含它们。运行时用 `--ref tomato` 选择本分支内容，不需要改动 `main`。

首次推送 `tomato` 会部署下载站。需要重试时：

```powershell
gh workflow run pages.yml --repo whistle003/lo-tool-release --ref tomato
```

下载站地址：`https://whistle003.github.io/lo-tool-release/`。

## 工具发布

通常从源码 `tomato` 分支执行 `bun run release --version <新版本>`。它推送源码标签，并显式触发本仓库的 `tomato` 工作流。已有标签的手动重试示例：

```powershell
gh workflow run release.yml --repo whistle003/lo-tool-release --ref tomato -f tool=g-wolf-toolkit -f tag=v0.2.0 -f sha=<完整源码提交SHA>
```

构建只接受注册源码仓库中、属于 `tomato` 历史的标签。按 SHA 拉取源码 → 执行源码构建动作 → 校验 ZIP 与 SHA256 → 发布本人仓库的 Release → 用 `GITHUB_TOKEN` 显式触发 `tomato` 下载站刷新。客户端直接读取同一仓库的 Releases API。

`Release Tomato` 与 `Site Tomato` 使用独立名称；站点不订阅 `workflow_run`，避免发布完成后回到默认分支工作流。所有发布和部署 job 还校验仓库名与 `tomato` ref。网站 PR 只构建检查，不部署。
