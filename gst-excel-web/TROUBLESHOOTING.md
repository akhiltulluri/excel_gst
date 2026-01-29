# Troubleshooting Guide

## Installation Issues

### Error: "Unsupported engine" or Node version warnings

**Symptoms**:
```
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'vite@7.3.1',
npm WARN EBADENGINE   required: { node: '^20.19.0 || >=22.12.0' }
```

**Solution**:

1. Check current Node version:
   ```bash
   node --version
   ```

2. Install Node.js 20+ using one of these methods:

   **Option A: Using nvm (recommended)**
   ```bash
   # Install nvm if not already installed
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

   # Install Node.js 20
   nvm install 20
   nvm use 20
   nvm alias default 20

   # Verify
   node --version  # Should show 20.x.x
   ```

   **Option B: Direct download**
   - Visit https://nodejs.org/
   - Download Node.js 20 LTS
   - Install and restart terminal

3. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Error: "npm command not found"

**Solution**:
- Install Node.js (includes npm)
- Restart your terminal after installation

### Error: "Permission denied" during npm install

**Solution**:
```bash
# Don't use sudo! Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then try again:
npm install
```

## Build Issues

### Error: "crypto.getRandomValues is not a function"

**Cause**: Node.js version is too old (< 20)

**Solution**: Upgrade Node.js to version 20+ (see above)

### TypeScript compilation errors

**Check for errors**:
```bash
npx tsc --noEmit
```

**Common fixes**:
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Ensure TypeScript is installed
npm install --save-dev typescript
```

### Vite build fails with "out of memory"

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## Runtime Issues

### Port 3000 already in use

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions**:

**Option 1: Use a different port**
```bash
npm run dev -- --port 3001
```

**Option 2: Kill the process using port 3000**
```bash
# macOS/Linux:
lsof -ti:3000 | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Blank page after starting dev server

**Check**:
1. Open browser console (F12)
2. Look for error messages

**Common causes**:

**Cause 1: JavaScript disabled**
- Enable JavaScript in browser settings

**Cause 2: Module loading error**
- Check browser console
- Verify all imports in main.ts are correct
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Cause 3: Vite server not running**
- Ensure dev server shows "ready" message
- Check the URL matches the one shown in terminal

### Files not uploading

**Symptoms**: Drag and drop or file selection doesn't work

**Solutions**:

1. **Check file type**:
   - Only .xlsx files are supported
   - .xls (old Excel format) won't work

2. **Check file size**:
   - Files over 50MB will be rejected
   - Split large files if needed

3. **Check browser console**:
   - Press F12 to open developer tools
   - Look for JavaScript errors

4. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

### "Processing failed" errors

**Error: "Sheet 'B2B' not found"**

**Cause**: Excel file doesn't have required sheet

**Solution**:
- Verify Excel file has "B2B" sheet
- Check sheet name exactly matches (case-sensitive)
- Use the correct file format for your configuration

**Error: "Sheet 'Read me' not found"**

**Cause**: Month extraction set to use "Read me" sheet, but sheet doesn't exist

**Solution**:
- Check "Use filename for month extraction" in configuration
- Or add "Read me" sheet to your Excel file

**Error: "Month value not found in cell E2"**

**Cause**: Cell E2 in "Read me" sheet is empty or wrong format

**Solution**:
- Ensure cell E2 contains month in MMYYYY format (e.g., "052020")
- Or switch to filename-based month extraction

### Incorrect calculations

**Symptoms**: Output values don't match expected results

**Debug steps**:

1. **Verify input file structure**:
   - Open Excel file manually
   - Check that data is in expected columns
   - Verify check conditions (e.g., column 9 = "-")

2. **Test with single file**:
   - Process one file at a time
   - Compare output with manual calculation

3. **Check configuration**:
   - Export configuration (JSON)
   - Verify column numbers are correct (1-based indexing)
   - Verify check conditions match your data

4. **Enable debug mode**:
   - Open browser console (F12)
   - Check for console.log messages
   - Look for filtering/summing details

### Month not extracted correctly

**Filename-based extraction issues**:

**Supported formats**:
- "May 2020.xlsx"
- "May2020.xlsx"
- "052020.xlsx"

**Not supported**:
- "2020-05.xlsx"
- "05-2020.xlsx"

**Solution**: Rename file to supported format

**"Read me" sheet extraction issues**:

**Requirements**:
- Sheet named exactly "Read me"
- Cell E2 (column 5, row 2)
- Format: MMYYYY (e.g., 052020 or "052020")

**Check**:
```
1. Open Excel file
2. Go to "Read me" sheet
3. Click cell E2
4. Verify value is MMYYYY format
```

## Performance Issues

### Browser freezing during processing

**Causes**:
- Too many files at once
- Very large files
- Old/slow computer

**Solutions**:

1. **Process in batches**:
   - Upload 5-10 files at a time
   - Process multiple batches

