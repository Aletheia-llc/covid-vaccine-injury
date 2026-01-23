# Automation & Tools Setup

This directory contains automation workflows, design specs, and performance reports.

## Quick Start

### 1. Local Redis (For Rate Limit Testing)

```bash
# Start Redis
docker run -d --name redis-dev -p 6379:6379 redis:alpine

# Verify it's running
docker exec redis-dev redis-cli ping
# Should return: PONG

# Stop when done
docker stop redis-dev
```

### 2. n8n Workflows

n8n is already running at http://localhost:5678

**Import Workflows:**
1. Open http://localhost:5678
2. Create a new workflow
3. Use the templates in `n8n-workflows.json`
4. Configure email credentials
5. Activate workflows

**Available Webhooks:**
| Webhook | Trigger |
|---------|---------|
| `/webhook/survey-submitted` | New survey response |
| `/webhook/contact-submitted` | Contact form submission |
| `/webhook/new-subscriber` | Newsletter signup |
| `/webhook/donation-received` | Completed donation |

### 3. Stripe CLI (For Webhook Testing)

```bash
# Login to Stripe
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/donation-webhook

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

### 4. GitHub CLI

```bash
# Authenticate
gh auth login

# Create issues
gh issue create --title "Bug: ..." --body "Description"

# Create PRs
gh pr create --title "Feature: ..." --body "Description"
```

### 5. Lighthouse Audits

```bash
# Run audit on production
lighthouse https://www.covidvaccineinjury.us --view

# Run audit on local dev
lighthouse http://localhost:3000 --view
```

---

## Latest Lighthouse Results

**Date:** January 23, 2025

| Category | Score | Status |
|----------|-------|--------|
| Performance | 57% | ⚠️ Needs improvement |
| Accessibility | 82% | ⚠️ Needs improvement |
| Best Practices | 100% | ✅ Excellent |
| SEO | 100% | ✅ Excellent |

### Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP (Largest Contentful Paint) | 9.6s | < 2.5s | ❌ Poor |
| FCP (First Contentful Paint) | 8.3s | < 1.8s | ❌ Poor |
| TBT (Total Blocking Time) | 0ms | < 200ms | ✅ Good |
| CLS (Cumulative Layout Shift) | 0.004 | < 0.1 | ✅ Good |

### Performance Issues

The slow LCP/FCP is likely due to:
1. **Cold starts** on Vercel serverless functions
2. **Database queries** on initial page load
3. **Large JavaScript bundle** (175kb shared)

### Recommended Fixes

1. **Enable ISR (Incremental Static Regeneration)** for homepage
2. **Add loading skeletons** for above-the-fold content
3. **Preconnect to external domains** (fonts, analytics)
4. **Optimize images** with next/image priority

### Accessibility Issues

- **Color contrast** - Some text may not meet WCAG AA standards
- Check footer links and muted text colors

---

## Files in This Directory

| File | Purpose |
|------|---------|
| `n8n-workflows.json` | Workflow templates for n8n |
| `FIGMA-DESIGN-SPEC.md` | Social media asset specifications |
| `lighthouse-report.report.html` | Full Lighthouse report (open in browser) |
| `lighthouse-report.report.json` | Raw Lighthouse data |

---

## Environment Variables

Add to `.env` for full automation:

```bash
# n8n webhooks
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# For production n8n
# N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

---

## Docker Services

| Service | Port | Command |
|---------|------|---------|
| Redis (dev) | 6379 | `docker start redis-dev` |
| n8n | 5678 | Already running |
| Open WebUI | 3000 | Already running (move to 3001 for dev) |

**Tip:** The site dev server may conflict with Open WebUI on port 3000. Use:
```bash
PORT=3001 npm run dev
```
