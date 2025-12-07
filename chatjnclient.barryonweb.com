# Redirect all HTTP traffic to HTTPS
server {
    listen 80;
    server_name chatjnclient.barryonweb.com;
    return 301 https://$host$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl;
    server_name chatjnclient.barryonweb.com;

    root /var/www/chatapp/frontend;
    index index.html;

    # SSL certificate paths from Certbot
    ssl_certificate /etc/letsencrypt/live/chatjnclient.barryonweb.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chatjnclient.barryonweb.com/privkey.pem;

    location / {
        try_files $uri /index.html;
    }
}
