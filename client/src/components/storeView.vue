<!--This is the store view. It shows the detail info of a specific store. -->
<template>
    <div id="storeView">
      <search-bar v-if="$parent.defaultLocation!=null"></search-bar>
      <div id="imageDiv">
        <div id="divInImageDiv">
          <img  :src="imageLink"  v-for="imageLink in images">
        </div>
      </div>
      <div id="titleDiv">
        <h2 id="storeTitleInStoreView">{{storeName}}</h2>
        <p id="categoriesDiv">{{categories}}</p><br/>
        <p id="priceLevel"><b>{{priceLevel}}</b></p>
        <p id="rateScore">rating:{{rating}} ({{totalReviews}} reviews)</p>

      </div>
      <div id="bizReviews">
        <button id="reviewBtn" v-if="!this.showCreateReviewBlock" @click="changeCreateReviewBlock"><a>Write a Review</a></button>
        <div id="bizCreateReviewBlock" v-if="this.showCreateReviewBlock">
          <form @submit.prevent="submitCreateReview">
            <hr/>
            <textarea id="bizCreateReview" v-model="bizCreateReview" placeholder="Create review here:">{{bizCreateReview}}</textarea>
            <label for="bizCreateReviewRating">Rating: </label><select id="bizCreateReviewRating" v-model.number="reviewRating"><option v-for="rat in this.ratingRange">{{rat}}</option></select>
            <button id="submitCreateReview"><a>Create Review</a></button>
            <button id="cancelCreateBtn" @click="changeCreateReviewBlock"><a>Cancel</a></button>
          </form>
        </div>
        <hr/>
        <h3>Location & Hours</h3>
        <div id="locationInfo">
          <div id="mapBlock">
            <div id="businessLocationMapTravelOptions">
              <button @click="requestTravel()" v-if="!requestRoute"><a>Get there!</a></button>
              <button @click="requestTravel()" v-if="requestRoute"><a>Hide Route!</a></button>
              <button v-if="requestRoute" @click="requestSwitchRoute('WALKING')"><a>Walk</a></button>
              <button v-if="requestRoute" @click="requestSwitchRoute('BICYCLING')"><a>Bicycle</a></button>
              <button v-if="requestRoute" @click="requestSwitchRoute('TRANSIT')"><a>Transit</a></button>
              <button v-if="requestRoute" @click="requestSwitchRoute('DRIVING')"><a>Drive</a></button>
            </div>
            <div id="businessLocationMap"></div>
            <p id="locationAddress"><b>{{location}}</b></p>
            <div id="businessLocationMapTravelInfo" v-if="requestRoute"></div>
          </div>
          <div id="locationInfoTimeBlock" >
            <p v-for="(time,index) in openHours"><b>{{weekdays[index]}}</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp{{time}}</p>
          </div>
        </div>
        <hr/>
        <ul>
          <li v-for="reviewData in searchResult" :id="reviewData.reviewId">
            <button v-if="reviewData.editable" class = "editReview" @click="startEdit(reviewData.reviewId)"><a>edit</a></button>
            <button v-if="reviewData.editable" class = "deleteReview" @click="submitDeleteReview(reviewData.reviewId)"><a>delete</a></button>
            <p>reviewer: <b>{{reviewData.userName}}</b></p>
            <p class="reviewRating"><b> rating: {{reviewData.rating}}</b></p>
            <p class="reviewTimeStamp">{{reviewData.timeStamp}}</p>
            <p class="reviewContent">{{reviewData.content}}</p>
            <input type="text" v-if="reviewData.editable && reviewData.reviewId == currentEdit" v-model:value="editText"/>
            <button v-if="reviewData.editable" @click="submitEditReview(reviewData.reviewId)"><a>submit</a></button>
            <hr/>
          </li>
        </ul>
      </div>
    </div>
</template>

