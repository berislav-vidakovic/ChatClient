server {
    listen 80;
    server_name chatjnclient.barryonweb.com;

    root /var/www/chatapp/frontend;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
