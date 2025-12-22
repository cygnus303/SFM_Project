import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { LeadService } from '../../../shared/services/lead.service';
import { CommonService } from '../../../shared/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { LeadBySourceResponse, LeadByStatusResponse, LeadCategoryResponse } from '../../../shared/models/lead.model';
import { IdentityService } from '../../../shared/services/identity.service';
import { GetFilter } from '../../../shared/models/customer.model';
import { MeetingService } from '../../../shared/services/meeting.service';
import { MeetingCountDayWise, UserResponse } from '../../../shared/models/meeting.model';
import { ComplaintService } from '../../../shared/services/complaint.service';
import { ComplaintCountDayWise } from '../../../shared/models/complaint.model';
import { ExternalService } from '../../../shared/services/external.service';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexResponsive, ApexXAxis, ApexLegend, ApexFill } from "ng-apexcharts";
import { Subscription } from 'rxjs';
import { ExportService } from '../../../shared/services/export.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | [];
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
};
interface PieChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    hoverOffset: number;
  }[];
}
interface IRange {
  value: Date[];
  label: string;
}
@Component({
  selector: 'app-user-chart',
  standalone: false,
  templateUrl: './user-chart.component.html',
  styleUrl: './user-chart.component.scss'
})
export class UserChartComponent {
  @Input() chartList: string = '';
  public chart: any;
  public charts: any;
  public RatingChart: any;
  public chartOptions:  any = null;
  public meetingCanvasOptions: any = null;
  public complaintColumnOption: any = null;

  public meetingChartSubscription!: Subscription;
  public getLeadStatusfilter:GetFilter[]=[];
  public leadStatus:LeadByStatusResponse[]=[];
  public leadSource !:LeadBySourceResponse;
  public leadCatagory:LeadCategoryResponse[]=[];
  public isCardLoading:boolean=false;
  // dateRange: [Date, Date] = [new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  // new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)];
  startDate!: string ;
  endDate!: string;
  userType=localStorage.getItem('UserType')
  pieChartData!:PieChartData;
  public users: UserResponse[] = [];
  public userIdData:string='';
  placeholderArray = Array(7);
  @Input() dateRange!: [Date, Date];
  @Input() selectedUser!: any;
  ranges: IRange[] = [
    {
      value: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
      label: 'Last 7 Days',
    },
    {
      value: [new Date(), new Date()],
      label: 'Today',
    },
    {
      value: [
        new Date(new Date().setDate(new Date().getDate() - 1)),
        new Date(new Date().setDate(new Date().getDate() - 1)),
      ],
      label: 'Yesterday',
    },
    {
      value: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
      label: 'Last 30 Days',
    },
    {
      value: [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date(),
      ],
      label: 'This Month',
    },
    {
      value: [
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      ],
      label: 'Last Month',
    },
  ];
  constructor(
    public leadService:LeadService,
    public commonService:CommonService,
    private toasterService:ToastrService,
    private identityService:IdentityService,
    private meetingService:MeetingService,
    private complaintService:ComplaintService,
    public externalService:ExternalService,
    public identifyService :IdentityService,
    private exportService:ExportService,
    private cdr: ChangeDetectorRef
  ){
    this.setDefaultDates();
    this.userIdData = this.selectedUser;
    // this.getUsers();
    this.meetingChartSubscription = this.commonService.userChart.subscribe((res)=>{
      if(this.chartList==='meeting'){
        // this.getMeetingCountDayWise();
      }else if(this.chartList === 'complaint'){
        // this.getTicketByDayWise();
      }else if(this.chartList === 'leads'){
        // this.getLeadCatagoryChart();
        // this.getLeadSourceChart();
        // const selectedDates = [this.startDate, this.endDate]
        // this.getCustomerfilters(selectedDates,this.userIdData);
      }
    });
  }

  setDefaultDates() {
    const today = new Date();
    this.startDate = today.toUTCString();
    this.endDate = today.toUTCString();
  }

  ngOnInit(){
   this.onDateRangeSelected(this.dateRange,this.selectedUser)
  }

  onDateRangeSelected(selectedDates: any, userIdData: string) {
    if (selectedDates && selectedDates.length === 2) {
      this.startDate = selectedDates[0].toUTCString();
      this.endDate = selectedDates[1].toUTCString();
    }
    this.userIdData = userIdData;
    this.getCustomerfilters(selectedDates, this.userIdData);
    if (this.chartList === 'leads') {
      // this.getLeadCatagoryChart();
      this.getLeadSourceChart();
    }
    if (this.chartList === 'meeting') {
      // this.getUsers();
      this.getMeetingCountDayWise();
    }
    if (this.chartList === 'complaint') {
      this.getTicketByDayWise();
      this.getTicketBySource();
      this.getTicketStatusData();
    }
  }

