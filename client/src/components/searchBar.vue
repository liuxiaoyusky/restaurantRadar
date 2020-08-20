<!--This is the view that imported by welcomePage, storeView and searchView. To support user the search bar and
also route to serachView and update result.-->
<template>
    <div id="searchBar">
      <form @submit.prevent="submitSearch">
        <input id="storeNameSearch" placeholder="tacos,cheap dinner, Max's" v-model="term">
        <input id="location" :placeholder=defaultLocation v-model="location">
        <button id="searchBtn">
          <a>search</a>
        </button>
      </form>
    </div>
</template>

<script>
  import firebase from "firebase";

  const querystring = require('querystring');

    export default {
        name: "searchBar"
        ,data(){
          return{
            //todo: wrong name
            term:null,
            defaultLocation:"st. louis",
            location:null
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

        this.getDefaultLocation();
        this.getHistorySearchTerms();
      },
      methods:{
          //called when user click search button. Route the view to searchView
        submitSearch(){
          //todo: use ip address to update defaultLocation
          if(this.location === null){
            this.location = this.defaultLocation;
          }

          let queryInput = querystring.stringify({
            location: this.location,
            term: this.term
          })
          console.log("submit search")
          this.$router.push({name:'search',params:{query:queryInput}}).catch(e=>console.error(e))
          console.log("go")
          this.$router.go(0);
        },
        //retrieve default location
        getDefaultLocation(){
          this.defaultLocation = this.$parent.$parent.defaultLocation
          console.log("default location:"+this.defaultLocation)
        },
        //retrieve history search terms if exist
        getHistorySearchTerms(){
          this.term=this.$parent.searchTerm;
          this.location=this.$parent.searchLocation;
        }
      }
      ,beforeMount() {
        this.getDefaultLocation();
        this.getHistorySearchTerms()
      }
    }
</script>

<style scoped>
  #searchBar{
    padding: 10px;
  }

  input{
    margin-top: 25px;
    margin-bottom: 5px;
    text-align: center;
    clear: both;
    height: auto;
    padding: 5px;
    background: bisque;
    border-radius: 5px;
    width: 200px;
    font-size: medium;
  }

  button{
    background-color: sandybrown;
    color: #2c3e50;
  }


</style>
