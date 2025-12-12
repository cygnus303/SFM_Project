import { Component } from '@angular/core';
import { ApexAxisChartSeries, ApexChart,ApexDataLabels,ApexPlotOptions,ApexResponsive, ApexXAxis,ApexLegend,ApexFill} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;    
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
};
@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  public chartOptions!: ChartOptions; // definite assignment
  public donut: any;

  constructor() {
    const labels = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    // sample values
    const values = labels.map((_, i) =>
      Math.round(800 + Math.sin(i / 4) * 80 + Math.random() * 120)
    );

    // NOTE: chart is typed as any to avoid the 'type' incompatibility
    this.chartOptions = {
      series: [
        { name: "PRODUCT A", data: [44, 55, 41, 67, 22, 43] },
        { name: "PRODUCT B", data: [13, 23, 20, 8, 13, 27] },
        { name: "PRODUCT C", data: [11, 17, 15, 15, 21, 14] },
        { name: "PRODUCT D", data: [21, 7, 25, 13, 22, 8] }
      ],
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: { show: true },
        zoom: { enabled: true }
      },
      dataLabels: {
        enabled: false
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: { position: "bottom", offsetX: -10, offsetY: 0 }
          }
        }
      ],
      plotOptions: { bar: { horizontal: false } },
      xaxis: {
        type: "category",
        categories: ["01/2011", "02/2011", "03/2011", "04/2011", "05/2011", "06/2011"]
      },
      legend: { position: "right", offsetY: 40 },
      fill: { opacity: 1 }
    } as ChartOptions;


    this.donut = {
      series: [64, 18, 14, 4],               
      chart: {
        type: 'donut' as const,
        height: 260,
        toolbar: { show: false }
      },
      labels: ['Road', 'Rail', 'Air', 'Sea'],
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                offsetY: -6
              },
              value: {
                show: true,
                fontSize: '16px',
                offsetY: 6,
                formatter: (val: number) => `${val}%`
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total',
                formatter: () => '100%'
              }
            }
          }
        }
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '13px'
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val}%`
        }
      },
      colors: ['#0d9488', '#2563eb', '#f97316', '#6b7280'] // optional palette
    };
  }
  ngOnInit(): void {}
}
