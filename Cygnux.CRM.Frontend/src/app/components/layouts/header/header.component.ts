
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { IdentityService } from '../../../shared/services/identity.service';
declare function G(): void;
import * as bootstrap from 'bootstrap';
import { ScriptLoaderService } from '../../../shared/services/script-loader.service';
import { CommonService } from '../../../shared/services/common.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [],
})
export class HeaderComponent implements OnInit {
  public email: string | null = null;
  public userId : string | null = null;
  public designation : string | null = null;
  public userName : string | null = null;
  public headerTitle: string = 'Dashboard';

  constructor(private identityService: IdentityService,private router: Router,private scriptLoader: ScriptLoaderService, public commonService: CommonService ,  private activatedRoute: ActivatedRoute) {
    this.email = identityService.getLoggedEmail();
    this.userId = identityService.getLoggedUserId();
    this.designation = identityService.getdesignationName() ?? '';
    this.userName = identityService.getUserName();
  }

 
  ngOnInit(): void {
  this.headerTitle = this.getTitleFromSnapshot(this.router.routerState.snapshot.root);

  // ✅ Route change
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.headerTitle = this.getTitleFromRoute(this.router.routerState.root);
    });
  }

private getTitleFromRoute(route: ActivatedRoute): string {
  let title = 'DASHBOARD';

  while (route.firstChild) {
    route = route.firstChild;
    if (route.snapshot.data?.['title']) {
      title = route.snapshot.data['title'];
    }
  }

  return title;
}

private getTitleFromSnapshot(route: ActivatedRouteSnapshot): string {
  let title = 'DASHBOARD';

  while (route.firstChild) {
    route = route.firstChild;
    if (route.data?.['title']) {
      title = route.data['title'];
    }
  }

  return title;
}

    ngAfterViewInit(): void {
    const dropdownEl = document.getElementById('page-header-user-dropdown');
    if (dropdownEl) {
      new bootstrap.Dropdown(dropdownEl);
    }
  }

  signout(event: any): void {
    event.preventDefault();
    this.identityService.clearToken();
    this.router.navigateByUrl('/login');
     localStorage.clear();
  }
   toggleSidebar() {
      this.scriptLoader.loadScript('assets/js/app.js').then(() => console.log('Script loaded')).catch(error => console.error(error));
  }
}
