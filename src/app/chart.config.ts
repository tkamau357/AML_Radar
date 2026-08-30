// // src/app/chart.config.ts
// import { Chart, registerables } from 'chart.js';

// Chart.register(...registerables);

// export { Chart };



// src/app/chart.config.ts
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

// Optional: Global configuration
Chart.defaults.font.family = "'Inter', 'sans-serif'";
Chart.defaults.font.size = 12;
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

export { Chart };