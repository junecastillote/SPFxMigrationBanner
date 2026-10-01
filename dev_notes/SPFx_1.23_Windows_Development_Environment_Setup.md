# SharePoint Framework 1.23 Development Environment Setup on Windows

This guide documents how to prepare a fresh Windows workstation for SharePoint Framework (SPFx) 1.23 development. It includes Node.js version management, PATH conflict resolution, Heft-based build commands, local HTTPS debugging, and the deployment lessons identified while building the SPFx migration banner.

## Target environment

- Windows 11 or a supported Windows 10 release
- PowerShell 7 recommended
- SharePoint Framework 1.23.x
- Node.js 22.x
- npm 10.x or the version bundled with the selected Node.js release
- Yeoman 7.x
- SharePoint Framework Yeoman generator 1.23.x
- Heft-based SPFx toolchain

> SPFx 1.22 and later use the Heft-based toolchain for newly generated projects. Do not expect a newly generated SPFx 1.23 project to contain `gulpfile.js`.

## 1. Install prerequisite desktop tools

Install the following software:

- Git for Windows
- Visual Studio Code
- PowerShell 7, recommended but not required
- NVM for Windows

Restart Windows if an installer requests it.

## 2. Avoid a competing standalone Node.js installation

For a fresh computer, install Node.js only through NVM for Windows.

Do not install another copy from the standalone Node.js MSI unless a separate application specifically requires it. A standalone installation commonly adds this directory to PATH:

```text
C:\Program Files\nodejs\
```

If that path takes precedence over the NVM-managed executable, `nvm use` can report one version while `node -v` runs another.

Before installing Node.js through NVM, inspect the computer:

```powershell
where.exe node
where.exe npm
```

If no matching files are found, continue to the NVM installation.

If a standalone Node.js installation already exists, uninstall **Node.js** from **Settings > Apps > Installed apps**, then inspect PATH as described later in this guide.

## 3. Install NVM for Windows

Install NVM for Windows using the approved installer for the selected distribution.

After installation:

1. Close all PowerShell, Windows Terminal, Command Prompt, and Visual Studio Code windows.
2. Open a new PowerShell session.
3. Verify NVM:

```powershell
nvm version
```

The exact version and installation path depend on the NVM for Windows distribution. During testing, NVM for Windows Community Edition used a path similar to:

```text
C:\Users\<username>\AppData\Local\Author Software\nvm
```

## 4. Install and select Node.js 22

```powershell
nvm install 22
nvm use 22
```

Verify:

```powershell
node -v
npm -v
nvm list
```

Expected Node.js version:

```text
v22.x.x
```

## 5. Resolve the Windows PATH conflict

A successful `nvm use 22` does not guarantee that PowerShell is running the NVM-managed executable.

Check all matching Node.js executables:

```powershell
where.exe node
```

A problematic result can look like:

```text
C:\Program Files\nodejs\node.exe
C:\Users\<username>\AppData\Local\Author Software\nvm\.nodejs\node.exe
```

If `C:\Program Files\nodejs\node.exe` appears first, PowerShell will run the standalone copy even when NVM says Node.js 22 is active.

### Confirm the NVM-managed executable

Run the NVM-managed executable directly. Adjust the path for the installed NVM distribution:

```powershell
& "$env:LOCALAPPDATA\Author Software\nvm\.nodejs\node.exe" -v
```

If this returns Node.js 22 but `node -v` returns a different version, PATH precedence is the problem.

### Inspect NVM and PATH values

```powershell
$env:NVM_HOME
$env:NVM_SYMLINK
$env:Path -split ';'
```

Some NVM distributions may leave `NVM_SYMLINK` empty and use their own managed `.nodejs` path. Use the directories reported by the installed product rather than assuming the original nvm-windows path layout.

### Correct PATH

Open:

```text
System Properties > Advanced > Environment Variables
```

Inspect both **User variables** and **System variables**.

Recommended correction:

1. Remove the stale standalone entry:

   ```text
   C:\Program Files\nodejs\
   ```

2. Preserve the NVM directories added by the installer, for example:

   ```text
   C:\Users\<username>\AppData\Local\Author Software\nvm
   C:\Users\<username>\AppData\Local\Author Software\nvm\.nodejs
   ```

If the standalone path cannot be removed, place the NVM-managed Node.js directory above it.

After editing PATH:

1. Close PowerShell, Windows Terminal, and Visual Studio Code.
2. Open a new PowerShell session.
3. Verify again:

```powershell
where.exe node
node -v
npm -v
```

The first `node.exe` should be the NVM-managed executable, and `node -v` should return Node.js 22.

## 6. Install Yeoman and the SPFx generator

Install the global tools under the active Node.js 22 environment:

