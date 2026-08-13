# Rungika - Remittance Application

## Description

This project consists of a frontend and backend application for a remittance platform.

## Running the Application

### Email configuration

Email sending uses Resend only.

Set this environment variable before running the backend:

```bash
export RESEND_API_KEY=your_resend_api_key
```

Optionally set the sender address used by the application:

```bash
export RESEND_FROM_EMAIL=hello@yourdomain.com
```

### Frontend development

Install dependencies and start the Angular development server:

```bash
cd frontend
npm ci
npm start
```

The app is available at `http://localhost:4200`.

### Deploy the frontend to Render

The repository includes [`render.yaml`](render.yaml), which configures the frontend as a Render Static Site. It builds the Angular app from `frontend` and publishes `frontend/dist/browser`.

To deploy:

1. In Render, select **New > Blueprint** and connect this repository.
2. Select the branch to deploy, then apply the `render.yaml` blueprint.
3. Add the production API URL and any other frontend environment values required by the app in the Render service settings.

The blueprint uses `npm ci` for reproducible installs, runs the production Angular build, and rewrites all routes to `index.html` so Angular client-side routes work when refreshed. Future pushes to the selected branch trigger a new deployment.

For a manual Render Static Site setup, use:

```text
Root Directory: frontend
Build Command: npm ci && npm run build -- --configuration production
Publish Directory: dist/browser
Rewrite: /* -> /index.html
```

### Backend

- Run the following commands:  

```bash
cd backend
gradle bootRun
.\gradlew.bat bootRun
```

- Push the `main` branch to the remote Git repository  
- The application will be automatically deployed a few minutes later. Check status on [https://dashboard.render.com/](https://dashboard.render.com/)

## Used Third-party Tools

- render.com
- resend.com

## TO-DO

- Fix 401 on Stripe checkout
- Expiration of account creation and login tokens
- More details in "Your orders"  
- Manual handling of orders, updating status and send notifications
- Modular stragegy to manage currencies/countries and transfer methods
- Manage recipients of a logged in user
- Unit tests  
