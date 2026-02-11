# LeftistMonitor - Goal Map & Feature Overview

## Executive Summary

LeftistMonitor is a comprehensive educational platform documenting liberation struggles, anti-colonial movements, and progressive history through an interactive world map interface. The project has **430,000+ records** across 710 countries with a fully functional backend (FastAPI + PostgreSQL/PostGIS) and React frontend.

**Status: Production Ready**

---

## Implementation Complete

### Phase 1-6: Core Features
- Interactive world map (MapLibre GL JS)
- Historical borders (1886-2019)
- 20+ feature pages
- Full authentication with 2FA
- 430,000+ records across all data types
- i18n support (6 languages + RTL)

### Phase 7: Community Features
- User contributions system (6 types)
- Moderation dashboard
- Discussion/comments system
- Educational resources

### Phase 8: Additional Data
- Settlement timeline animations
- Historical gallery
- Oral history archive
- Colonial extraction database

### Phase 9: Advanced Analytics
- Prometheus metrics
- Grafana dashboards
- Sentry error tracking
- Performance monitoring
- Privacy-respecting analytics

### Phase 10: Production Readiness
- Comprehensive test suites
- Kubernetes deployment
- CI/CD pipelines
- API documentation

---

## Test Coverage

### Backend Tests
```
backend/tests/
  conftest.py              # Fixtures and configuration
  test_contributions.py    # Contribution API tests
  test_discussions.py      # Discussion API tests
  test_monitoring.py       # Monitoring system tests
```

### Frontend Tests
```
frontend/src/__tests__/
  ContributionForm.test.tsx    # Form validation tests
  DiscussionThread.test.tsx    # Comment system tests
```

---

## Kubernetes Deployment

### Manifests
```
infrastructure/kubernetes/
  namespace.yaml           # Namespace definition
  configmap.yaml           # Application configuration
  secrets.yaml             # Secrets template
  deployment-api.yaml      # API deployment (3 replicas)
  deployment-frontend.yaml # Frontend deployment (2 replicas)
  services.yaml            # Service definitions
  ingress.yaml             # Ingress with TLS
  hpa.yaml                 # Horizontal Pod Autoscaler
```

### Features
- Rolling updates with zero downtime
- Horizontal pod autoscaling (CPU/memory based)
- Health checks (liveness, readiness, startup probes)
- Security contexts (non-root, read-only filesystem)
- Pod anti-affinity for high availability
- Resource limits and requests

---

## CI/CD Pipelines

### CI Pipeline (`.github/workflows/ci.yml`)
- Backend tests with PostgreSQL and Redis services
- Frontend tests with coverage
- Linting (ruff, ESLint)
- Type checking (mypy, TypeScript)
- Security scanning (Trivy, Bandit)
- Docker image building

### CD Pipeline (`.github/workflows/cd.yml`)
- Automatic staging deployment on main branch
- Manual production deployment with approval
- Rollout status monitoring
- Smoke tests after deployment
- Sentry release tracking
- Slack notifications
- Automatic rollback on failure

---

## Monitoring Stack

### Docker Compose (`infrastructure/docker-compose.monitoring.yml`)
- Prometheus (metrics collection)
- Grafana (visualization)
- Alertmanager (alerting)
- Loki + Promtail (log aggregation)
- Node Exporter (system metrics)
- cAdvisor (container metrics)

### Alert Rules
- High error rate (>5%)
- High latency (p95 > 2s)
- Database connection pool exhaustion
- High memory/CPU usage
- Service down detection
- Low disk space
- Low cache hit rate

---

## API Documentation

### OpenAPI Features
- Comprehensive endpoint descriptions
- Request/response examples
- Authentication documentation
- Rate limiting information
- Error response schemas

### Example Endpoints
```
POST /api/v1/contributions
GET  /api/v1/search?query=labor+strike
GET  /api/v1/events/{id}
POST /api/v1/discussions/threads
GET  /metrics
GET  /health
```

---

## File Structure (New Files)

