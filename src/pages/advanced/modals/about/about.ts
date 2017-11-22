import { Component } from '@angular/core';
import {
  ViewController
} from 'ionic-angular';

import {BGService} from '../../lib/BGService';
/*
  Generated class for the About page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  constructor(private bgService: BGService, private viewCtrl: ViewController) {}

  ionViewDidLoad() {
    this.bgService.playSound("FLOURISH");

    console.log('ionViewDidLoad AboutPage');
  }

  onClickClose() {
    this.bgService.playSound("CLOSE");
    this.viewCtrl.dismiss();
  }
}
