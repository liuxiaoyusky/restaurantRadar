<!--This view is shown when user try to search anything. All users to filter result, search result and update result.-->
<template>
    <div id="searchView">
      <search-bar
        v-if="$parent.defaultLocation!=null"
        :term="this.queryTerms.term"
        :location="this.queryTerms.location"
      ></search-bar>
      <div id="container">
        <div id="top">
          <div id="moreFilters" v-if="!moreFiltersStatus">
            <div id="radiusFilter">
              <label for="radiusSelect">Distance(meters):</label>
              <select id="radiusSelect" v-model="queryTerms.radius" @change="updateStoreInfo">
                <option v-for="option in radiusOptions">{{option}}</option>
              </select>
            </div>
            <div id="attributesFilter">
        <a v-for="(attribute,index) in attributes" @click="updateAttributesProperty(index)"
              class="attributesFilterDetail">{{attribute.attr}}&nbsp&nbsp&nbsp&nbsp</a>
            </div>
            <div id="limitFilter">
              <label for="limitSelect">Search Result Number:</label>
              <select id="limitSelect" v-model="queryTerms.limit" @change="updateStoreInfo">
                <option v-for="option in limitOptions">{{option}}</option>
              </select>
            </div>
          </div>
          <div id="defaultFilters" v-if="moreFiltersStatus">
            <div id="priceFilter">
        <a v-for="(num,index) in dollarSigns" @click="updatePriceProperty(index)"
              class="priceFilterDetail">{{num.sign}} </a>
            </div>
            <div id="openNowFilter">
              <label for="openNowCheckBox">openNow </label>
              <input type="checkbox" id="openNowCheckBox" v-model="queryTerms.open_now" @change="updateStoreInfo">
            </div>
            <div id="sortByFilter">
              <label for="sortBySelect">Sort by:</label>
              <select id="sortBySelect" v-model="queryTerms.sort_by" @change="updateStoreInfo">
                <option v-for="option in sortByOptions">{{option}}</option>
              </select>
          </div>
          </div>
          <button id="moreFiltersBtn" @click="moreFiltersStatus=!moreFiltersStatus">
            <a>Switch filters</a>
          </button>
        </div>
        <div id="left">
          <div id="searchResult">
            <ul>
              <li v-for="result in searchResult"  id="result.id">
                <router-link v-bind:to="'/store/'+result.id">
                  <div class="searchBiz">
                    <div class="bizLeft">
                      <img :src=result.image_url>

                    </div>
                    <div class="bizRight">
                      <h2>{{result.name}}</h2>
                      <p class="bizPrice">{{result.price}}</p>
                      <p class="bizRating">Rating: {{result.rating}} ({{result.review_count}} reviews)</p>
                      <p class="bizCategories">{{result.categories.map(x=>{return x.title;}).join(", ")}}</p>
                      <p class="bizIsClosed">{{result.is_closed ? "Closed Now" : "Open Now"}}</p>

                    </div>
                  </div>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
        <div id="right">
          <div id="businessesLocationsMap"></div>
        </div>
      </div>
    </div>
</template>

