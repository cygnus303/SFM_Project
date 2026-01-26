import { Component } from '@angular/core';
import { MeetingService } from '../../shared/services/meeting.service';
import { CommonService } from '../../shared/services/common.service';
import { MeetingMoMResponse } from '../../shared/models/meeting.model';

@Component({
  selector: 'app-meeting-mom',
  standalone: false,
  templateUrl: './meeting-mom.component.html',
  styleUrl: './meeting-mom.component.scss'
})
export class MeetingMOMComponent {
  public meetingMom: MeetingMoMResponse[] = [];
  constructor( private meetingService: MeetingService,public commonService: CommonService) {}
   ngOnInit(): void {
    this.getMeetingMom();
  }
  meetingList = [
    {
      meetingId: 'MT00011508',
      meetingDate: '21/01/2026',
      customerName: 'AARTI DRUGS LTD',
      checkIn: '12:45',
      checkOut: '13:35'
    },
    {
      meetingId: 'MT00011499',
      meetingDate: '21/01/2026',
      customerName: 'GALPHA LAB LTD',
      checkIn: '09:15',
      checkOut: '11:35'
    }
  ];

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

}
