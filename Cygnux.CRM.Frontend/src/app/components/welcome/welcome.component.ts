import { Component } from '@angular/core';

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  // set chart to "any" to avoid the ChartType/undefined assignment error
  chart: any;
  stroke: any;
  markers: any;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  grid: ApexGrid;
  colors?: any;
};
@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  public lineChart: LineChartOptions;
  public donut: any;

  constructor() {
    // generate last-30-days labels (MM/DD)
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
    this.lineChart = {
      series: [
        {
          name: 'Customer',
          data: values
        }
      ],
      chart: {
        // explicitly set the type literal
        type: 'line' as const,
        height: 320,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 4,
        hover: { size: 6 }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: labels,
        labels: { rotate: -45, trim: true },
        tickAmount: 7
      },
      tooltip: {
        x: { show: true }
      },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 0.4, opacityFrom: 0.6, opacityTo: 0.05, stops: [0, 90, 100] }
      },
      grid: {
        borderColor: 'rgba(0,0,0,0.06)',
        strokeDashArray: 4
      },
      colors: ['#0f766e']
    };

     this.donut = {
    series: [64, 18, 14, 4],                // numeric values
    chart: {
      type: 'donut' as const,               // explicit literal to avoid typing issues
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
