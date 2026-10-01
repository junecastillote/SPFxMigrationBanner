# SharePoint Framework (SPFx) Migration Banner Development Environment Setup

## Prerequisites

### Required Access

- SharePoint Online tenant
- SharePoint Administrator role
  - App Catalog Administrator access
  - Permission to deploy SPFx packages

### Required Software

NVM for Windows
Node.js 22.x
Visual Studio Code
Git / GitHub Desktop (optional but recommended)

## Step 1 - Install NVM for Windows

Download and install:

`https://github.com/coreybutler/nvm-windows/releases`

Install using default settings.

After installation:

`nvm version`

Expected:

`1.x.x` or later.

## Step 2 - Install Node.js 22

Install the version supported by SPFx 1.23.x:

```powershell
nvm install 22
nvm use 22
```

Verify:

`node -v`

Expected:

`v22.x.x`

### Important: Avoid Installing Standalone Node.js

Do not install Node.js directly from nodejs.org on the same machine.

We originally had `C:\Program Files\nodejs\` ahead of the NVM path in PATH.

This caused `nvm use 22` to report `Already using Node.js v22.x` while `node -v` still returned `v24.x` because Windows was finding `C:\Program Files\nodejs\node.exe` instead of `C:\Users\<User>\AppData\Local\Author Software\nvm\.nodejs\node.exe`.

### Fixing the PATH Issue

Verify `where.exe node`. The expected output is `C:\Users\<User>\AppData\Local\Author Software\nvm\.nodejs\node.exe`.

If you see `C:\Program Files\nodejs\node.exe`, then it means you can:

Option 1: Remove `C:\Program Files\nodejs` from system path.
Option 2: Move `C:\Users\<User>\AppData\Local\Author Software\nvm\.nodejs` above `C:\Program Files\nodejs`.

After updating PATH, restart PowerShell and verify with `node -v` and it should show `v22.x.x`.

## Step 3 - Install Yeoman

1. Run this command `npm install -g yo`.
2. Verify with `yo --version`. You should see something similar to `7.x.x`.

## Step 4 - Install SharePoint Generator

1. Run `npm install -g @microsoft/generator-sharepoint`.
2. Verify `npm ls -g --depth=0 @microsoft/generator-sharepoint`.

Expected output: `@microsoft/generator-sharepoint@1.23.x`

## Step 5 - Install Gulp CLI

1. Run `npm install -g gulp-cli`.
2. Verify `gulp -v`.

Expected output: `CLI version: 3.x.x`

## Step 6 - Verify Environment

Run the following commands:

```powershell
nvm version
node -v
npm -v
yo --version
gulp -v
```

Example:

```plaintext
[PS] nvm version
v2.0.0
[PS] node -v
v22.23.3
[PS] npm -v
10.9.9
[PS] yo --version
7.0.1
[PS] gulp -v
CLI version: 3.1.0
Local version: Unknown
```

## Step 7 - Create SPFx Project

1. Create a folder:

    ```PowerShell
    mkdir C:\SPFxMigrationBanner
    cd C:\SPFxMigrationBanner
    ```

2. Run to create a project.

`yo @microsoft/sharepoint`

Selections:

```plaintext
Solution Name:
SPFxMigrationBanner

Component Type:
Extension

Extension Type:
Application Customizer

Name:
SpFxMigrationBanner
```

## Step 8 - Install Dependencies

`npm install`

## Step 9 - Build

`npm run build`

> [!NOTE]
> SPFx 1.23 uses Heft.

## Step 10 - Local Debugging

1. Start the development server `npm start`. The output will contain: `?debugManifestsFile=...`

    Example:

    ```plaintext
    https://tenant.sharepoint.com/sites/SiteName
    ?debugManifestsFile=...
    &loadSPFX=true
    ```

2. Open that URL in the browser.
3. First use will prompt `Load Debug Scripts?`
4. Click `Load Debug Scripts`

## Step 11 - App Catalog Deployment

1. Build `npm run build`
2. Locate the `*.sppkg` package file at `sharepoint\solution\`
   Example: `sp-fx-migration-banner.sppkg`
3. Upload to SharePoint App Catalog.

## Step 12 - Important App Deployment Lesson

We discovered: **App Catalog Deployment Alone Is Not Enough**

If not deployed tenant-wide, uploading the package and adding a custom action did not make the extension render.

The missing step was: The app must be installed on the site.

```plaintext
Site Contents
→ Add an App
→ SPFx Migration Banner
```

Or `Install-PnpApp`.

When publishing tenant-wide (Make this solution available to all sites in the organization), SharePoint automatically makes the solution available across the tenant.

## Step 13 - Production Recommendation

For migration projects: Deploy Package Tenant-Wide = ✅ One deployment

Use Site-Specific Custom Actions

   ```plaintext
   {
    "bannerTitle": "...",
    "targetSiteUrl": "...",
    "retirementDate": "...",
    "faqUrl": "..."
   }
   ```

This allows:

```plaintext
Site A → New URL A
Site B → New URL B
Site C → New URL C
```

## Lessons Learned

1. SPFx 1.23 uses Heft instead of the traditional Gulp build process.
2. Node.js version compatibility matters.
3. NVM should manage Node completely.
4. Avoid standalone Node installations that compete in PATH.
5. Tenant-wide deployment and site app installation behave differently.
6. Custom action registration alone does not guarantee rendering.
7. Verify deployment using a clean browser session without localhost debugging.
8. A tenant-wide SPFx package plus site-specific custom action properties is the best architecture for a SharePoint migration banner solution.
