#!/bin/bash
cd /home/ubuntu/ProHOffBackend
echo ".env download"
aws s3 cp s3://prohoff-backend/.env .
pm2 start "node server.js" --name "prohoff-backend"