  getMeetingCountDayWise() {
    var filters = {
      userid: this.selectedUser,
      startdate: this.startDate,
      enddate: this.endDate
    }
    this.meetingCanvasOptions = null;
    this.meetingService.getMeetingCountDayWise(filters).subscribe({
      next: (response) => {
        this.MeetingcolumnChart(response.data);
      }
    })
  }

  createcomplaintDaywiseChart(data: ComplaintCountDayWise[]) {
    const ctx = document.getElementById('MyChartComplaint') as HTMLCanvasElement;
    if (ctx) {
      const labels = data.map(item => item.complaintDay);
      const pendingCounts = data.map(item => item.pendingCount);
      const completedCounts = data.map(item => item.completedCount);
      if (this.charts) {
        this.charts.destroy();
      }

      this.charts = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: "Pending Meetings",
              data: pendingCounts,
              backgroundColor: '#ffb012'
            },
            {
              label: "Completed Meetings",
              data: completedCounts,
              backgroundColor: '#13b545'
            }
          ]
        },
        options: {
          aspectRatio: 2.5
        }
      });
    }
  }

createDoughnutChart(status: any) {
  const canvas = document.getElementById('MyRatingChart') as HTMLCanvasElement;
  if (!canvas) return;

  // 🔥 HARD DESTROY (important)
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const { poor, good } = status;

  const data = {
    labels: ['Poor', 'Good'],
    datasets: [
      {
        label: 'Rating',
        data: [poor, good],
        backgroundColor: ['#f380af', '#41709d'],
        hoverOffset: 4
      }
    ]
  };

  this.RatingChart = new Chart(canvas, {
    type: 'doughnut',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
}


  initPieChart(leadSource: any) {
  if (this.chart) {
    this.chart.destroy();
    this.chart = null;
  }

  const pieChartElement = document.getElementById('MyPieChart') as HTMLCanvasElement;
  if (!pieChartElement) return;

  let labels: string[] = [];
  let data: number[] = [];
  let bgColors: string[] = [];

  if (this.chartList === 'leads') {
    const { phoneLeads, emailLeads, whatsappLeads, webBotLeads } = leadSource;
    labels = ['Phone Leads', 'Email Leads', 'WhatsApp Leads', 'WebBot Leads'];
    data = [phoneLeads, emailLeads, whatsappLeads, webBotLeads];
    bgColors = ['#f06548', '#455d74', '#ffcc00', '#34c38f'];
  } else if (this.chartList === 'meeting') {
    const { completed, pending } = leadSource;
    labels = ['Completed', 'Pending'];
    data = [completed, pending];
    bgColors = ['#8064a1', '#9bbb58'];
  } else if (this.chartList === 'complaint') {
    const { phoneComplaint, emailComplaint, whatsappComplaint, webBotComplaint } = leadSource;
    labels = ['Phone', 'Email', 'WhatsApp', 'Web/Bot'];
    data = [phoneComplaint, emailComplaint, whatsappComplaint, webBotComplaint];
    bgColors = ['#f06548', '#455d74', '#ffcc00', '#34c38f'];
  }

  this.pieChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Chart',
        data: data,
        backgroundColor: bgColors,
        hoverOffset: 4
      }
    ]
  };
  this.chart = new Chart(pieChartElement, {
    type: 'doughnut',
    data: this.pieChartData,
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } }
    }
  });
}


  getCustomerfilters(event: any, userid: string) {
    if (event?.length && userid) {
      var filters = {
        userid: userid,
        startdate: this.startDate,
        enddate: this.endDate
      }
      if (this.chartList === 'leads') {
        this.chartOptions = null; 
        this.getLeadStatusfilter=[];
        this.isCardLoading=true
        this.leadService.getLeadCatagoryData(filters).subscribe({
          next: (response) => {
            this.funnelChart(response.data);
            this.getLeadStatusfilter = response.data
              .map((item: any) => ({
                name: item.categoryName,
                count: item.leadCount,
                color: this.getColorForCategory(item.categoryName),
                id: this.getIdForCategory(item.categoryName)
              }))
              .sort((a, b) => b.count - a.count);
              this.isCardLoading=false; 
          }
        });
      } else if (this.chartList === 'meeting') {
        this.getLeadStatusfilter=[];
        this.isCardLoading=true;
        this.meetingService.getMeetingStatusData(filters).subscribe({
          next: (response) => {
            this.initPieChart(response.data);
            this.getLeadStatusfilter = [
              { name: "Total Meetings", count: response.data.totalMeetingCount || 0, color: 'green' },
              { name: "Pending", count: response.data.pending || 0, color: 'wheat' },
              { name: "Completed", count: response.data.completed || 0, color: 'pink' }
            ];
          this.isCardLoading=false;

          }
        });
      }
      else if (this.chartList === 'complaint') {
        this.getComplaintCount(userid)
      }
    }
  }
  getColorForCategory(category: string): string {
    const colorMapping: { [key: string]: string } = {
      "TOTAL": "green",
      "LEAD": "wheat",
      "PROSPECT": "pink",
      "SUSPECT": "lightgreen",
      "NEGOTIATION STAGE": "blue",
      "CLOSED": "bluecolor",
      "REQUEST RECEIVED": "tan",
      "CONFIRMATION AWAITED": "Lilac",
      "COMMERCIAL STAGE": "purple",
      "HOLD": "purple"
    };
    return colorMapping[category.toUpperCase()] || "gray";
  }

  getIdForCategory(category: string): number {
    const idMapping: { [key: string]: number } = {
      "TOTAL": 0,
      "LEAD": 1,
      "PROSPECT": 2,
      "SUSPECT": 3,
      "NEGOTIATION STAGE": 5,
      "CLOSED": 7,
      "REQUEST RECEIVED": 4,
      "CONFIRMATION AWAITED": 6,
      "COMMERCIAL STAGE": 9,
      "HOLD": 8
    };
    return idMapping[category.toUpperCase()] || 99;
  }
  exportLeadCategory(data: any) {
    if (this.chartList === 'leads') {
      this.commonService.updateLoader(true);
      const filters = {
        id: data.id,
        startdate: this.startDate,
        enddate: this.endDate
      }
      this.leadService.exportLeadCategory(filters).subscribe({
        next: (response) => {
          if (response) {
            this.exportService.exportToExcel(response.data);
          }
          this.commonService.updateLoader(false);
        },
        error: (response: any) => {
          this.toasterService.error(response);
          this.commonService.updateLoader(false);
        },
      });
    }
    if (this.chartList === 'complaint') {
      this.startDate=this.dateRange?.[0] ? this.dateRange[0].toLocaleDateString("en-GB") : '';
    this.endDate=this.dateRange?.[1]  ? this.dateRange[1].toLocaleDateString("en-GB") : ''

       let status = '';
    if (data?.name.includes('Total')) status = '';          // blank for total
    else if (data?.name.includes('Open')) status = 'New';
    else if (data?.name.includes('Closed')) status = 'Closed';
    else if (data?.name.includes('Updated')) status = 'Updated';
    else if (data?.name.includes('Escalated')) status = 'Escalated';

    const filters: any = {
      compaintStatus: status
    };
    this.isCardLoading=true;
    this.complaintService.getComplaintListexport(this.selectedUser,this.startDate,this.endDate,filters).subscribe({
      next: (response) => {
        if (response) {
          this.exportService.exportToExcel(response.data);
        }
        this.isCardLoading=false;
      },
      error: (response: any) => {
        this.toasterService.error(response);
           this.isCardLoading=false;
      },
    });
  }
}

  getLeadSourceChart() {
    const filters: any = {
      userid: this.selectedUser,
      startdate: this.startDate,
      enddate: this.endDate
    }
    this.leadService.getLeadSourceData(filters).subscribe({
      next: (response) => {
        if (response) {
          this.leadSource = response.data;
          this.initPieChart(response.data);
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.commonService.updateLoader(false);
      },
    });
  }

  getLeadCatagoryChart() {
    const filters: any = {
      userid: this.selectedUser,
      startdate: this.startDate,
      enddate: this.endDate
    }
    this.leadService.getLeadCatagoryData(filters).subscribe({
      next: (response) => {
        if (response) {
          this.leadCatagory = response.data;
          this.funnelChart(this.leadCatagory);
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.commonService.updateLoader(false);
      },
    });
  }
  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.getLeadCatagoryChart();
  //   }, 0);
  // }


  funnelChart(data: any[]) {
    const points = data
      .filter(item => item.categoryName !== 'Total')
      .map(item => ({
        label: item.categoryName,
        y: Number(item.leadCount)
      }))
      .sort((a, b) => b.y - a.y);
    const chartWidth = window.innerWidth * 0.5;
    // Toggle via *ngIf works reliably
    this.chartOptions = {
      animationEnabled: true,
      theme: 'light2',
      width: chartWidth,
      data: [
        {
          type: 'funnel',
          indexLabel: '{label} - {y}',
          toolTipContent: '<b>{label}</b>: {y}',
          valueRepresents: 'area',
          neckWidth: '44%',
          neckHeight: '30%',
          dataPoints: points
        }
      ]
    };
    this.cdr.detectChanges();
    this.removeCanvasJSLink();
  }

  removeCanvasJSLink() {
    setTimeout(() => {
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        if (link.href.includes("canvasjs.com")) {
          link.remove();
        }
      });
    }, 1000);
  }

  getComplaintCount(userid: string) {
    const filters: any = {
      userID: userid,
      startDate: new Date(this.startDate).toUTCString(),
      endDate: new Date(this.endDate).toUTCString()
    };
    this.getLeadStatusfilter=[];
    this.isCardLoading=true;
    this.complaintService.getCompalintCounteData(filters).subscribe({
      next: (response) => {
        if (response) {
          this.leadCatagory = response.data;
          this.getLeadStatusfilter = [
            { name: "Total <br> Complaints", count: response.data[0].totalComCount || 0, color: 'green' },
            { name: "Open <br> Complaints", count: response.data[0].new || 0, color: 'wheat' },
            { name: "Closed <br> Complaints", count: response.data[0].closed || 0, color: 'pink' },
            { name: "Updated <br> Complaints", count: response.data[0].updated || 0, color: 'lightgreen' },
            { name: "Escalated <br> Complaints", count: response.data[0].escalated || 0, color: 'blue' }
          ];
          this.isCardLoading=false;
        }
      },
      error: (response: any) => {
        this.toasterService.error(response);
          this.isCardLoading=false;
      },
    });
  }

  getTicketBySource() {
    const filters: any = {
      userid: this.userIdData,
      startdate: this.startDate,
      enddate: this.endDate
    }
    this.complaintService.getTicketSourceData(filters).subscribe({
      next: (response) => {
        if (response) {
          this.leadSource = response.data;
          this.initPieChart(response.data);
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.commonService.updateLoader(false);
      },
    });
  }
  getTicketStatusData() {
    const filters: any = {
      userid: this.userIdData,
      startdate: this.startDate,
      enddate: this.endDate
    }
    this.complaintService.getTicketStatusData(filters).subscribe({
      next: (response) => {
        if (response) {
          this.leadSource = response.data;
          this.createDoughnutChart(response.data);
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.commonService.updateLoader(false);
      },
    });
  }

  getTicketByDayWise() {
    const filters: any = {
      userid: this.userIdData,
      startdate: new Date(this.startDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).replace(',', ''),
      enddate: new Date(this.endDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).replace(',', '')
    }
    this.complaintColumnOption = null;
    this.complaintService.getTicketDaywiseData(filters).subscribe({
      next: (response) => {
        if (response) {
          this.complainTicketDayWise(response.data);
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.commonService.updateLoader(false);
      },
    });
  }

  getUsers() {
    this.commonService.updateLoader(true);
    this.externalService.getUserMaster().subscribe({
      next: (response) => {
        if (response) {
          this.users = response.data;
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.commonService.updateLoader(false);
      },
    });
  }

 MeetingcolumnChart(data: MeetingCountDayWise[]) {
  const chartWidth = window.innerWidth * 0.5;
  this.meetingCanvasOptions = {
    animationEnabled: true,
    theme: "light2",
     width: chartWidth,
    axisX: {
      title: "Day",
      interval: 1
    },
    axisY: {
      title: "Count",
      includeZero: true
    },
    toolTip: {
      shared: true
    },
    legend: {
      verticalAlign: "center",
      horizontalAlign: "right",
    },
    data: [
      {
        type: "stackedColumn",
        name: "Pending",
        showInLegend: true,
        color: "#4f81bc",
        dataPoints: data.map(item => ({
          label: item.meetingDay,
          y: item.pendingCount
        }))
      },
      {
        type: "stackedColumn",
        name: "Completed",
        showInLegend: true,
        color: "#c0504e",
        dataPoints: data.map(item => ({
          label: item.meetingDay,
          y: item.completedCount
        }))
      }
    ]
  };

  this.cdr.detectChanges();
  this.removeCanvasJSLink();
}


complainTicketDayWise(data: ComplaintCountDayWise[]) {
const chartWidth = window.innerWidth * 0.8;
  this.complaintColumnOption = {
    animationEnabled: true,
    theme: "light2",
    width: chartWidth,
    axisX: {
      title: "Day",
      interval: 1
    },

    axisY: {
      title: "Complaint Count",
      includeZero: true
    },

    toolTip: {
      shared: true
    },

    legend: {
      cursor: "pointer",
      verticalAlign: "top",
      horizontalAlign: "center"
    },

    data: [
      {
        type: "column",
        name: "Pending Complaints",
        showInLegend: true,
        dataPoints: data.map((item, index) => ({
          x: index,
          label: item.complaintDay,
          y: item.pendingCount
        }))
      },
      {
        type: "column",
        name: "Completed Complaints",
        showInLegend: true,
        dataPoints: data.map((item, index) => ({
          x: index,
          label: item.complaintDay,
          y: item.completedCount
        }))
      }
    ]
  };

  this.cdr.detectChanges();
  this.removeCanvasJSLink();
}


  ngOnDestroy(): void {
    if (this.meetingChartSubscription) { this.meetingChartSubscription.unsubscribe() }
  }

}

