import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-page-breadcrumb',
    imports: [
        RouterModule,
    ],
    templateUrl: './page-breadcrumb.component.html',
    standalone: true,
    styles: ``
})
export class PageBreadcrumbComponent {
  @Input() pageTitle = '';
}