<script>
  import SearchBar from "./searchBar";
  import {loadedGoogleMapsAPI} from '@/main'
  import {initMultiMap} from  '../tmp/GoogleMap'
  import firebase from "firebase";
  const querystring = require('querystring');
  export default {
    name: "searchView",
    components: {SearchBar},
    data() {
      return {
        msg: 'Welcome to search view',
        dollarSigns:[
          {sign:"$",marked:false},
          {sign:"$$",marked:false},
          {sign:"$$$",marked:false},
          {sign:"$$$$",marked:false}],
         attributes:[
          {attr:"wheelchair_accessible",marked:false},
          {attr:"gender_neutral_restrooms",marked:false},
          {attr:"cashback",marked:false}],
          limitOptions:[10,20,30,40,50],
          radiusOptions:[
            1000,5000,10000,30000],
          sortByOptions:["best_match","rating","review_count","distance"],
          queryTerms:{
            location:null,
            term:null,
            price:null,
            latitude:null,
            longitude:null,
            radius:null,
            // categories:null,
            // locale:null,
            limit:20,
            // offset:null,
            sort_by:null,
            open_now:null,
            // open_at:null,
            attributes:null
        }
        ,searchResult:[],
        searchTerm:null,
        searchLocation:null,
        moreFiltersStatus:null
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

      this.fetchStoreInfo()
    },
    methods: {
      //fetch store info when page load, and purse url into local variables.
      fetchStoreInfo(){

        console.log("in the fetchStoreInfo")

        //todo:add value to searchbar
        let urlTerms = this.$route.params.query;
        let urlTermsDic = querystring.parse(urlTerms);
        console.log("urlTerms"+urlTerms)
        for(const [key,value] of Object.entries(urlTermsDic)){
          if(this.queryTerms.hasOwnProperty(key)){
            console.log("key"+key)
              if(urlTermsDic[key] != null && urlTermsDic[key] != undefined){
                this.queryTerms[key] = urlTermsDic[key];
              }
          }else{
            this.$router.push({name:"welcomePage"});
          }
        }
        this.axios.get(`http://localhost:8081/search/?${urlTerms}`)
          .then((res) => {
            // console.log("res");
            console.log(res.data);
            this.searchResult = res.data;
            // obj.output = res.data;
            // console.log(this.searchResult);
            console.log('res.data.length')
            console.log(res.data.length)
            if(res.data.length !==0){
              console.log("inti map")
              loadedGoogleMapsAPI.then( () => { initMultiMap(res.data) });
            }
          })
          .catch((e) => {
            // obj.output = e;
          })

      },
      //update price filter and call updateStoreInfo to search result when user click any dollar signs
      updatePriceProperty(index){
        this.dollarSigns[index].marked = !this.dollarSigns[index].marked;
        this.queryTerms.price = this.dollarSigns
          .filter(x => x.marked)
          .map(x=>x.sign.length)
          .join(',');
        this.updateStoreInfo();
      },
      //update attribute filter and call updateStoreInfo to search result when user click any attribute
      updateAttributesProperty(index){
        this.attributes[index].marked = !this.attributes[index].marked;
        this.queryTerms.attributes = this.attributes
          .filter(x => x.marked)
          .map(x=>x.attr)
          .join(',');
        console.log(this.queryTerms.attributes)
        this.updateStoreInfo();
      },
      //update search result when user makes a change to filter or input different locations/terms
      updateStoreInfo(){

        console.log("in the updateStoreInfo")

        //todo:check null?maybe not
        let searchDic={};

        for(const [keyParam,valueParam] of Object.entries(this.queryTerms)){
          if(valueParam != null){
            if(valueParam.length !== 0){
              searchDic[keyParam]=valueParam;
            }
          }
        }

        let queryInput = querystring.stringify(searchDic)
        console.log(queryInput)



        this.$router.push(queryInput)
        this.axios.get(`http://localhost:8081/search/?${queryInput}`)
          .then((res) => {
            console.log("res::::::::")
            console.log(res);


            this.searchResult = res.data;
            // obj.output = res.data;
            if(res.data.length !== 0){
              loadedGoogleMapsAPI.then( () => { initMultiMap(res.data) });
            }
          })
          .catch((e) => {
          })
      }
    }
  }
</script>

<style scoped>
#businessesLocationsMap{
  /*min-height: 500px;*/
  width: 100%;
  height: 100%;
}
div#container{
  width: 100%;
  height: 1100px;
  /*background-color: gray;*/
}

div#top{
  width: 100%;
  height: 15%;
  /*background-color: #89cff0;*/
}

div#left{
  width:70%;
  height:80%;
  /*background-color: aquamarine;*/
  float: left;
}

div#right{
  width:30%;
  height:60%;
  top:20%;
  /*background-color: blueviolet;*/
  position: fixed;
  right: 0;

}
  ul img{
    width: 300px;
    height: 280px;
    padding: 10px;
  }

  div .searchBiz{
    width: 100%;
    height: 300px;
    border: 1px solid darkgray;
    margin-top: 10px;
    /*background-color: #8e8e45;*/
  }

  div.bizLeft{
    width:40%;
    /*background-color: slategray;*/
    float:left;
    height: 100%;
  }

div.bizRight{
  width:60%;
  /*background-color: #a72267;*/
  float:left;
  height: 100%;
}

  .bizPrice, .bizRating{
    display: inline;
  }
  #top div{
    /*display: inline;*/
    font-weight: bold;
  }
#moreFiltersBtn{
  margin-top: 15px;
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

  #searchView{
    min-width: 1000px;
  }

  #attributesFilter, #priceFilter {
    cursor: pointer;
  }
</style>