<script>
  import {loadedGoogleMapsAPI} from '@/main'
  import {getLoc, initSingleMap} from '../tmp/GoogleMap'
  import SearchBar from "./searchBar";
  import firebase from "firebase";

  export default {
    name: "storeView",
    components: {SearchBar},
    data() {
      return {
        login:false,
        msg: 'Welcome to store view',
        storeId: this.$route.params.store_id,
        bizCreateReview: null,
        storeName:null,
        ratingRange: [1, 2, 3, 4, 5],
        rating: null,
        searchResult:[],
        currentEdit:null,
        editText:null,
        images:[],
        showCreateReviewBlock:false,
        location:null,
        openHours:[],
        weekdays:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        requestRoute: false,
        bizInfoJson: null,
        priceLevel:null,
        totalReviews:null,
        categories:null,
        reviewRating: 5
      }
    },
    beforeMount() {
      let that = this;
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          that.$parent.login = true;
          that.$parent.username = user.displayName;
        }
      });

      this.loadView()
    },
    methods: {
      //this function is called whenever page first loaded or a change has been made, like edit, create, delete reviews.
      // It will parse url into local variables and use them to first fetch the relative info.
      loadView(){
        console.log("in loadView")
        this.login = this.$parent.login;
        this.axios.get(`http://localhost:8081/search/business/?id=${this.storeId}`)
          .then((res) => {
            console.log(res)
            this.bizInfoJson = res.data.bizInfo;
            loadedGoogleMapsAPI.then(() => { initSingleMap(res.data.bizInfo, null, false, null) });

            firebase.auth().onAuthStateChanged((user) =>{
              let reviews = res.data.bizReview;
              let tempUId = null;
              if(user){
                tempUId = "firebase-"+user.uid
              }
              for( let i = 0; i < reviews.length;i++){
                if(reviews[i].uid === tempUId){
                  reviews[i].editable = true;
                }else{
                  reviews[i].editable = false;
                }
              }
              this.searchResult = reviews;
              })
            this.images = res.data.bizInfo.photos;
            this.location = res.data.bizInfo.location.display_address[0] +
              " "+res.data.bizInfo.location.display_address[1];
            this.openHours = (res.data.bizInfo.hours)[0].open;
            this.storeName = res.data.bizInfo.name;
            this.rating = res.data.bizInfo.rating;
            this.priceLevel = res.data.bizInfo.price;
            this.categories = res.data.bizInfo.categories;
            this.totalReviews = res.data.bizInfo.review_count;
            this.categories = this.categories.map(x=>{
              return x.title;
            }).join(', ')

            this.openHours = this.openHours.map(x=>{
              let start = [x.start.slice(0,2) ,x.start.slice(2)].join(":")
              let end = [x.end.slice(0,2) ,x.end.slice(2)].join(":")
              return start + " - "+end;
            })
          })
          .catch((e) => { })
      },

      //This is called when a logged in user submit a review. If everything is going well, this function will call
      //loadView().
      submitCreateReview() {
        console.log("in submitCreateReview outside")
        if (this.$parent.login) {
          firebase.auth().currentUser
            .getIdToken()
            .then( idToken => {
              console.log("in submitCreateReview inside")
              this.axios.post('http://localhost:8081/user/createReview',
                {
                  review: this.bizCreateReview,
                  rating: this.reviewRating,
                  time_created:  new Date().toLocaleString(),
                  storeId: this.storeId
                },
                { headers: {Authorization: `Bearer ${idToken}`} }
              )
                .then(res => {
                  this.loadView()
                  this.showCreateReviewBlock = !this.showCreateReviewBlock;
                })
                .catch(e => { console.error(e) })
            })
            .catch(e => { console.error(e) })
        }
      },

      //This is called when a logged in user finish editting a review. If everything is going well,
      // this function will call loadView().
      submitEditReview(reviewId){
        console.log("outside edit review")

        if (this.$parent.login) {
          firebase.auth().currentUser
            .getIdToken()
            .then( idToken => {
              console.log("inside edit review")
              this.axios.post('http://localhost:8081/user/editReview',
                {
                  reviewId: reviewId,
                  review: this.editText,
                  time_created:  new Date().toLocaleString()
                },
                { headers: {Authorization: `Bearer ${idToken}`} }
              )
                .then(res => {
                  this.editText = null;
                  this.currentEdit = null;
                  this.loadView() })
                .catch(e => { console.error(e) })
            })
            .catch(e => { console.error(e) })
        }
      },
      //This is called when a logged in user delete a review. If everything is going well, this function will call
      // loadView().
      submitDeleteReview(reviewId){

        if (this.$parent.login) {
          firebase.auth().currentUser
            .getIdToken()
            .then( idToken => {
              console.log("in submitDelete")
              this.axios.post('http://localhost:8081/user/deleteReview',
                { reviewId: reviewId },
                { headers: {Authorization: `Bearer ${idToken}`} }
              )
                .then(res => { this.loadView() })
                .catch(e => { console.error(e) })
            })
            .catch(e => { console.error(e) })
        }
      },

      //this function will be called when user click edit button. The div for editting will be shown.
      startEdit(reviewId){
        this.currentEdit = reviewId;
        this.editText = null
      },
      //this function will be called when user click create review button. The div for create review will be shown.
      changeCreateReviewBlock(){
        if(this.$parent.login){
          this.showCreateReviewBlock = !this.showCreateReviewBlock;
        }else{
          alert("Please login before post a review.")
        }
      },

      //this function switches the map between showing location and showing route from your current loc to this store.
      requestTravel() {
        this.requestRoute = !this.requestRoute;
        const oldCoords = localStorage.getItem('coords');
        if (oldCoords) {
          loadedGoogleMapsAPI.then(() => { initSingleMap(this.bizInfoJson, oldCoords, this.requestRoute, 'DRIVING') })
        } else {
          navigator.geolocation.getCurrentPosition( (curLoc) => {
            let curIpLoc = JSON.stringify(curLoc.coords.latitude) + " " + JSON.stringify(curLoc.coords.longitude);
              localStorage.setItem('coords', curIpLoc);
              loadedGoogleMapsAPI.then(() => { initSingleMap(this.bizInfoJson, curIpLoc, this.requestRoute, 'DRIVING') })},
            (err) => console.log(err));
        }
      },

      //this function updates route result according to different button the user clicked.
      requestSwitchRoute(mode) {
        const oldCoords = localStorage.getItem('coords');
        loadedGoogleMapsAPI.then(() => { initSingleMap(this.bizInfoJson, oldCoords, this.requestRoute, mode) })
      }
    }
  }

