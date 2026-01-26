import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingMOMComponent } from './meeting-mom.component';
import { RouterModule } from '@angular/router';
import { MeetingMOMRoutes } from './meeting-mom.routes';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [MeetingMOMComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    RouterModule.forChild(MeetingMOMRoutes),
  ]
})
export class MeetingMomModule { }
