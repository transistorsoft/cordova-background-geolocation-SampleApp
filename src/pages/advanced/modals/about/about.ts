import { Component } from '@angular/core';
import {
  IonicPage,
  NavParams,
  ViewController
} from 'ionic-angular';

/**
* About page.
*
*/

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  private bgService: any;

  constructor(private viewCtrl: ViewController, private navParams: NavParams) {
    this.bgService = this.navParams.get('bgService');
  }

  ionViewDidLoad() {
    this.bgService.playSound("FLOURISH");

    console.log('ionViewDidLoad AboutPage');
  }

  onClickClose() {
    this.bgService.playSound("CLOSE");
    this.viewCtrl.dismiss();
  }
}
