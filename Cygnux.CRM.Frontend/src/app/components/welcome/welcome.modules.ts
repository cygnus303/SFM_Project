import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '../layouts/layout.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { WelcomeComponent } from './welcome.component';
import { WelcomeRoutes } from './welcome.routes';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';


@NgModule({
  declarations: [WelcomeComponent],
  imports: [
    CommonModule,
    LayoutModule,
    BsDatepickerModule.forRoot(),
    RouterModule.forChild(WelcomeRoutes),
     NgApexchartsModule,
    CanvasJSAngularChartsModule
  ]
})
export class WelcomeModule { }
