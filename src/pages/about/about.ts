import { Component } from '@angular/core';
import {
  NavController,
  ViewController,
  NavParams
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

  constructor(private navCtrl: NavController, private bgService: BGService, private viewCtrl: ViewController, private navParams: NavParams) {}

  ionViewDidLoad() {
    this.bgService.playSound("FLOURISH");

    console.log('ionViewDidLoad AboutPage');
  }

  onClickClose() {
    this.bgService.playSound("CLOSE");
    this.viewCtrl.dismiss();
  }
}
