import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../shared/services/common.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false,
  styleUrls: [],
})
export class SidebarComponent implements OnInit {
  isSFMMasters: any
  constructor(public commonService: CommonService) {
  }
  ngOnInit(): void {
    this.isSFMMasters = JSON.parse(localStorage.getItem('ISSFMMASTER') || '{}');
  }
}