import { Component } from '@angular/core';
import { 
  IonicPage, 
  NavController,
  NavParams, 
  Platform  
} from 'ionic-angular';

import { Dialogs } from '@ionic-native/dialogs';

const TRACKER_HOST = 'http://tracker.transistorsoft.com/';

// Default tracking server username if use doesn't provide one.
const DEFAULT_USERNAME = "cordova-anonymous";

// Only allow alpha-numeric usernames with '-' and '_'
const USERNAME_VALIDATOR =  /^[a-zA-Z0-9_-]*$/;

/**
 * The HomePage will prompt you for a username so the plugin can post locations to tracker.transistorsoft.com/locations/{username}
 *
 * You can view your tracking in our web app in your browser at http://tracking.transistorsoft.com/{username}
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  bgGeo: any;
  trackerUsername: string;
  url: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform, private dialogs: Dialogs) {    
    this.platform.ready().then(this.onDeviceReady.bind(this));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    let localStorage = (<any>window).localStorage;    
    localStorage.removeItem('page');    
  }

  onDeviceReady() {
    this.bgGeo = (<any>window).BackgroundGeolocation;
    this.bgGeo.removeListeners();
    this.bgGeo.stop();

    // Prompt for Tracking Server Username
    this.getUsername().then(this.doGetUsername.bind(this)).catch(() => {
      console.warn('Failed to get username.  We *really* do need a username.');
      // We really need a username.  Use DEFAULT_USERNAME
      this.onClickEditUsername();
    });
  }

  onNavigation(value) {    
    let localStorage = (<any>window).localStorage;
    localStorage.setItem('page', value);
    this.navCtrl.setRoot(value);
  }

  onClickEditUsername() {
    let localStorage = (<any>window).localStorage;
    let username = localStorage.getItem('username');
    localStorage.removeItem('username');
    this.getUsername(username).then(this.doGetUsername.bind(this)).catch(() => {      
      localStorage.setItem('username', username);
      this.onClickEditUsername();
    });
  }

  /**
  * Prompt user for a unique identifier for posting to tracker.transistorsoft.com/{username}
  * @return {Promise}
  */
  private getUsername(defaultValue) {
    defaultValue = defaultValue || '';
    let localStorage = (<any>window).localStorage;
    let username = localStorage.getItem('username');

    return new Promise((resolve, reject) => {
      if (username) {
        // We've already got a username.  Good to go.
        resolve(username);
        return;
      }
      // Prompt user to enter a unique identifier for tracker.transistorsoft.com
      this.dialogs.prompt('Please enter a unique identifier (eg: Github username) so the plugin can post loctions to http://tracker.transistorsoft.com/{identifier}', 'Tracking Server Username', ['OK'], defaultValue).then((response) => {
        let username = response.input1.replace(/\s+/, '');
        if (!username.length) {
          this.dialogs.alert("You must enter a username.  It can be any unique alpha-numeric identifier.", "Username required").then(() => {
            reject();
          });
        } else if (!USERNAME_VALIDATOR.test(username)) {
          this.dialogs.alert("Username must be alpha-numeric\n('-' and '_' are allowed)", "Invalid username").then(() => {
            reject();
          });
        } else {
          resolve(username);
        }       
      });
    });
  }

  private doGetUsername(username) {
      console.log('username: ', username);
      let localStorage = (<any>window).localStorage;
      localStorage.setItem('username', username);
      this.trackerUsername = username;
      this.url = TRACKER_HOST + username;
      this.bgGeo.setConfig({url: TRACKER_HOST + 'locations/' + username});
  }
}
