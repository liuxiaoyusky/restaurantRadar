<!--This the first and top component of front end. All other vue components are child of this.-->
<!--buttons for login/register/home/logout are defined here and will be shown in every child views.-->
<template>
  <div id="app">
    <ul>
      <button id ="home"><router-link to="/">Home</router-link></button>
      <button id = "registerSignUp" v-if="!login"><router-link to="/registerSignUp">registerSignUp</router-link></button>
      <button id = "logout" v-if="login" @click="logout">logout</button>
      <h2 id="welcomeMessage" v-if="username!=null">Login as: {{username}}</h2>

    </ul>
    <router-view></router-view>
  </div>
</template>

<script>

  import {loadedGoogleMapsAPI} from './main'
  import {getLoc, initSingleMap} from './tmp/GoogleMap'
  import firebase from "firebase";

export default {
  name: 'App',
  data() {
    return {
      msg: "hello",
      defaultLocation:null,
      localInfo: null,
      login:false,
      username:null
    }
  },
  beforeMount() {
    // https://www.freecodecamp.org/forum/t/navigator-geolocation-is-really-slow/74860/3
    // these codes will be
    let that = this
    const oldCoords = localStorage.getItem('coords');
    if (oldCoords) {
      loadedGoogleMapsAPI.then(() => {
        getLoc(oldCoords.split(' ')[0], oldCoords.split(' ')[1], (locInfoComputed) => {
          that.localInfo = locInfoComputed;
          that.defaultLocation = locInfoComputed.city+","+locInfoComputed.state+" "+locInfoComputed.zip
        })
      })
    } else {
      navigator.geolocation.getCurrentPosition( (res) => {
        localStorage.setItem('coords', JSON.stringify(res.coords.latitude) + " " + JSON.stringify(res.coords.longitude));
        loadedGoogleMapsAPI.then(() => {
          getLoc(res.coords.latitude, res.coords.longitude, (locInfoComputed) => {
            that.localInfo = locInfoComputed;
            that.defaultLocation = locInfoComputed.city + "," + locInfoComputed.state + " " + locInfoComputed.zip
          })
        })
      },(err) => console.log(err));
    }
  },
  methods: {
    //this is the logout method. Log out user from firsbase and also update local.
    logout() {
      firebase.auth().signOut()
      .then(res => {
        this.login = false;
        this.username = null;
      })
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

a:link, a:visited, a:focus{
  color: black;
  text-decoration:none;
}

a:active{
  color:red;
}

a:hover{
  color:gray;
}

  ul{
    padding: 0;
    margin: 0;
  }

button{
  background-color: darkorange;
  color: white;
  font-size: 20px;
  padding: 5px 9px;
  margin: 0px 0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

  #home{
    background-color: orangered;
    position: absolute;
    right: 15px;
    top: 15px;
  }

  #registerSignUp{
    background-color: orangered;
    position: absolute;
    right: 100px;
    top: 15px;
  }

  #logout{
    background-color: orangered;
    position: absolute;
    right: 100px;
    top: 15px;
  }

  body{
    background-color: #d3d3d3;
  }

  #welcomeMessage{
    position: absolute;
    right: 250px;
    top: 15px;
    padding: 0;
    margin: 0;

  }
</style>
