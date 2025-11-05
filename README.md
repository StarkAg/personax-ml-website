# PersonaX ML Website

E-commerce Customer Persona Development website featuring RFM analysis and customer segmentation using K-Means clustering and PCA visualization.

## Deployment to Vercel

### Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Vercel will automatically detect it as a static site
5. Click "Deploy"

### Option 3: Using Git Integration

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Vercel will automatically deploy on every push to your main branch

## Project Structure

- `index.html` - Main landing page
- `dashboard.html` - Interactive dashboard with charts and analytics
- `vercel.json` - Vercel configuration file

## Features

- Customer Persona Development
- RFM Analysis (Recency, Frequency, Monetary)
- K-Means Clustering
- PCA Visualization
- Interactive Dashboard with Plotly charts

## Live Demo

🌐 **Live Website**: [https://personax-ml-website-demuok0yp-starkags-projects.vercel.app](https://personax-ml-website-demuok0yp-starkags-projects.vercel.app)

## Project Structure

```
PersonaX ML WebSite/
├── index.html              # Main landing page
├── dashboard.html          # Interactive dashboard with charts and analytics
├── vercel.json             # Vercel configuration file
├── .vercelignore          # Files to ignore during Vercel deployment
├── README.md              # Project documentation
└── Persona With React/    # React version (optional)
    ├── App.jsx
    ├── main.jsx
    └── src/
```

## Technologies Used

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Visualization**: Plotly.js for interactive charts
- **Deployment**: Vercel
- **ML/Analytics**: Python (Jupyter Notebooks for data analysis)

## Getting Started

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd PersonaX-ML-WebSite
   ```

2. Open `index.html` in your browser to view the landing page
3. Open `dashboard.html` to view the interactive dashboard

## Development

The website is a static site that can be run locally by simply opening the HTML files in a browser, or by using a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

## Contributing

This is an academic/hackathon project. Feel free to fork and improve!

## License

This project is developed for academic/hackathon purposes.

