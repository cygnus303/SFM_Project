import { Component } from '@angular/core';
import { MeetingService } from '../../shared/services/meeting.service';
import { CommonService } from '../../shared/services/common.service';
import { MeetingMoMListResponse, MeetingMoMResponse } from '../../shared/models/meeting.model';
import { IdentityService } from '../../shared/services/identity.service';
import { ToastrService } from 'ngx-toastr';
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

@Component({
  selector: 'app-meeting-mom',
  standalone: false,
  templateUrl: './meeting-mom.component.html',
  styleUrl: './meeting-mom.component.scss'
})
export class MeetingMOMComponent {
  public meetingMom: MeetingMoMResponse[] = [];
  public MOMList: MeetingMoMListResponse[] = [];
  public filters: { [key: string]: string } = {}; 
  public loading: boolean = false;
  page = 1;
  pageSize = 10;
  totalItems = 0;
  timeoutRef: any;

  public selectedMeetingId: string | null = null;

  constructor(
    private meetingService: MeetingService,
    public commonService: CommonService,
    private identityService:IdentityService,
    private toasterService: ToastrService,
  ) {
    defineElement(lottie.loadAnimation);
      this.commonService.loading.subscribe((state: boolean) => {
      this.loading = state;
    });
  }


   ngOnInit(): void {
    this.getMeetingMom();
    this.getMeetingMOMList()
  }

  onfilterList() {
    clearTimeout(this.timeoutRef);
    this.timeoutRef = setTimeout(() => {
      this.getMeetingMOMList();
    }, 500);
  }

    getMeetingMom() {
    this.commonService.updateLoader(true);
    this.meetingService.getMeetingMomDetails().subscribe({
      next: (response) => {
        if (response) {
          this.meetingMom = response.data;
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.commonService.updateLoader(false);
      },
    });
  }

  onMeetingClick(meetingId: string) {
this.selectedMeetingId = meetingId;
}

  clearDate() {
    this.filters['MeetingDate'] = '';
    this.getMeetingMOMList();
  }


isRowActive(item: any): boolean {
return this.selectedMeetingId === item.meetingId;
}

getMeetingMOMList(page: number = 1){
  this.filters = Object.fromEntries(
      Object.entries(this.filters).filter(([key, value]) => value !== null)
    );
  const filters: any = {
    ...this.filters,
      Page: page,
      PageSize: this.pageSize,
      MeetingDate:this.filters['MeetingDate'] ? this.commonService.formatDate(new Date(this.filters['MeetingDate'])) : ''
    };
  this.meetingService.getMOMList(this.identityService.getLoggedUserId(),filters).subscribe({
      next: (response) => {
        if (response) {
          // this.MOMList = response.data;
          this.MOMList = response.data.map((item: any) => ({
          ...item,
          meetingMOM: item.meetingMOM === '' ? null : item.meetingMOM
          }));
           this.totalItems = response.totalCount;
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.commonService.updateLoader(false);
      },
    });
}

  onPageChange(page: number) {
    this.page = page;
    this.getMeetingMOMList(this.page);
  }

  onSubmit(item:any){
    if(item.meetingMOM && item.remarks){
      const payload={
      meetingId: item.meetingId,
      meetingMOM:item.meetingMOM,
      remarks: item.remarks
    }
     this.meetingService.onSubmitMOM(this.identityService.getLoggedUserId(),payload).subscribe({
      next: (response) => {
        if (response.data.status === 1) {
          this.toasterService.success(response.data.message);
          this.getMeetingMOMList();
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.commonService.updateLoader(false);
      },
    });
  }
  }
}
