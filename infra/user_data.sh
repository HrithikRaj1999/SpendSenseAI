#!/bin/bash
set -e

# Update and install dependencies
apt-get update
apt-get install -y python3-pip python3-venv nginx git postgresql-client

# Setup app directory
mkdir -p /home/ubuntu/app
chown ubuntu:ubuntu /home/ubuntu/app

# Clone repo (You might need to handle auth for private repos, or just scp the code later)
# For now, we assume we will SCP or git pull a public repo.
# echo "Preparing environment..."

# Setup Nginx
cat <<EOF > /etc/nginx/sites-available/spendsense
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/spendsense /etc/nginx/sites-enabled/
systemctl restart nginx

# Create Systemd service
cat <<EOF > /etc/systemd/system/spendsense.service
[Unit]
Description=SpendSenseAI FastAPI
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/app
EnvironmentFile=/home/ubuntu/app/.env
ExecStart=/home/ubuntu/app/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
