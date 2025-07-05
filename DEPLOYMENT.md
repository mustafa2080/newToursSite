# Premium Tours - Deployment Guide

## 🚀 Deployment Strategy

### Recommended Platforms

#### Frontend Deployment
- **Primary**: Vercel (Recommended)
  - Automatic deployments from Git
  - Global CDN
  - Built-in performance optimization
  - Zero-config SSL

- **Alternative**: Netlify
  - Similar features to Vercel
  - Great for static sites
  - Built-in form handling

#### Backend Deployment
- **Primary**: Railway (Recommended)
  - Easy PostgreSQL setup
  - Automatic deployments
  - Built-in monitoring
  - Reasonable pricing

- **Alternative**: Render
  - Free tier available
  - Managed PostgreSQL
  - Auto-scaling

#### Database Options
- **Primary**: Supabase (Recommended)
  - Managed PostgreSQL
  - Built-in auth (if needed)
  - Real-time subscriptions
  - Generous free tier

- **Alternative**: Neon
  - Serverless PostgreSQL
  - Branching for development
  - Auto-scaling

### Self-Hosted Deployment (Docker)

#### Prerequisites
- Docker & Docker Compose
- Domain name with DNS access
- SSL certificates (Let's Encrypt recommended)

#### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd premium-tours
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Configure environment variables**
```env
# Database
POSTGRES_DB=tours
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Redis
REDIS_PASSWORD=your_redis_password

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# Cloudinary (Image hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URLs
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
VITE_SITE_URL=https://yourdomain.com

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=your_grafana_password
```

4. **Deploy with Docker Compose**
```bash
# Production deployment
docker-compose -f deployment/docker-compose.yml up -d

# Check status
docker-compose -f deployment/docker-compose.yml ps

# View logs
docker-compose -f deployment/docker-compose.yml logs -f
```

#### SSL Configuration

1. **Using Let's Encrypt with Certbot**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

2. **Update Nginx configuration**
- Uncomment HTTPS server block in `frontend/nginx.conf`
- Update certificate paths
- Restart containers

### Cloud Deployment (Recommended)

#### Vercel Frontend Deployment

1. **Connect Repository**
   - Import project from GitHub
   - Select frontend directory as root

2. **Environment Variables**
```env
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
VITE_SITE_URL=https://your-domain.vercel.app
```

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

#### Railway Backend Deployment

1. **Create New Project**
   - Connect GitHub repository
   - Select backend directory

2. **Add PostgreSQL Database**
   - Add PostgreSQL service
   - Note connection details

3. **Environment Variables**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
# ... other environment variables
```

4. **Deploy Settings**
   - Start Command: `node src/server.js`
   - Health Check: `/api/health`

#### Supabase Database Setup

1. **Create Project**
   - Sign up at supabase.com
   - Create new project

2. **Run Schema**
   - Go to SQL Editor
   - Run `backend/src/config/schema.sql`
   - Run `backend/src/config/seed-data.sql`

3. **Get Connection String**
   - Settings → Database
   - Copy connection string
   - Update `DATABASE_URL` in backend

## 📊 Monitoring & Analytics

### Application Monitoring

#### Sentry Integration
```bash
# Install Sentry
npm install @sentry/node @sentry/react

# Configure in backend
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "YOUR_SENTRY_DSN" });

# Configure in frontend
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
```

#### LogRocket (Frontend)
```javascript
import LogRocket from 'logrocket';
LogRocket.init('your-app-id');
```

### Performance Monitoring

#### Google Analytics 4
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### Core Web Vitals
- Already implemented in `frontend/src/utils/performance.js`
- Monitor through Google Search Console
- Set up alerts for performance degradation

### Infrastructure Monitoring

#### Self-Hosted (Prometheus + Grafana)
- Included in Docker Compose
- Access Grafana at `http://localhost:3001`
- Default dashboards for system metrics

#### Cloud Monitoring
- **Vercel**: Built-in analytics and performance monitoring
- **Railway**: Application metrics and logs
- **Supabase**: Database performance metrics

## 🔒 Security Checklist

### Pre-Deployment Security

- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] API keys restricted by domain/IP
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF protection implemented

### Post-Deployment Security

- [ ] Security scanning (Snyk, OWASP ZAP)
- [ ] Penetration testing
- [ ] Vulnerability monitoring
- [ ] Regular dependency updates
- [ ] Security incident response plan
- [ ] Backup and recovery testing

## 📈 Scalability Recommendations

### Database Optimization
- Connection pooling (PgBouncer)
- Read replicas for heavy read workloads
- Database indexing optimization
- Query performance monitoring

### Caching Strategy
- Redis for session storage
- CDN for static assets
- Application-level caching
- Database query caching

### Load Balancing
- Multiple backend instances
- Database connection pooling
- CDN for global distribution
- Auto-scaling based on metrics

### Performance Optimization
- Image optimization (WebP, lazy loading)
- Code splitting and lazy loading
- Service Worker for offline support
- Database query optimization

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check connection string format
   - Verify network connectivity
   - Check firewall settings

2. **CORS Issues**
   - Update CORS origins in backend
   - Check environment variables
   - Verify domain configuration

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Clear npm cache

4. **Performance Issues**
   - Monitor database queries
   - Check memory usage
   - Analyze bundle size

### Health Checks

- Frontend: `GET /health`
- Backend: `GET /api/health`
- Database: Connection test in backend health check

### Logs and Debugging

```bash
# Docker logs
docker-compose logs -f [service-name]

# Application logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Database logs
docker exec -it tours_postgres psql -U postgres -d tours
```

## 📞 Support

For deployment issues:
1. Check this documentation
2. Review application logs
3. Check monitoring dashboards
4. Contact development team

---

**Note**: This deployment guide covers production-ready configurations. Always test in a staging environment before deploying to production.
