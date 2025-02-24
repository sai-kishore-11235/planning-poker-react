# Deploying Planning Poker to Vercel

This guide explains how to deploy the Planning Poker application (both frontend and backend) to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) installed:
```bash
npm install -g vercel
```

## Deployment Steps

1. Login to Vercel CLI:
```bash
vercel login
```

2. Deploy the application:
```bash
vercel
```

3. For production deployment:
```bash
vercel --prod
```

## Project Configuration

The project is configured for Vercel deployment with the following files:

### vercel.json
- Configures both frontend and backend builds
- Sets up routing for Socket.IO and static assets
- Handles API routes and frontend navigation

### package.json
- `vercel-build`: Builds the React application
- `start`: Runs the server in production
- `dev`: Runs React development server locally

## Environment Variables

Set the following environment variables in your Vercel project settings (Settings → Environment Variables):

- `VERCEL_URL`: Automatically set by Vercel
- `PORT`: Optional, defaults to Vercel's assigned port

## Development vs Production

### Local Development
1. Run the React development server:
```bash
npm run dev
```

2. In another terminal, run the backend server:
```bash
npm start
```

### Production
In production (Vercel), both frontend and backend are handled automatically based on the configuration in `vercel.json`.

## Troubleshooting

1. **Socket.IO Connection Issues**
   - Verify CORS configuration in `server.js`
   - Check browser console for connection errors
   - Ensure `VERCEL_URL` is being used correctly

2. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify Node.js version (project uses Node.js 18.x)
   - Ensure all dependencies are properly listed in package.json

3. **Runtime Errors**
   - Check Vercel Function logs in dashboard
   - Verify environment variables are set correctly
   - Check server logs for any Socket.IO connection issues

## Architecture

The deployment architecture consists of:
- Frontend: Static files served through Vercel's CDN
- Backend: Serverless function running the Express/Socket.IO server
- All routes configured to work seamlessly through Vercel's routing layer

## Monitoring

Monitor your application using:
- Vercel Dashboard: Deployment status and basic metrics
- Function Logs: Backend server logs
- Analytics: If enabled in your Vercel account