```powershell
npm install --global yo @microsoft/generator-sharepoint@1.23.2
```

Verify:

```powershell
yo --version
npm list --global --depth=0 @microsoft/generator-sharepoint
```

Expected generator version:

```text
@microsoft/generator-sharepoint@1.23.2
```

### Optional: Gulp CLI

A newly generated SPFx 1.23 project uses Heft, so Gulp CLI is not required for its normal build workflow. Install it only when older Gulp-based SPFx projects must also be supported:

```powershell
npm install --global gulp-cli
gulp -v
```

`Local version: Unknown` outside a Gulp-based project is not an error. It only means the current directory has no local Gulp dependency.

## 7. Verify the development environment

```powershell
node -v
npm -v
yo --version
npm list --global --depth=0 @microsoft/generator-sharepoint
gulp -v
```

Example tested output:

```text
Node.js: v22.23.3
npm: 10.9.9
Yeoman: 7.0.1
@microsoft/generator-sharepoint: 1.23.2
Gulp CLI: 3.1.0
```

Gulp is optional for the Heft-based project.

## 8. Create the project directory

Example:

```powershell
New-Item -ItemType Directory -Path C:\GitHub\SPFxMigrationBanner -Force
Set-Location C:\GitHub\SPFxMigrationBanner
```

The target directory should be empty before scaffolding the project.

## 9. Generate the SPFx Application Customizer

```powershell
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

The generator normally installs dependencies. If installation did not complete, run:

```powershell
npm install
```

## 10. Recognize the SPFx 1.23 project structure

A newly generated Heft-based project contains files and folders similar to:

```text
config\
node_modules\
sharepoint\
src\
package.json
tsconfig.json
```

It may not contain `gulpfile.js`. This is expected.

Inspect the npm commands:

```powershell
npm run
```

A generated `package.json` can define scripts similar to:

```json
{
  "scripts": {
    "build": "heft test --clean --production && heft package-solution --production",
    "clean": "heft clean",
    "start": "heft start --clean"
  }
}
```

## 11. Build and package the solution

Use:

```powershell
npm run build
```

Do not use this for a newly generated SPFx 1.23 Heft project:

```powershell
gulp build
```

If `gulp build` reports `Local gulp not found`, inspect `package.json`. The project is likely Heft-based and should be built through its npm scripts.

After a successful build, verify the package:

```powershell
Get-ChildItem .\sharepoint\solution\
```

Expected package:

```text
sharepoint\solution\sp-fx-migration-banner.sppkg
```

## 12. Start the local development server

```powershell
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

Use the exact query string emitted by the current `npm start` session. With the Heft-based toolchain, the manifest path can be:

```text
https://localhost:4321/temp/build/manifests.js
```

Do not substitute an older Gulp-era path if the console displays a different path.

## 13. Trust the local development certificate

From the project directory, use the certificate trust action supported by the generated toolchain:

```powershell
npx heft trust-dev-cert
```

If that action is unavailable, inspect the current Heft actions:

```powershell
npx heft --help
```

After trusting the certificate:

1. Stop the development server with `Ctrl+C`.
2. Start it again with `npm start`.
3. Open the manifest URL directly in the browser.

If the manifest cannot be loaded, verify that port 4321 is listening:

```powershell
netstat -ano | findstr 4321
```

Also check Windows Firewall, browser certificate warnings, corporate proxy settings, and endpoint security controls.

## 14. Test the extension in SharePoint Online

1. Keep `npm start` running.
2. Append the generated query string to the SharePoint test-site URL.
3. Open the complete URL in the browser.
4. When SharePoint asks whether to allow debug scripts, select **Load debug scripts**.
5. Confirm that the Application Customizer renders.
6. Stop the server with `Ctrl+C` when testing is complete.

The debug URL can contain encoded custom-action properties from `config\serve.json`. Restart `npm start` after modifying `serve.json` so that the generated query string includes the new values.

## 15. Produce and locate the production package

Run a final build:

```powershell
npm run build
```

Confirm that the `.sppkg` last-write time reflects the latest build:

```powershell
Get-Item .\sharepoint\solution\sp-fx-migration-banner.sppkg |
    Select-Object FullName, Length, LastWriteTime
```

Upload this file to the Tenant App Catalog:

```text
sharepoint\solution\sp-fx-migration-banner.sppkg
```

## 16. Understand controlled and tenant-wide deployment

### Controlled site installation

When the package is deployed without selecting **Make this solution available to all sites in the organization**:

1. Upload and deploy the package in the Tenant App Catalog.
2. Open the target site's **Site contents**.
3. Select **Add an app**.
4. Install the SPFx solution on that site.

Installing the app can automatically activate an Application Customizer declared through the package's feature configuration. That automatically activated instance uses the properties defined by the package registration or the code's fallback values.

