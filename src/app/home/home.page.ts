import "@codetrix-studio/capacitor-google-auth";
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FacebookLoginPlugin, AccessToken, FacebookLogin as FbLog } from '@capacitor-community/facebook-login';
import { Plugins, registerWebPlugin } from "@capacitor/core"
import { isPlatform } from '@ionic/angular';
import { HttpClient } from "@angular/common/http";
const { Geolocation } = Plugins;

declare var google;


registerWebPlugin(FbLog);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  fbLogin: any;
  token: AccessToken;
  user;
  googleInfo = null;
  browser = false;
  location: any;
  myLat: number;
  myLng: number;


  constructor(private http: HttpClient) {
    this.setupFbLogin();
  }

  ionViewWillEnter() {
    this.getLocation();
  }

  getLocation() {
    Geolocation.getCurrentPosition().then(
      (position) => {
        if (position) {
          console.log(position);
          if (position) {
            this.myLat = position.coords.latitude;
            this.myLng = position.coords.longitude;
            if (!this.map) {
              this.showMap(new google.maps.LatLng(this.myLat, this.myLng));
            }
          }
        }
      }
    );
  }

  showMap(location) {
    const mapOptions = {
      center: location,
      zoom: 15,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  async googleSignup() {
    const googleUser = await Plugins.GoogleAuth.signIn();
    console.log(googleUser);
    this.googleInfo = googleUser;
  }

  async setupFbLogin() {
    if (isPlatform('desktop')) {
      // this.fbLogin = FacebookLogin;
      this.browser = true;

    } else {
      const { FacebookLogin } = Plugins;
      this.fbLogin = FacebookLogin;
    }
  }

  async login() {
    const FACEBOOK_PERMISSIONS = ['email', 'user_birthday', 'user_photos', 'user_gender'];
    const { FacebookLogin } = Plugins;
    const result = await FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS });

    if (result.accessToken && result.accessToken.userId) {
      this.token = result.accessToken;
      this.loadUserData();
    } else if (result.accessToken) {
      this.getCurrentToken()
    }
  }

  async getCurrentToken() {
    const result = await this.fbLogin.getCurrentAccessToken();

    if (result.accessToken) {
      this.token = result.accessToken
      this.loadUserData();
    }
  }

  async loadUserData() {
    const url = `https://graph.facebook.com/${this.token.userId}?fields=id,first_name,last_name,name,birthday,email&access_token=${this.token.token}`;
    this.http.get(url).subscribe(
      res => {
        this.user = res;
        console.log(this.user);

      }
    )
  }
}
