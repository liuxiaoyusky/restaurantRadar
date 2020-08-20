<!--This is the first and default view. This is the main page user will see upon open our web application. -->
<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <search-bar v-if="$parent.defaultLocation!=null"
    :term="searchTerm"
    :location="searchLocation"
    @update=""></search-bar>
  </div>
</template>

<script>
  import SearchBar from "./searchBar";
  import firebase from "firebase";

export default {
  name: 'welcomePage',
  components: {SearchBar},
  data () {
    return {
      msg: 'Welcome to Your shop radar',
      searchTerm:null,
      searchLocation:null
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
  }
}
</script>

<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

  .hello{
    position: fixed;
    top:30%;
    left:30%;
    width: 40%;
  }
</style>
