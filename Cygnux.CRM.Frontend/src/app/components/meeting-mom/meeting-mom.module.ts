import { NgModule , CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingMOMComponent } from './meeting-mom.component';
import { RouterModule } from '@angular/router';
import { MeetingMOMRoutes } from './meeting-mom.routes';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [MeetingMOMComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    NgbPaginationModule,
    BsDatepickerModule.forRoot(),
    RouterModule.forChild(MeetingMOMRoutes),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MeetingMomModule { }
