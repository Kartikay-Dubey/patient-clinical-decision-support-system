# 🚀 Full-Stack Production Deployment Guide

This guide provides end-to-end instructions for deploying the **Patient Clinical Decision Support System (CDSS)** backend (FastAPI + ML models) and frontend (React + Three.js + Vite).

---

## 📋 Architecture Overview

| Component | Technology | Default Port | Production Role |
| :--- | :--- | :--- | :--- |
| **Backend API** | FastAPI + Scikit-Learn + DDXPlus ML | `8000` | REST API, NLP symptom parsing, diagnostic scoring |
| **Frontend** | React 18 + Three.js + Vite + TailwindCSS | `3000` (or `80`) | 3D human anatomy viewer, triage intake, clinical guidance |
| **Reverse Proxy** | Nginx | `80` / `443` | SSL termination, SPA routing, `/api/` forwarding |

---

## 🌟 Choose Your Deployment Method

- **[Method 1: Managed Cloud (Render + Vercel)](#method-1-managed-cloud-deployment-recommended-for-quick-setup)** — Fastest, free tier available, zero server maintenance.
- **[Method 2: Docker & Docker Compose](#method-2-docker--docker-compose-deployment)** — Portable, containerized, runs anywhere with 1 command.
- **[Method 3: Dedicated Linux VPS (AWS EC2 / DigitalOcean)](#method-3-dedicated-linux-vps-deployment-aws-ec2--digitalocean--ubuntu)** — Full control, highest performance, custom domain with free SSL.

---

## Method 1: Managed Cloud Deployment (Recommended for Quick Setup)

### Step 1: Deploy Backend to Render (Free / Cheap)
1. Go to [Render.com](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository: `patient-diagnosis-system`.
3. Configure the following settings:
   - **Name**: `cdss-backend`
   - **Environment**: `Python 3`
   - **Region**: Nearest to your users (e.g., `Frankfurt` or `Ohio`)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (or `.`)
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     python run_server.py
     ```
     *(Or: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`)*
4. Click **Create Web Service**. Once deployed, Render will provide a public URL like:
   `https://cdss-backend.onrender.com`

---

### Step 2: Deploy Frontend to Vercel (Free)
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your `patient-diagnosis-system` repository.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://cdss-backend.onrender.com` *(your Render backend URL from Step 1)*
5. Click **Deploy**. Your frontend is live at `https://patient-diagnosis-system.vercel.app`.

---

## Method 2: Docker & Docker Compose Deployment

The repository includes ready-to-use Dockerfiles and `docker-compose.yml`.

### Prerequisites
- Docker & Docker Compose installed (`docker --version`, `docker compose version`).

### Step 1: Build & Launch All Services
From the project root directory, run:

```bash
# Build images and start containers in detached mode
docker compose up -d --build
```

### Step 2: Verify Status
```bash
# Check container status
docker compose ps

# View live logs
docker compose logs -f
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`

### Step 3: Stop Services
```bash
docker compose down
```

---

## Method 3: Dedicated Linux VPS Deployment (AWS EC2 / DigitalOcean / Ubuntu)

Use this method for production servers running **Ubuntu 22.04 / 24.04 LTS**.

### Step 1: Server Preparation & System Packages
SSH into your server:
```bash
ssh ubuntu@your-server-ip
```

Update system and install Python 3.11, Node.js 20, Nginx, and Git:
```bash
# 1. Update APT
sudo apt update && sudo apt upgrade -y

# 2. Install Python 3.11 & Build tools
sudo apt install -y python3 python3-pip python3-venv git nginx curl ufw

# 3. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Configure Firewall:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

### Step 2: Clone & Set Up the Repository
```bash
# Clone the repository
cd /var/www
sudo git clone https://github.com/your-username/patient-diagnosis-system.git
sudo chown -R $USER:$USER /var/www/patient-diagnosis-system
cd /var/www/patient-diagnosis-system

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt
```

---

### Step 3: Configure Systemd Daemon for FastAPI Backend
Create a systemd service file so the backend runs continuously and restarts on reboot:

```bash
sudo nano /etc/systemd/system/cdss-backend.service
```

Paste the following configuration:
```ini
[Unit]
Description=CDSS FastAPI & ML Diagnostic Backend Service
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/patient-diagnosis-system
Environment="PATH=/var/www/patient-diagnosis-system/venv/bin"
Environment="PYTHONPATH=/var/www/patient-diagnosis-system"
ExecStart=/var/www/patient-diagnosis-system/venv/bin/gunicorn backend.app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/cdss-backend-access.log \
    --error-logfile /var/log/cdss-backend-error.log

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable cdss-backend
sudo systemctl start cdss-backend

# Check status
sudo systemctl status cdss-backend
```

---

### Step 4: Build the Frontend Static Assets
```bash
cd /var/www/patient-diagnosis-system/frontend
npm install
npm run build
```
This produces optimized production files in `/var/www/patient-diagnosis-system/frontend/dist`.

---

### Step 5: Configure Nginx as Reverse Proxy
Create an Nginx server block:
```bash
sudo nano /etc/nginx/sites-available/cdss
```

Paste the following Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com; # Replace with your domain or server IP

    # Root directory for frontend static build
    root /var/www/patient-diagnosis-system/frontend/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Cache static assets (JS, CSS, SVGs, 3D GLB/JSON models)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /models/ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Proxy API requests to FastAPI Gunicorn daemon
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Proxy Swagger API docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }
    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
    }

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/cdss /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 6: Enable Free SSL / HTTPS (Let's Encrypt Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will automatically obtain certificates and update your Nginx configuration with auto-renewal enabled.

---

## 🔍 Verification & Health Check

1. **Verify Backend Health**:
   ```bash
   curl http://127.0.0.1:8000/docs
   ```
2. **Verify Diagnosis API Request**:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/v1/analyze \
     -H "Content-Type: application/json" \
     -d '{"rawSymptoms": "chest pain and shortness of breath", "structuredSymptoms": ["chest_pain"]}'
   ```
3. **Verify Service Logs**:
   ```bash
   sudo journalctl -u cdss-backend -f
   ```

---

## 🛠️ Updating the Live Application

When you push new updates to Git:

```bash
cd /var/www/patient-diagnosis-system
git pull origin main

# Update backend
source venv/bin/activate
pip install -r backend/requirements.txt
sudo systemctl restart cdss-backend

# Update frontend
cd frontend
npm install
npm run build

echo "Deployment update complete!"
```
