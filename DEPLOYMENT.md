# MedAI - Deployment Guide

## Build Status
✅ Production build successful
✅ Build size: ~310 KB (gzipped: ~94 KB)
✅ Deployment configurations ready

## Quick Deploy Options

### Option 1: Vercel (Recommended - Fastest)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from the medai folder**:
   ```bash
   cd claude/medai
   vercel
   ```

3. **Follow the prompts**:
   - Login to Vercel (creates account if needed)
   - Confirm project settings
   - Deploy!

4. **Your app will be live at**: `https://your-project-name.vercel.app`

**Vercel Dashboard**: https://vercel.com/dashboard

---

### Option 2: Netlify

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy from the medai folder**:
   ```bash
   cd claude/medai
   netlify deploy --prod
   ```

3. **Follow the prompts**:
   - Login to Netlify
   - Create new site or link existing
   - Publish directory: `dist`

4. **Your app will be live at**: `https://your-site-name.netlify.app`

**Netlify Dashboard**: https://app.netlify.com/

---

### Option 3: Manual Deploy (Drag & Drop)

#### Vercel:
1. Go to https://vercel.com/new
2. Drag and drop the `dist` folder
3. Done!

#### Netlify:
1. Go to https://app.netlify.com/drop
2. Drag and drop the `dist` folder
3. Done!

---

## GitHub Integration (Recommended for Continuous Deployment)

### Setup Git Repository:
```bash
cd claude/medai
git init
git add .
git commit -m "Initial commit - MedAI v1.0"
```

### Push to GitHub:
1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/medai.git
   git branch -M main
   git push -u origin main
   ```

### Connect to Vercel/Netlify:
1. Go to Vercel or Netlify dashboard
2. Click "Import Project" or "New Site from Git"
3. Select your GitHub repository
4. Configure:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy!

**Benefits**: Every push to main branch auto-deploys!

---

## Environment Variables (For Future Backend Integration)

When you add a backend, create `.env` file:
```env
VITE_API_URL=https://your-api-url.com
VITE_FIREBASE_KEY=your-firebase-key
```

Add to Vercel/Netlify dashboard under "Environment Variables"

---

## Custom Domain Setup

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records as instructed

---

## Performance Optimization

Current build is already optimized:
- ✅ Code splitting enabled
- ✅ CSS minified
- ✅ Assets compressed
- ✅ Tree shaking applied

---

## Deployment Checklist

- [x] Production build successful
- [x] No console errors
- [x] All routes working (React Router configured)
- [x] Images and assets loading
- [x] Responsive design tested
- [ ] Choose deployment platform
- [ ] Deploy!
- [ ] Test live site
- [ ] Share URL with stakeholders

---

## Troubleshooting

**Issue**: Routes not working (404 on refresh)
**Solution**: The `vercel.json` and `netlify.toml` files handle this with SPA redirects

**Issue**: Build fails
**Solution**: Run `npm install` and `npm run build` locally first to check for errors

**Issue**: Assets not loading
**Solution**: Check that base path is correct in `vite.config.js`

---

## Next Steps After Deployment

1. ✅ Share the live URL
2. 📊 Set up analytics (Google Analytics, Vercel Analytics)
3. 🔍 Monitor performance (Lighthouse scores)
4. 🐛 Collect user feedback
5. 🚀 Plan Phase 2 (Database integration)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Docs: https://vitejs.dev/guide/static-deploy.html