2. **Close other tabs**:
   - Free up browser memory

3. **Use a modern browser**:
   - Chrome, Firefox, Safari, or Edge
   - Update to latest version

### Slow file processing

**Normal processing time**:
- Small file (< 1MB): 1-2 seconds
- Medium file (1-10MB): 2-5 seconds
- Large file (10-50MB): 5-15 seconds

**If much slower**:
- Check CPU usage
- Close other applications
- Try a different browser

## Deployment Issues

### GitHub Pages: 404 error after deployment

**Cause**: Base path configuration issue

**Solution**:

Check `vite.config.ts`:
```typescript
export default defineConfig({
  base: './', // For repository root
  // OR
  base: '/repository-name/', // For repository subdirectory
});
```

Rebuild and redeploy:
```bash
npm run build
git add .
git commit -m "Fix base path"
git push
```

### GitHub Actions: Build fails

**Check workflow logs**:
1. Go to repository > Actions tab
2. Click on failed workflow
3. Check error messages

**Common causes**:

**Node version mismatch**:
```yaml
# In .github/workflows/deploy.yml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Ensure this is 20+
```

**Missing dependencies**:
- Ensure `package-lock.json` is committed
- Use `npm ci` instead of `npm install` in workflow

### Cloudflare Pages: Build fails

**Check build logs** in Cloudflare dashboard

**Common solutions**:

1. **Set Node version**:
   - Add environment variable: `NODE_VERSION=20`

2. **Verify build settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` or `/gst-excel-web`

## Browser-Specific Issues

### Safari: File download not working

**Cause**: Safari blocks automatic downloads

**Solution**:
- Allow pop-ups for the site
- Click "Download" when prompted

### Firefox: Drag and drop not working

**Cause**: Privacy settings blocking file access

**Solution**:
- Check Privacy & Security settings
- Allow file access for the site

### Edge: Compatibility mode issues

**Cause**: Site loading in IE compatibility mode

**Solution**:
- Disable compatibility mode
- Use modern Edge (Chromium-based)

## Data Issues

### Output file is empty

**Causes**:
- No matching rows found
- Check conditions too restrictive
- Wrong column numbers in configuration

**Debug**:
1. Open input file manually
2. Check column 9 (for B2B) - should have some rows with "-"
3. Verify data starts from row 2 (row 1 is header)

### Output has zeros for all values

**Causes**:
- Wrong column numbers in columnMap
- Data in different columns than expected
- Non-numeric values in data columns

**Solution**:
1. Export configuration
2. Verify column numbers match your Excel structure
3. Check that data columns contain numbers, not text

### Missing months in output

**Cause**: Files for those months not uploaded

**Solution**:
- Verify all required files are uploaded
- Check file list before processing

### Duplicate months in output

**Cause**: Same file uploaded multiple times

**Solution**:
- Remove duplicate files before processing
- Click X button on duplicate entries

## Development Issues

### Hot reload not working

**Solutions**:
```bash
# Restart dev server
npm run dev

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Tailwind styles not applying

**Solutions**:

1. **Check Tailwind setup**:
   ```bash
   # Verify Tailwind is installed
   npm list tailwindcss

   # Reinstall if needed
   npm install -D tailwindcss
   ```

2. **Check configuration**:
   - Verify `tailwind.config.js` includes all source paths
   - Check `postcss.config.js` has tailwindcss plugin

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

### Import errors

**Error**: "Cannot find module 'xlsx'"

**Solution**:
```bash
npm install xlsx
```

**Error**: "Cannot find module '@/...'**

**Cause**: Path alias not configured

**Solution**: Use relative imports instead
```typescript
// Instead of:
import { foo } from '@/utils/foo';

// Use:
import { foo } from '../utils/foo';
```

## Getting Help

If issues persist:

1. **Check browser console**:
   - Press F12
   - Look for error messages
   - Take screenshots

2. **Check documentation**:
   - README.md
   - DEVELOPMENT.md
   - TESTING.md

3. **Verify environment**:
   ```bash
   node --version    # Should be 20+
   npm --version     # Should be 8+
   ```

4. **Try fresh install**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   npm run dev
   ```

5. **Test in different browser**:
   - Rule out browser-specific issues

6. **Check sample files**:
   - Ensure Excel files have correct structure
   - Test with known-good files first

## Emergency Reset

If everything is broken:

```bash
# 1. Backup your custom configuration (if any)
# Export from UI before proceeding

# 2. Clean everything
rm -rf node_modules package-lock.json dist

# 3. Verify Node version
node --version  # Must be 20+

# 4. Reinstall
npm install

# 5. Test build
npm run build

# 6. Test dev server
npm run dev

# 7. Test in browser
# Open http://localhost:3000
```

## Still Having Issues?

Create an issue with:
- Error message (full text)
- Browser console output (F12)
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Operating system
- Steps to reproduce
- Screenshots if applicable
