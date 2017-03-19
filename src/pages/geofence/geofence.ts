import { Component } from '@angular/core';
import { 
  NavController,
  ViewController,
  AlertController,
  NavParams
} from 'ionic-angular';

import {BGService} from '../../lib/BGService';

/*
  Generated class for the Geofence page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-geofence',
  templateUrl: 'geofence.html'
})
export class GeofencePage {
  public identifier: string;
  public radius: number;
  private latitude: number;
  private longitude: number;
  public notifyOnEntry: boolean;
  public notifyOnExit: boolean;
  public notifyOnDwell: boolean;
  public loiteringDelay: number;
  public radiusOptions: any;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private bgService: BGService) {

    this.identifier = '';
    this.radius = 200;
    this.latitude = navParams.get('latitude');
    this.longitude = navParams.get('longitude');

    this.notifyOnEntry = true;
    this.notifyOnExit = false;
    this.notifyOnDwell = false;

    this.radiusOptions = [100, 150, 200, 500, 1000, 5000, 10000];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GeofencePage');
  }

  onClickCancel() {
    this.viewCtrl.dismiss();
  }

  onClickSubmit() {
    let bgGeo = this.bgService.getPlugin();

    bgGeo.addGeofence({
      identifier: this.identifier,
      radius: this.radius,
      latitude: this.latitude,
      longitude: this.longitude,
      notifyOnEntry: this.notifyOnEntry,
      notifyOnExit: this.notifyOnExit,
      notifyOnDwell: this.notifyOnDwell,
      loiteringDelay: this.loiteringDelay
    }, (identifier) => {
      this.bgService.playSound('ADD_GEOFENCE');
      this.viewCtrl.dismiss();
    }, (error) => {
      this.alert('Error', error);
    })
  }

  alert(title, message) {
    this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['Dismiss']
    }).present();
  }
}