If a second custom action is then added with PnP PowerShell, both instances can render and produce two banners.

### Tenant-wide package deployment

When the solution is made available to all sites, SharePoint can automatically load a tenant-wide Application Customizer instance without creating a visible web-scoped custom action on each site.

For a migration banner that should appear only on selected sites, the extension should not render when required configuration is absent:

```typescript
const targetSiteUrl = this.properties.targetSiteUrl;

if (!targetSiteUrl) {
  return;
}
```

The package can then remain tenant-wide while a site-specific PnP custom action supplies the target URL and other properties only on sites participating in the migration.

## 17. Validate a deployed extension

For a production test:

1. Stop `npm start`.
2. Remove all debug query-string parameters from the SharePoint URL.
3. Open the site normally.
4. Check the browser console for extension-loading errors.
5. Inspect the custom action configuration with PnP PowerShell.

Example inspection:

```powershell
Get-PnPCustomAction |
    Select-Object Name,
                  Location,
                  Scope,
                  ClientSideComponentId,
                  ClientSideComponentProperties |
    Format-List
```

The custom-action instance ID and the SPFx component ID are different values. The `ClientSideComponentId` must match the ID in the Application Customizer manifest.

## Troubleshooting

### `nvm` is not recognized

Close all terminal and editor windows, then open a new PowerShell session. If the command remains unavailable, inspect the NVM installation directory and PATH entries.

```powershell
$env:Path -split ';'
```

### `nvm use 22` succeeds but `node -v` returns another version

```powershell
nvm list
where.exe node
node -v
```

Remove or demote the conflicting `C:\Program Files\nodejs\` PATH entry, restart the terminal, and test again.

### The NVM-managed Node.js executable works only with its full path

This confirms a PATH precedence problem. Correct PATH instead of invoking Node.js by full path during normal development.

### Global tools disappear after switching Node.js versions

NVM maintains global npm packages for each installed Node.js version. Select Node.js 22 and reinstall the global tools:

```powershell
nvm use 22
npm install --global yo @microsoft/generator-sharepoint@1.23.2
```

### `Local gulp not found`

Use the generated npm scripts:

```powershell
npm run build
npm start
```

Do not add a local Gulp dependency merely to make an old command work against a Heft-based SPFx 1.23 project.

### No `gulpfile.js`

This is expected for a newly generated Heft-based SPFx 1.23 project.

### Dependency installation errors

Preserve `package-lock.json`, remove the project-local dependency folder, and reinstall:

```powershell
Remove-Item .\node_modules -Recurse -Force
npm install
```

Avoid `npm audit fix --force` unless the dependency changes have been reviewed for SPFx compatibility.

### Debug prompt appears but the extension fails to load

Open the manifest URL directly in the same browser:

```text
https://localhost:4321/temp/build/manifests.js
```

Use the exact path emitted by `npm start`. Check the certificate, port listener, firewall, proxy, and terminal output.

### Extension works in debug mode but not after deployment

Verify all of the following:

1. The `.sppkg` timestamp matches the latest production build.
2. The latest package is uploaded and deployed in the Tenant App Catalog.
3. For a non-tenant-wide deployment, the app is installed on the target site.
4. The component ID matches the Application Customizer manifest.
5. The custom-action properties contain valid JSON.
6. No duplicate auto-activated and manually registered extension instances exist.
7. The browser is using a clean URL without localhost debug parameters.

### Two banners appear after tenant-wide deployment

One instance is typically the tenant-wide automatically activated extension, while the other is a site-specific custom action. Make the default tenant-wide instance exit when required properties are absent, and let the site-specific custom action provide those properties.

## Final verification checklist

- [ ] Git and Visual Studio Code installed
- [ ] NVM for Windows installed
- [ ] Node.js 22 installed and selected
- [ ] `where.exe node` resolves to the intended NVM-managed executable first
- [ ] `node -v` returns Node.js 22
- [ ] Yeoman installed
- [ ] SPFx generator 1.23.2 installed
- [ ] SPFx Application Customizer generated
- [ ] `npm install` completed
- [ ] `npm run build` succeeded
- [ ] `.sppkg` created under `sharepoint\solution\`
- [ ] Local certificate trusted
- [ ] `npm start` serves the debug manifest
- [ ] Extension tested using the generated SharePoint debug URL
- [ ] Production package uploaded and tested through the intended deployment model
- [ ] Duplicate extension instances ruled out

## References

- Microsoft Learn: SharePoint Framework development environment
- Microsoft Learn: SharePoint Framework 1.23 release notes
- Microsoft Learn: Heft-based SharePoint Framework toolchain
- NVM for Windows documentation for the selected distribution
