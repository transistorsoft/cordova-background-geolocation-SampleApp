import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdvancedPage } from './advanced';

import {BGService} from './lib/BGService';
import {SettingsService} from './lib/SettingsService';
import {TestService} from './lib/TestService';

@NgModule({
  declarations: [
    AdvancedPage
  ],
  imports: [
    IonicPageModule.forChild(AdvancedPage)
  ],
  providers: [
    BGService, SettingsService, TestService
  ]
})
export class AdvancedPageModule {}