### Backend
```
backend/
  tests/
    conftest.py
    test_contributions.py
    test_discussions.py
    test_monitoring.py
  src/
    api_docs.py
    monitoring/
      __init__.py
      metrics.py
      middleware.py
      health.py
      sentry.py
      performance.py
      analytics.py
      router.py
    contributions/
      __init__.py
      models.py
      service.py
      router.py
    discussions/
      __init__.py
      models.py
      router.py
```

### Frontend
```
frontend/src/
  __tests__/
    ContributionForm.test.tsx
    DiscussionThread.test.tsx
  pages/
    contributions/
      ContributionForm.tsx
      ContributionsDashboard.tsx
      NewContributionPage.tsx
      ModerationDashboard.tsx
    education/
      EducationalResourcesPage.tsx
    SettlementTimelinePage.tsx
    HistoricalGalleryPage.tsx
    OralHistoryPage.tsx
    ColonialExtractionPage.tsx
  components/
    DiscussionThread.tsx
    visualizations/
      SettlementTimeline.tsx
```

### Infrastructure
```
infrastructure/
  kubernetes/
    namespace.yaml
    configmap.yaml
    secrets.yaml
    deployment-api.yaml
    deployment-frontend.yaml
    services.yaml
    ingress.yaml
    hpa.yaml
  grafana/
    provisioning/datasources.yml
    dashboards/application.json
  prometheus/
    prometheus.yml
    alerts.yml
  docker-compose.monitoring.yml

.github/workflows/
  ci.yml
  cd.yml
```

---

## Deployment Checklist

### Prerequisites
- [ ] Kubernetes cluster (EKS, GKE, or AKS)
- [ ] Container registry access
- [ ] Domain name configured
- [ ] TLS certificates (cert-manager recommended)
- [ ] PostgreSQL database
- [ ] Redis instance

### Environment Variables
```bash
# Required secrets
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<random-32-chars>
JWT_REFRESH_SECRET=<random-32-chars>
SENTRY_DSN=<your-sentry-dsn>

# Optional
SMTP_HOST=smtp.example.com
SMTP_USER=...
SMTP_PASSWORD=...
```

### Deploy Commands
```bash
# Apply namespace
kubectl apply -f infrastructure/kubernetes/namespace.yaml

# Apply secrets (edit first!)
kubectl apply -f infrastructure/kubernetes/secrets.yaml

# Apply all resources
kubectl apply -f infrastructure/kubernetes/

# Check status
kubectl get pods -n leftistmonitor
kubectl get svc -n leftistmonitor
kubectl get ingress -n leftistmonitor
```

### Start Monitoring Stack
```bash
cd infrastructure
docker-compose -f docker-compose.monitoring.yml up -d

# Access:
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
# Alertmanager: http://localhost:9093
```

---

## Technology Stack

### Backend
- Python 3.11+, FastAPI 0.109+
- PostgreSQL 15+ with PostGIS
- Redis 7+
- SQLAlchemy 2.0
- structlog, prometheus-client, sentry-sdk

### Frontend
- React 18, TypeScript, Vite
- MapLibre GL JS 4.0
- Recharts, D3.js
- Tailwind CSS, i18next

### Infrastructure
- Kubernetes 1.28+
- Nginx Ingress Controller
- cert-manager (TLS)
- Prometheus/Grafana stack

### CI/CD
- GitHub Actions
- Docker/Buildx
- Trivy (security scanning)

---

## Routes Summary

### Public Routes
- `/` - Home/Map
- `/movements/*` - Movement pages
- `/liberation/*` - Liberation pages
- `/visualizations/*` - Data visualizations
- `/gallery` - Historical gallery
- `/oral-history` - Oral history archive
- `/colonial-extraction` - Extraction database
- `/education` - Educational resources

### Authenticated Routes
- `/contributions` - User contributions
- `/contribute/new` - Submit contribution

### Admin Routes
- `/moderation` - Moderation dashboard

### API Endpoints
- `/api/v1/*` - Main API
- `/metrics` - Prometheus metrics
- `/health` - Health check
- `/healthz` - Liveness probe
- `/readyz` - Readiness probe

---

*Updated: February 2026*
*Status: PRODUCTION READY*
