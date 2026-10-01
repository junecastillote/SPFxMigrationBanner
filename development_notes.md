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

> [!IMPORTANT]
> Important: Avoid Installing Standalone Node.js