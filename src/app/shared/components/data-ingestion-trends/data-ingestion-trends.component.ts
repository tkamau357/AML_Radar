import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
} from "@angular/core";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartConfiguration,
} from "chart.js";

/**
 * Custom plugin:
 * Draws short vertical lines ABOVE each month label (inside chart area)
 */
const xAxisPointerPlugin = {
  id: "xAxisPointer",
  afterDraw(chart: Chart) {
    const { ctx, scales, chartArea } = chart;
    const xScale = scales["x"];

    if (!xScale) return;

    ctx.save();
    ctx.strokeStyle = "#CBD5E1"; // subtle enterprise gray
    ctx.lineWidth = 1;

    xScale.ticks.forEach((_, index) => {
      const x = xScale.getPixelForTick(index);

      const yStart = xScale.top;          // top of x-axis zone
      const yEnd = yStart + 10;           // pointer height upward into chart

      ctx.beginPath();
      ctx.moveTo(x, yStart);
      ctx.lineTo(x, yEnd);
      ctx.stroke();
    });

    ctx.restore();
  },
};

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  xAxisPointerPlugin
);

@Component({
  selector: "app-data-ingestion-trends",
  standalone: false,
  templateUrl: "./data-ingestion-trends.component.html",
  styleUrl: "./data-ingestion-trends.component.sass",
})
export class DataIngestionTrendsComponent implements AfterViewInit {
  @ViewChild("lineChart", { static: true })
  chartRef!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart;

  ngAfterViewInit(): void {
    this.initChart();
  }

  private initChart(): void {
    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels: [
          "JAN",
          "FEB",
          "MAR",
          "APR",
          "MAY",
          "JUN",
          "JUL",
          "AUG",
          "SEP",
          "OCT",
          "NOV",
          "DEC",
        ],
        datasets: [
          {
            label: "B2C_Kenya",
            data: [610, 680, 520, 450, 400, 580, 460, 520, 500, 610, 540],
            borderColor: "#2A5CAA",
            tension: 0.4,
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: "B2C_Uganda",
            data: [350, 410, 450, 490, 630, 460, 450, 380, 360, 540, 350],
            borderColor: "#F97316",
            tension: 0.4,
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: "Pesalink",
            data: [410, 390, 280, 420, 360, 400, 330, 450, 290, 410],
            borderColor: "#00A5E4",
            tension: 0.4,
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: "Intercompany",
            data: [409, 205, 165, 540, 370, 420, 350, 470, 240, 470],
            borderColor: "#000080",
            tension: 0.4,
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            bottom: 15, // space for legend
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            align: "start",
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              padding: 20,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 10 },
              padding: 8,
            },
            offset: true,
          },
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 10 },
            },
          },
        },
      },
    };

    this.chart = new Chart(this.chartRef.nativeElement, config);
  }
}
