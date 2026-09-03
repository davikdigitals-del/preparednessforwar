# Deployment Guide

## Overview

Complete guide for deploying Preparedness For War to handle 6 million requests/second using Docker and Kubernetes.

## Quick Start

```bash
# 1. Build Docker image
docker build -t preparednessforwar:latest .

# 2. Run locally with Docker Compose
docker-compose up -d

# 3. Deploy to Kubernetes
kubectl apply -f k8s/
```

## Table of Contents

1. [Docker Setup](#docker-setup)
2. [Kubernetes Setup](#kubernetes-setup)
3. [Production Deployment](#production-deployment)
4. [Scaling Strategy](#scaling-strategy)
5. [Troubleshooting](#troubleshooting)

---

## Docker Setup

### Build Docker Image

```bash
# Build for production
docker build -t preparednessforwar:latest .

# Build for specific architecture
docker buildx build --platform linux/amd64 -t preparednessforwar:latest .

# Build and push to registry
docker build -t your-registry.com/preparednessforwar:v1.0.0 .
docker push your-registry.com/preparednessforwar:v1.0.0
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps

# Stop services
docker-compose down
```

### Test Docker Image

```bash
# Run container
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e REDIS_HOST=redis \
  --name preparednessforwar \
  preparednessforwar:latest

# Check health
curl http://localhost:3000/health

# View logs
docker logs -f preparednessforwar

# Stop container
docker stop preparednessforwar
docker rm preparednessforwar
```

---

## Kubernetes Setup

### Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify cluster access
kubectl cluster-info
kubectl get nodes
```

### Create Kubernetes Cluster

**AWS EKS:**
```bash
# Install eksctl
brew install eksctl

# Create cluster
eksctl create cluster \
  --name preparednessforwar-prod \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type c5.2xlarge \
  --nodes 10 \
  --nodes-min 10 \
  --nodes-max 1000 \
  --managed \
  --asg-access \
  --enable-ssm
```

**GKE (Google):**
```bash
# Create cluster
gcloud container clusters create preparednessforwar-prod \
  --zone us-central1-a \
  --machine-type n2-standard-8 \
  --num-nodes 10 \
  --enable-autoscaling \
  --min-nodes 10 \
  --max-nodes 1000 \
  --enable-autorepair \
  --enable-autoupgrade
```

**AKS (Azure):**
```bash
# Create cluster
az aks create \
  --resource-group preparednessforwar-rg \
  --name preparednessforwar-prod \
  --node-count 10 \
  --node-vm-size Standard_D8s_v3 \
  --enable-cluster-autoscaler \
  --min-count 10 \
  --max-count 1000
```

### Deploy to Kubernetes

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create secrets (replace with actual values)
kubectl create secret generic supabase-secret \
  --from-literal=url=YOUR_SUPABASE_URL \
  --from-literal=anon-key=YOUR_ANON_KEY \
  --from-literal=service-role-key=YOUR_SERVICE_ROLE_KEY \
  -n production

# 3. Apply ConfigMaps
kubectl apply -f k8s/configmap.yaml

# 4. Deploy Redis
kubectl apply -f k8s/redis.yaml

# 5. Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 6. Setup autoscaling
kubectl apply -f k8s/hpa.yaml

# 7. Configure ingress
kubectl apply -f k8s/ingress.yaml

# 8. Apply Pod Disruption Budget
kubectl apply -f k8s/pdb.yaml

# 9. Setup monitoring
kubectl apply -f k8s/servicemonitor.yaml
```

### Verify Deployment

```bash
# Check all resources
kubectl get all -n production

# Check pods
kubectl get pods -n production
kubectl describe pod <pod-name> -n production

# Check logs
kubectl logs -f deployment/preparednessforwar-app -n production

# Check service
kubectl get svc -n production
kubectl describe svc preparednessforwar-service -n production

# Check HPA
kubectl get hpa -n production
kubectl describe hpa preparednessforwar-hpa -n production

# Check ingress
kubectl get ingress -n production
```

---

## Production Deployment

### 1. Build and Push Image

```bash
# Tag image with version
docker build -t your-registry.com/preparednessforwar:1.0.0 .
docker tag your-registry.com/preparednessforwar:1.0.0 your-registry.com/preparednessforwar:latest

# Push to registry
docker push your-registry.com/preparednessforwar:1.0.0
docker push your-registry.com/preparednessforwar:latest
```

### 2. Update Kubernetes Manifests

```bash
# Update deployment image
kubectl set image deployment/preparednessforwar-app \
  app=your-registry.com/preparednessforwar:1.0.0 \
  -n production

# Or edit deployment
kubectl edit deployment preparednessforwar-app -n production
```

### 3. Rolling Update

```bash
# Watch rollout status
kubectl rollout status deployment/preparednessforwar-app -n production

# Check rollout history
kubectl rollout history deployment/preparednessforwar-app -n production

# Pause rollout
kubectl rollout pause deployment/preparednessforwar-app -n production

# Resume rollout
kubectl rollout resume deployment/preparednessforwar-app -n production

# Rollback to previous version
kubectl rollout undo deployment/preparednessforwar-app -n production

# Rollback to specific revision
kubectl rollout undo deployment/preparednessforwar-app --to-revision=2 -n production
```

### 4. Zero-Downtime Deployment

```bash
# Canary deployment (10% traffic to new version)
kubectl patch deployment preparednessforwar-app -n production -p \
  '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":"10%","maxUnavailable":"0%"}}}}'

# Blue-Green deployment using labels
# Deploy new version with different label
kubectl apply -f k8s/deployment-v2.yaml

# Switch traffic by updating service selector
kubectl patch service preparednessforwar-service -n production -p \
  '{"spec":{"selector":{"version":"v2"}}}'
```

---

## Scaling Strategy

### Horizontal Pod Autoscaling (HPA)

```bash
# Check HPA status
kubectl get hpa -n production

# Describe HPA
kubectl describe hpa preparednessforwar-hpa -n production

# Manual scaling
kubectl scale deployment preparednessforwar-app --replicas=50 -n production

# Update HPA limits
kubectl patch hpa preparednessforwar-hpa -n production -p \
  '{"spec":{"minReplicas":20,"maxReplicas":2000}}'
```

### Cluster Autoscaling

**AWS EKS:**
```bash
# Update node group
eksctl scale nodegroup \
  --cluster=preparednessforwar-prod \
  --nodes=50 \
  --nodes-min=10 \
  --nodes-max=1000 \
  standard-workers
```

**GKE:**
```bash
# Update cluster autoscaling
gcloud container clusters update preparednessforwar-prod \
  --enable-autoscaling \
  --min-nodes 10 \
  --max-nodes 1000 \
  --zone us-central1-a
```

### Vertical Pod Autoscaling (VPA)

```bash
# Install VPA
kubectl apply -f https://github.com/kubernetes/autoscaler/releases/download/vertical-pod-autoscaler-0.13.0/vpa-v0.13.0.yaml

# Apply VPA
kubectl apply -f k8s/hpa.yaml  # Contains VPA config

# Check VPA recommendations
kubectl describe vpa preparednessforwar-vpa -n production
```

---

## Load Testing

### Using k6

```bash
# Install k6
brew install k6

# Run load test
k6 run load-tests/spike-test.js

# Run with specific VUs and duration
k6 run --vus 1000 --duration 5m load-tests/load-test.js

# Run distributed load test
k6 cloud run load-tests/stress-test.js
```

### Monitor During Load Test

```bash
# Watch HPA
watch -n 1 kubectl get hpa -n production

# Watch pods
watch -n 1 kubectl get pods -n production

# Watch metrics
kubectl top pods -n production
kubectl top nodes

# Check Grafana dashboard
open http://grafana-url/d/preparednessforwar
```

---

## Monitoring

### View Metrics

```bash
# Port forward to Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Port forward to Grafana
kubectl port-forward -n monitoring svc/grafana 3001:3000

# View application metrics
curl http://localhost:3000/metrics

# View application health
curl http://localhost:3000/health
```

### View Logs

```bash
# Stream logs from all pods
kubectl logs -f deployment/preparednessforwar-app -n production --all-containers=true

# Stream logs with labels
kubectl logs -f -l app=preparednessforwar -n production

# Previous logs (after crash)
kubectl logs --previous <pod-name> -n production

# Export logs to file
kubectl logs deployment/preparednessforwar-app -n production > app.log
```

---

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n production
kubectl describe pod <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n production

# Check resource usage
kubectl top pod <pod-name> -n production
```

### High Memory Usage

```bash
# Check memory usage
kubectl top pods -n production

# Increase memory limit
kubectl set resources deployment preparednessforwar-app \
  --limits=memory=2Gi \
  -n production

# Check for memory leaks in logs
kubectl logs -f <pod-name> -n production | grep -i "memory"
```

### High CPU Usage

```bash
# Check CPU usage
kubectl top pods -n production

# Increase CPU limit
kubectl set resources deployment preparednessforwar-app \
  --limits=cpu=2 \
  -n production

# Check which pods are consuming most CPU
kubectl top pods -n production --sort-by=cpu
```

### Service Not Accessible

```bash
# Check service
kubectl get svc -n production
kubectl describe svc preparednessforwar-service -n production

# Check endpoints
kubectl get endpoints -n production

# Test internal connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://preparednessforwar-internal:3000/health

# Check ingress
kubectl describe ingress preparednessforwar-ingress -n production
```

### Database Connection Issues

```bash
# Test Redis connection
kubectl run -it --rm redis-test --image=redis:alpine --restart=Never -- \
  redis-cli -h redis-service ping

# Check secrets
kubectl get secret supabase-secret -n production -o yaml

# Test database connection from pod
kubectl exec -it <pod-name> -n production -- \
  node -e "console.log(process.env.VITE_SUPABASE_URL)"
```

---

## Cleanup

```bash
# Delete all resources
kubectl delete namespace production

# Delete cluster (EKS)
eksctl delete cluster --name preparednessforwar-prod

# Delete cluster (GKE)
gcloud container clusters delete preparednessforwar-prod --zone us-central1-a

# Delete cluster (AKS)
az aks delete --resource-group preparednessforwar-rg --name preparednessforwar-prod
```

---

## Cost Optimization

### Right-size Resources

```bash
# Use VPA recommendations
kubectl describe vpa preparednessforwar-vpa -n production

# Apply recommendations
kubectl set resources deployment preparednessforwar-app \
  --requests=cpu=250m,memory=512Mi \
  --limits=cpu=1,memory=1Gi \
  -n production
```

### Use Spot Instances

```bash
# AWS: Create spot instance node group
eksctl create nodegroup \
  --cluster=preparednessforwar-prod \
  --node-type=c5.2xlarge \
  --nodes-min=10 \
  --nodes-max=500 \
  --spot \
  --instance-types=c5.2xlarge,c5.4xlarge,c5a.2xlarge
```

### Scale Down During Off-Peak

```bash
# Schedule scaling with CronJob
# Scale down at night (e.g., 2 AM)
kubectl create cronjob scale-down \
  --image=bitnami/kubectl:latest \
  --schedule="0 2 * * *" \
  -- kubectl scale deployment preparednessforwar-app --replicas=10 -n production

# Scale up in morning (e.g., 6 AM)
kubectl create cronjob scale-up \
  --image=bitnami/kubectl:latest \
  --schedule="0 6 * * *" \
  -- kubectl scale deployment preparednessforwar-app --replicas=100 -n production
```

---

## Next Steps

1. ✅ Deploy to Kubernetes
2. → Setup CI/CD pipeline
3. → Configure monitoring and alerting
4. → Run load tests
5. → Optimize based on metrics
6. → Setup disaster recovery
7. → Document runbooks

---

**Target Performance:**
- 6M requests/second
- P95 response time < 100ms
- 99.99% uptime
- Auto-scale from 10 to 1000+ pods
