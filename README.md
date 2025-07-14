# Mesdo - Professional Networking Platform

## Environment Setup

### Client Environment Variables

Create a `.env` file in the `client` directory:

```bash
REACT_APP_API_URL=your_production_api_url
REACT_APP_SOCKET_URL=your_production_socket_url
```

### Server Environment Variables

Create a `.env` file in the `server` directory:

```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
CLIENT_URL=your_frontend_url
LANGDB_BASE_URL=your_langdb_url
LANGDB_API_KEY=your_langdb_api_key
NODE_ENV=production
PORT=5020
```

## Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] Cloudinary credentials verified
- [ ] Email service configured
- [ ] Socket.IO URLs updated
- [ ] API endpoints tested
- [ ] Error handling verified