</script>

<style scoped>
img{
  display: inline;
  height: 500px;
  width: 500px;
  margin-top: 10px;
}

  #imageDiv{

    height: 550px;
    margin-top:10px;
    overflow: auto;
  }


  #businessLocationMap{
    height: 300px;
    width: 100%;
    margin-left: 15%
  }

  #mapBlock{
    width: 50%;
    float:left;
    height: 100%;
  }

  #mapBlock p{
    margin: 5px;
    padding: 0;
  }

  #mapBlock label{
    color: grey;
  }

  #locationInfo{
    min-width: 800px;
    min-height: 400px;
    overflow: auto;
  }
  #locationInfoTimeBlock{
    float:left;
    width: 50%;
    height: 95%;
    font-size: xx-small;
    padding-top: 5%;
  }
#locationInfoTimeBlock p{
  clear: both;
  text-align: center;
  font-size: small;
}

  #titleDiv p{
    display: inline;
    margin: 0;
  }

#titleDiv h2{
  margin: 10px 20px 10px 10px;
}

  #storeView{
    margin-top: 5px;
  }

  #bizCreateReviewBlock{
    height: 230px;
    width: 100%;
    min-width: 400px;
  }

  #bizCreateReview{
    padding: 10px;
    padding-left: 5%;
    height: 150px;
    width: 90%;
    font-size: large;
    display: block;
    margin: 10px;
    border: 2px black solid;
  }

  #mapBlock button{
    background-color: lightsalmon;
    font-size: 15px;
    margin-bottom: 6px;
  }

  #businessLocationMapTravelInfo p{
    display: inline-block;
  }

  ul p{
    padding: 0;
    margin: 0;
    font-size: larger;
  }

 .reviewRating,.reviewTimeStamp{
   display: inline-block;
 }

  .reviewContent{
    color: #a72267;
    /*border: 1px wheat solid;*/
    border-radius: 4px;
  }

  #divInImageDiv{
    min-width: 1530px;
    height: 500px;
  }
</style>
