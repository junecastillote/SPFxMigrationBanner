# SharePoint Framework 1.23 Development Environment Setup on Ubuntu

This guide documents how to prepare a fresh Ubuntu workstation for SharePoint Framework (SPFx) 1.23 development, including Node.js version management, PATH verification, Heft-based build commands, local HTTPS debugging, and common corrections.

## Target environment

- Ubuntu 24.04 LTS or Ubuntu 22.04 LTS
- SharePoint Framework 1.23.x
- Node.js 22.x
- npm 10.x or the npm version bundled with the selected Node.js release
- Yeoman 7.x
- SharePoint Framework Yeoman generator 1.23.x
- Heft-based SPFx toolchain

> SPFx 1.22 and later use the Heft-based toolchain for newly generated projects. Do not expect a newly generated SPFx 1.23 project to contain `gulpfile.js`.

## 1. Update Ubuntu

```bash
sudo apt update
sudo apt upgrade -y
```

Restart Ubuntu if the upgrade includes kernel or core system updates:

```bash
sudo reboot
```

## 2. Install base packages

```bash
sudo apt install -y \
  ca-certificates \
  curl \
  git \
  build-essential
```

Optional editors and utilities can be installed separately. Visual Studio Code is recommended but is not required by SPFx itself.

## 3. Remove conflicting system-level Node.js installations

A fresh computer should normally skip this section. Run these checks before installing Node.js through NVM:

```bash
command -v node || true
command -v npm || true
```

If Node.js was previously installed through APT, remove it so it does not compete with the NVM-managed installation:

```bash
sudo apt remove -y nodejs npm
sudo apt autoremove -y
```

If Node.js was installed through Snap, check and remove it:

```bash
snap list | grep -i node || true
sudo snap remove node
```

Do not use `sudo npm install -g ...` after adopting NVM. NVM keeps Node.js and global npm packages inside the user's home directory and does not require elevated permissions.

## 4. Install NVM

Install NVM using the official `nvm-sh` installation script. Review the current installation command on the NVM project page before running it. A typical installation uses:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```

Reload the shell configuration:

```bash
source ~/.bashrc
```

Verify NVM:

```bash
nvm --version
```

If `nvm` is not found, confirm that `~/.bashrc` contains the NVM initialization block and then open a new terminal.

For Zsh, reload `~/.zshrc` instead:

```bash
source ~/.zshrc
```

## 5. Install and select Node.js 22

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

Verify the active versions:

```bash
node -v
npm -v
nvm current
```

The Node.js version should be `v22.x.x`.

## 6. Verify PATH resolution

Confirm that the active executables come from NVM:

```bash
which node
which npm
```

Expected pattern:

```text
/home/<username>/.nvm/versions/node/v22.x.x/bin/node
/home/<username>/.nvm/versions/node/v22.x.x/bin/npm
```

Also inspect all matches:

```bash
type -a node
type -a npm
```

If `/usr/bin/node`, `/usr/local/bin/node`, or `/snap/bin/node` appears before the NVM path:

1. Remove the conflicting APT, Snap, or manually installed Node.js version.
2. Reload the shell.
3. Run `nvm use 22` again.
4. Recheck `which node` and `node -v`.

This is the Linux equivalent of the PATH conflict encountered when a standalone Windows Node.js installation takes precedence over an NVM-managed version.

## 7. Install Yeoman and the SPFx generator

Install the required global tools under the active NVM Node.js version:

```bash
npm install --global yo @microsoft/generator-sharepoint@1.23.2
```

Verify:

```bash
yo --version
npm list --global --depth=0 @microsoft/generator-sharepoint
```

Expected generator version:

```text
@microsoft/generator-sharepoint@1.23.2
```

### Optional: Gulp CLI

A newly generated SPFx 1.23 project uses Heft, so Gulp CLI is not required for its normal build workflow. Install it only when maintaining older Gulp-based SPFx projects:

```bash
npm install --global gulp-cli
gulp --version
```

## 8. Confirm the complete development toolchain

```bash
node -v
npm -v
yo --version
npm list --global --depth=0 @microsoft/generator-sharepoint
```

Example result:

```text
Node.js: v22.x.x
npm: 10.x.x
Yeoman: 7.x.x
@microsoft/generator-sharepoint: 1.23.2
```

## 9. Create the project directory

```bash
mkdir -p ~/git/SPFxMigrationBanner
cd ~/git/SPFxMigrationBanner
```

The directory should be empty before scaffolding the project.

## 10. Generate the SPFx Application Customizer

Run:

```bash
yo @microsoft/sharepoint
```

Use the following selections:

```text
Solution name: SPFxMigrationBanner
Component type: Extension
Extension type: Application Customizer
Application Customizer name: SpFxMigrationBanner
Framework: No JavaScript Framework
```

The generator normally installs project dependencies. If dependencies are not present or installation did not complete, run:

```bash
npm install
```

## 11. Recognize the SPFx 1.23 project structure

A Heft-based SPFx 1.23 project has files and folders similar to:

```text
config/
node_modules/
sharepoint/
src/
package.json
tsconfig.json
```

A newly generated project may not contain `gulpfile.js`. This is expected.

Inspect the available npm scripts:

```bash
npm run
```

The generated `package.json` typically provides scripts such as:

```json
{
  "scripts": {
    "build": "heft test --clean --production && heft package-solution --production",
    "clean": "heft clean",
    "start": "heft start --clean"
  }
}
```

## 12. Build and package the solution

Use the npm script from `package.json`:

```bash
npm run build
```

Do not use `gulp build` for this Heft-based project.

After a successful build, verify the package:

```bash
ls -l sharepoint/solution/
```

Expected package:

```text
sharepoint/solution/sp-fx-migration-banner.sppkg
```

## 13. Start the local development server

```bash
npm start
```

The terminal should report a local HTTPS endpoint similar to:

```text
https://localhost:4321/
```

The output also provides the complete query string containing values such as:

```text
debugManifestsFile
noredir
loadSPFX
customActions
```

Append the emitted query string to the SharePoint test-site URL. Use the exact query string generated by the current `npm start` session.

## 14. Trust the local development certificate

Run the certificate trust task from the project directory:

```bash
npx heft trust-dev-cert
```

If the project exposes the command differently, inspect the available Heft actions:

```bash
npx heft --help
```

Linux trust behavior varies by browser and desktop environment. If the browser still warns about the local certificate after running the trust task, import the generated certificate into the browser or operating-system trust store used by that browser.

Confirm that the manifest can be retrieved directly:

```text
https://localhost:4321/temp/build/manifests.js
```

If the project emits a different manifest path, use the exact path displayed by `npm start`.

## 15. Test the extension in SharePoint Online

1. Keep `npm start` running.
2. Open the SharePoint test site with the generated debug query string.
3. When prompted to allow debug scripts, select **Load debug scripts**.
4. Confirm that the Application Customizer renders.
5. Stop the development server with `Ctrl+C` when finished.

## 16. Upload the production package

Run a final production build:

```bash
npm run build
```

Upload this file to the Tenant App Catalog:

```text
sharepoint/solution/sp-fx-migration-banner.sppkg
```

For controlled testing, deploy without making the solution available to every site. Install the app on the test site through **Site contents > Add an app**.

For a later tenant-wide rollout, make the package available to all sites and ensure that the extension does not render unless required configuration is present. For example, the banner code can exit when no target URL is supplied:

```typescript
const targetSiteUrl = this.properties.targetSiteUrl;

