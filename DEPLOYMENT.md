# GitHub Pages Deployment Guide

## Problem: Website Shows README Instead of Actual Site

If you see only README text when visiting your GitHub Pages site, it means GitHub Pages is configured to use "Deploy from a branch" instead of "GitHub Actions".

## Solution: Configure GitHub Pages to Use GitHub Actions

### Step-by-Step Instructions

1. **Open Repository Settings**
   - Navigate to your repository on GitHub.com
   - Click the **Settings** tab (top right of the repository page)

2. **Go to Pages Settings**
   - In the left sidebar, scroll down and click **Pages**

3. **Change the Source**
   - Under **Build and deployment** section
   - Find the **Source** dropdown
   - Currently it might be set to "Deploy from a branch"
   - **Change it to "GitHub Actions"**

4. **Save and Deploy**
   - The settings are saved automatically
   - Go to the **Actions** tab
   - You should see the "Deploy to GitHub Pages" workflow running
   - Wait for it to complete (green checkmark)

5. **Verify Deployment**
   - Visit your site: `https://[your-username].github.io/Car-Dealer/`
   - You should now see the actual car dealer website, not the README

### How to Tell if It's Working

✅ **Correct Setup:**
- You see the car dealer website with hero section
- Swedish text "HITTA DIN NÄSTA BIL" is visible
- Featured cars are displayed
- Navigation menu works

❌ **Incorrect Setup:**
- You see README.md content
- You see a screenshot at the top
- You see markdown formatted text
- No car dealer interface

### Manual Deployment

If you need to manually trigger a deployment:

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select the `main` branch
5. Click **Run workflow**
6. Wait for the workflow to complete

### Still Not Working?

**Check the deployment status:**
1. Go to **Actions** tab
2. Look for the latest "Deploy to GitHub Pages" workflow run
3. If it shows a red X, click on it to see the error
4. Common issues:
   - Build failed: Check if the code builds locally with `npm run build`
   - Upload failed: Check GitHub Pages permissions in repository settings
   - Deploy failed: Ensure Pages is enabled in repository settings

**Check Pages settings:**
1. Go to **Settings** > **Pages**
2. Verify Source is set to "GitHub Actions"
3. Check that there's no custom domain causing issues
4. Ensure HTTPS is enforced (optional but recommended)

### Why This Happens

GitHub Pages has two modes:
1. **Deploy from a branch** - GitHub serves files directly from a branch (shows README by default)
2. **GitHub Actions** - Custom workflow builds and deploys the site (what we want)

This repository uses Next.js which requires a build step. The GitHub Actions workflow:
- Installs dependencies
- Builds the Next.js app
- Generates static HTML/CSS/JS files
- Deploys them to GitHub Pages

Without using GitHub Actions, GitHub Pages just shows the repository files (README.md).

### Need More Help?

- Check the [Actions tab](https://github.com/AigennA/Car-Dealer/actions) for workflow logs
- Ensure the workflow completed successfully (green checkmark)
- Check the [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
