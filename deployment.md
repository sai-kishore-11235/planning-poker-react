# Planning Poker Deployment Plan

## Project Structure

The application consists of two main parts:
1. Frontend: React TypeScript application
2. Backend: Node.js WebSocket server

## Prerequisites

- Node.js 14+ installed on the deployment server
- npm or yarn package manager
- A domain name (for production deployment)
- SSL certificate (for secure WebSocket connections)

## Environment Variables

### Frontend (.env)
```
REACT_APP_WS_URL=wss://your-domain.com
REACT_APP_API_URL=https://your-domain.com
```

### Backend (.env)
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

## Build Process

1. Frontend Build:
```bash
# Install dependencies
npm install

# Build React application
npm run build

# Output will be in the 'build' directory
```

2. Backend Build:
```bash
# Install production dependencies
npm install --production

# Create server build directory
mkdir server-build
cp server.js package.json package-lock.json server-build/
```

## Deployment Steps

### Option 1: Traditional Hosting

1. Frontend Deployment:
   - Upload the contents of the `build` directory to your web server
   - Configure web server (Apache/Nginx) to serve the static files
   - Set up URL rewriting to handle React Router

2. Backend Deployment:
   - Upload the `server-build` directory to your server
   - Install dependencies: `npm install --production`
   - Use PM2 or similar process manager to run the server:
     ```bash
     pm2 start server.js --name "planning-poker"
     ```

### Option 2: Docker Deployment

1. Create Dockerfile for Frontend:
```dockerfile
FROM node:14-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create Dockerfile for Backend:
```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY server-build/ .
RUN npm install --production
EXPOSE 3001
CMD ["node", "server.js"]
```

3. Create docker-compose.yml:
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    environment:
      - REACT_APP_WS_URL=wss://your-domain.com
      - REACT_APP_API_URL=https://your-domain.com

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - NODE_ENV=production
      - CORS_ORIGIN=https://your-domain.com
```

### Option 3: Cloud Platform Deployment

1. Frontend on Netlify/Vercel:
   - Connect your Git repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Configure environment variables

2. Backend on Heroku:
   - Create new Heroku app
   - Connect Git repository
   - Set environment variables
   - Deploy using Heroku Git or GitHub integration

## SSL Configuration

1. Obtain SSL certificate (Let's Encrypt recommended)
2. Configure SSL in web server or cloud platform
3. Update WebSocket connection to use WSS protocol

## Monitoring and Maintenance

1. Set up monitoring:
   - Server health checks
   - WebSocket connection status
   - Error logging
   - Performance metrics

2. Configure logging:
   - Application logs
   - Access logs
   - Error logs

3. Backup strategy:
   - Regular database backups (if added in future)
   - Configuration backups
   - Automated backup testing

## Scaling Considerations

1. Horizontal Scaling:
   - Use Redis for session storage
   - Implement sticky sessions for WebSocket connections
   - Load balancer configuration

2. Performance Optimization:
   - Enable gzip compression
   - Configure caching headers
   - Optimize static assets
   - Implement CDN for static content

## Security Measures

1. Enable security headers:
   - HSTS
   - CSP
   - XSS Protection
   - Frame Options

2. Rate limiting:
   - API endpoints
   - WebSocket connections
   - User actions

3. Input validation:
   - Sanitize user input
   - Validate data types
   - Prevent injection attacks

## Rollback Plan

1. Maintain version history
2. Keep previous deployment artifacts
3. Document rollback procedures
4. Test rollback process regularly

## Testing Checklist

Before deployment:
- [ ] Run all unit tests
- [ ] Run integration tests
- [ ] Test WebSocket connections
- [ ] Verify environment variables
- [ ] Check build output
- [ ] Test on staging environment

After deployment:
- [ ] Verify application loads
- [ ] Test user authentication
- [ ] Verify WebSocket connectivity
- [ ] Check all main features
- [ ] Monitor error logs
- [ ] Verify SSL certificates
