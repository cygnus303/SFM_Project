import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../../../shared/services/script-loader.service';
import { CommonService } from '../../../shared/services/common.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false,
  styleUrls: [],
})
export class SidebarComponent implements OnInit {
  isSFMMasters: any
  constructor( public commonService: CommonService) {
  }
  ngOnInit(): void {
    this.isSFMMasters = JSON.parse(localStorage.getItem('ISSFMMASTER') || '{}');
  }
}