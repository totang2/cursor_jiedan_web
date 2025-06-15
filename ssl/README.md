# SSL Certificates Directory

This directory contains SSL certificates for HTTPS support:

- `certs/`: Contains the SSL certificate (nginx.crt)
- `private/`: Contains the private key (nginx.key)

These directories will be mounted to the Nginx container at runtime.

To generate new certificates, run the generate-cert.sh script in the parent directory.