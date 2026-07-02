# Social Media Platform

A full-stack social media web app with a React frontend and Django backend.

## Features
- User login and profile view
- Feed with posts, likes, comments, and follow actions
- Photo upload support
- Responsive UI

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```
   This runs the Django backend and the Vite frontend together.

## Deployment to GitHub
1. Initialize or confirm the Git remote:
   ```bash
   git remote -v
   ```
2. Add or confirm the GitHub repository remote:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   ```
3. Commit your changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
4. Push to GitHub:
   ```bash
   git push -u origin main
   ```

## Notes
- The frontend is served by Vite.
- The backend runs through Django on port 8000.
- For production deployment, you can host the frontend on Vercel or Netlify and the backend on Render, Railway, or PythonAnywhere.
