openssl genrsa 2048 > server.key
yes "" | openssl req -new -key server.key > server.csr
openssl x509 -days 3650 -req -signkey server.key < server.csr > server.crt
