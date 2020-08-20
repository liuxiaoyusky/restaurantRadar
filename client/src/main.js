// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import VueAxios from "vue-axios";
import * as firebase from "firebase/app";
import 'firebase/auth';
//this file contains the config info for firebase, google map, etc. Also defines the top component which is App vue.
//this is the file that combines the elements for front end as one.
//
require('./css/GoogleMap.css')

const config = {
//  add your own Google Firebase config here
}

firebase.initializeApp(config);

//https://stackoverflow.com/questions/44634193/integrating-google-maps-in-vue-js
export const loadedGoogleMapsAPI = new Promise( (resolve, reject) => {

  window['GoogleMapsInit'] = resolve;

  let GMap = document.createElement('script');

  GMap.setAttribute('src', `https://maps.googleapis.com/maps/api/js?key=YOURGOOGLEMAPAPIKEY`);

  let GMapCluster = document.createElement('script');
  GMapCluster.setAttribute('src', 'https://unpkg.com/@google/markerclustererplus@4.0.1/dist/markerclustererplus.min.js');

  document.body.appendChild(GMapCluster);
  document.body.appendChild(GMap);

});

Vue.use(VueAxios, axios);

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