if (!targetSiteUrl) {
  return;
}
```

This allows the package to be available tenant-wide while site-specific custom actions determine which sites display a configured banner.

## Troubleshooting

### `nvm: command not found`

Reload the active shell profile:

```bash
source ~/.bashrc
```

Then verify:

```bash
command -v nvm
nvm --version
```

If the command is still missing, inspect the end of `~/.bashrc` for the NVM initialization block.

### `node -v` returns the wrong version

```bash
which node
type -a node
nvm current
```

Then select the required version:

```bash
nvm use 22
```

Remove any APT, Snap, or manually installed Node.js executable that resolves before the NVM path.

### Global tools disappear after changing Node.js versions

NVM maintains global npm packages separately for each Node.js installation. Reinstall the tools under the active version:

```bash
nvm use 22
npm install --global yo @microsoft/generator-sharepoint@1.23.2
```

### `Local gulp not found`

For SPFx 1.23, this normally means an old Gulp command was used against a Heft-based project. Inspect `package.json`, then use:

```bash
npm run build
```

### No `gulpfile.js`

This is expected for a newly generated Heft-based SPFx 1.23 project.

### Dependency installation errors

Clear only project-local generated content, preserve `package-lock.json`, and reinstall:

```bash
rm -rf node_modules
npm install
```

Avoid `npm audit fix --force` unless the resulting dependency changes have been assessed for SPFx compatibility.

### Local manifests do not load

Check that the server is listening:

```bash
ss -ltnp | grep 4321
```

Test the emitted manifest URL directly in the browser. Also confirm that the browser trusts the local certificate and that no proxy or endpoint security control is blocking localhost HTTPS.

### Banner works in debug mode but not after deployment

Check all of the following:

1. The `.sppkg` timestamp reflects the latest `npm run build`.
2. The updated package is deployed in the Tenant App Catalog.
3. If the package is not tenant-wide deployed, the app is installed on the target site.
4. The Application Customizer component ID matches the manifest ID.
5. The site custom action contains valid JSON properties.
6. The browser is opened without the localhost debug query string for the production test.

## Final verification checklist

- [ ] Ubuntu packages installed
- [ ] NVM installed and loaded by the shell
- [ ] Node.js 22 selected and configured as the default
- [ ] `which node` resolves to `~/.nvm/...`
- [ ] Yeoman installed
- [ ] SPFx generator 1.23.2 installed
- [ ] SPFx Application Customizer generated
- [ ] `npm install` completed
- [ ] `npm run build` succeeded
- [ ] `.sppkg` created under `sharepoint/solution/`
- [ ] Local certificate trusted or imported
- [ ] `npm start` serves the debug manifest
- [ ] Extension tested using the generated SharePoint debug URL
- [ ] Production package uploaded and tested through the intended deployment model

## References

- Microsoft Learn: SharePoint Framework development environment
- Microsoft Learn: SharePoint Framework 1.23 release notes
- Microsoft Learn: Heft-based SharePoint Framework toolchain
- NVM project documentation
