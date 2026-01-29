# Deployment Guide

## GitHub Pages Deployment

### Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages when you push to the main/master branch.

#### Setup Steps

1. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select "GitHub Actions"

2. **Configure Repository Permissions**
   - Go to Settings > Actions > General
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

3. **Push Your Code**
   ```bash
   git add .
   git commit -m "Deploy GST Excel Consolidator"
   git push origin master
   ```

4. **Check Deployment**
   - Go to the "Actions" tab in your repository
   - Wait for the workflow to complete
   - Your site will be available at: `https://[username].github.io/[repository-name]/`

### Manual Deployment

If you prefer to deploy manually:

```bash
# Build the project
npm run build

# The build output is in the dist/ folder
# You can deploy this folder to any static hosting service
```

## Cloudflare Pages Deployment

### Option 1: Connect via Dashboard

1. **Login to Cloudflare**
   - Go to https://dash.cloudflare.com/
   - Navigate to Pages

2. **Create New Project**
   - Click "Create a project"
   - Connect your GitHub account
   - Select your repository

3. **Configure Build Settings**
   - Framework preset: None (or Vite)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/gst-excel-web` (if in subdirectory)
   - Node.js version: 20 or higher

4. **Environment Variables** (if needed)
   - None required for this project

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete
   - Your site will be available at: `https://[project-name].pages.dev`

### Option 2: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy
wrangler pages deploy dist --project-name=gst-excel-consolidator
```

## Netlify Deployment

### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Via Netlify Dashboard

1. Go to https://app.netlify.com/
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git provider
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20
5. Click "Deploy site"

## Vercel Deployment

### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Via Vercel Dashboard

1. Go to https://vercel.com/
2. Click "Add New Project"
3. Import your repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click "Deploy"

## Custom Domain Setup

### GitHub Pages

1. Add a CNAME file to the `public/` folder with your domain
2. Configure DNS:
   - Add CNAME record pointing to `[username].github.io`
3. In GitHub Settings > Pages, add your custom domain

### Cloudflare Pages

1. Go to your project settings
2. Click "Custom domains"
3. Add your domain
4. Follow the DNS configuration instructions

## Environment-Specific Configuration

If you need different configurations for different environments:

1. Create environment-specific config files:
   ```
   src/config/config.prod.ts
   src/config/config.dev.ts
   ```

2. Use Vite's environment variables:
   ```typescript
   const config = import.meta.env.PROD
     ? prodConfig
     : devConfig;
   ```

## Post-Deployment Checklist

- [ ] Test file upload functionality
- [ ] Test Excel file processing
- [ ] Test file download
- [ ] Verify configuration export/import works
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Verify privacy statement (no server uploads)
- [ ] Check loading performance
- [ ] Test with sample files from production

## Troubleshooting

### Build Fails on Deployment Platform

**Issue**: Node.js version too old

**Solution**:
- GitHub Actions: Update `.github/workflows/deploy.yml` node-version
- Cloudflare Pages: Set Node version in environment variables (`NODE_VERSION=20`)
- Netlify: Add `.nvmrc` file with `20` or set in build settings
- Vercel: Set in project settings

### Blank Page After Deployment

**Issue**: Incorrect base path configuration

**Solution**:
- Check `vite.config.ts` has `base: './'` for relative paths
- Or set `base: '/your-repo-name/'` for GitHub Pages subdirectory

### Files Not Processing

**Issue**: Missing dependencies or build errors

**Solution**:
- Check build logs for errors
- Verify all dependencies installed: `npm ci`
- Test locally with production build: `npm run build && npm run preview`

### Large Files Fail to Process

**Issue**: Browser memory limits

**Solution**:
- This is a client-side limitation
- Consider adding file size warnings in the UI
- Users should process files in smaller batches

## Security Considerations

- All processing happens client-side (no server uploads)
- No user data is stored or transmitted
- Configuration export/import is local-only
- Add Content Security Policy headers if needed (via platform settings)

## Performance Optimization

### For Faster Builds

1. Use build caching on CI/CD platforms
2. Enable dependency caching in GitHub Actions
3. Use `npm ci` instead of `npm install` in CI

### For Faster Runtime

1. The app already uses code splitting via Vite
2. All processing is async to prevent UI blocking
3. Files are processed sequentially to manage memory

## Monitoring

After deployment, monitor:
- Error logs (if available on your platform)
- Performance metrics
- User feedback
- Browser console errors (ask users to report)

## Updates and Maintenance

To deploy updates:

1. Make changes locally
2. Test thoroughly
3. Commit and push to main/master branch
4. Automatic deployment will trigger
5. Verify deployment succeeded
6. Test the live site

## Rollback

If deployment has issues:

### GitHub Pages
- Revert the commit and push
- Or re-run a previous successful workflow

### Cloudflare Pages
- Go to Deployments
- Click "..." on a previous deployment
- Select "Rollback to this deployment"

### Netlify/Vercel
- Go to Deployments
- Select a previous deployment
- Click "Publish deploy"
