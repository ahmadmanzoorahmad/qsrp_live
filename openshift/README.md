# OpenShift Deployment

## Prerequisites

- OpenShift CLI (`oc`) installed and logged in
- Access to an OpenShift 4.x cluster
- A project/namespace created (e.g. `qsrp`)

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build: Node 20 → Nginx 1.25 on port 8080 |
| `nginx.conf` | Nginx config with SPA fallback and security headers |
| `buildconfig.yaml` | OpenShift BuildConfig — builds the Docker image from source |
| `deployment.yaml` | 2-replica Deployment with health checks |
| `service.yaml` | ClusterIP Service exposing port 8080 |
| `route.yaml` | TLS-terminated Route (HTTPS) |

## Deploy Steps

```bash
# 1. Switch to your project
oc project qsrp

# 2. Create an ImageStream to hold the built image
oc create imagestream qsrp-frontend

# 3. Apply configs (edit hostnames / git URLs first)
oc apply -f openshift/buildconfig.yaml
oc apply -f openshift/deployment.yaml
oc apply -f openshift/service.yaml
oc apply -f openshift/route.yaml

# 4. Trigger the first build
oc start-build qsrp-frontend --follow

# 5. Watch rollout
oc rollout status deployment/qsrp-frontend
```

## Notes

- Before applying, replace `NAMESPACE` in `deployment.yaml` with your OpenShift project name.
- Replace `host:` in `route.yaml` with your cluster's actual app subdomain.
- Replace the Git URI in `buildconfig.yaml` with your repository URL.
- The Nginx server listens on **port 8080** (non-root, OpenShift-compatible).
- All data is stored client-side in IndexedDB — no backend pods or persistent volumes are needed.
