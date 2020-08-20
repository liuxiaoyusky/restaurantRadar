<!--This is the view for user to sign up and login.-->
<template>
  <div id="registerSignUpView">
    <div id="errDiv">
      <p id="errPTag">{{errMesg}}</p>
    </div>
    <div id="signInBlock">
      <h1>Sign in</h1>
      <form @submit.prevent="submitSignIn(signInEmail, signInPassword)">
        <label for="signInEmail">Email: </label><input type="text" id="signInEmail" placeholder="xxx" v-model="signInEmail">
        <label for="signInPassword">Password: </label><input id="signInPassword" placeholder="123456" v-model="signInPassword">
        <button id="signInBtn">Sign in</button>
      </form>
      <pre>
        {{output}}
      </pre>
    </div>
    <hr/>
    <div id="registerBlock">
      <h1>Register</h1>
      <form @submit.prevent="submitRegister">
        <label for="registerEmail">Email: </label><input id="registerEmail" placeholder="xxx@wustl.edu" v-model="registerEmail">
        <label for="registerName">Username: </label><input id="registerName" placeholder="name" v-model="registerName">
        <label for="registerPassword">Password: </label><input id="registerPassword" placeholder="123456" v-model="registerPassword">
        <button id="registerBtn">Register</button>
      </form>
      <div>
<!--        <p v-for=""></p>-->
<!--        {{output}}-->
      </div>
    </div>
  </div>
</template>

<script>
    import firebase from "firebase";

    export default {
        name: "registerSignUp"
      ,data(){
          return{
            registerName:null,
            registerPassword:null,
            registerEmail:null,
            signInEmail:null,
            signInPassword:null,
            output:null,
            errMesg:null
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
      ,methods:{
          //called when user try to submit a register request. Will check input locally first and then send request to
        // backend. And output error on this view if exists.
        submitRegister(e) {
          let obj = this;
          console.log("in submitRegister")
          this.axios.post('http://localhost:8081/user/register/', {
            email: this.registerEmail,
            password: this.registerPassword,
            name: this.registerName
          })
            .then((res) => {
              console.log(res)
              if(res.data.success){
                this.$parent.username = this.registerName;
                this.submitSignIn(this.registerEmail, this.registerPassword)
              }else{
                // this.errMes
                this.errMesg = res.data.message;
              }
            })
            .catch((e) => {
              console.log(e)
              // this.errMesg = e;
            })
        },
        //called when user try to submit a sign in request. Will check input locally first and then send request to
        // backend. And output error on this view if exists.
        submitSignIn(email, password) {
          console.log("submitSignIn111")
          if(email == null|| email.length==0 || password==null || password.length==0){
            this.errMesg = null;
            this.errMesg = "Please fill in all fields.";
            console.log("missing fields")
            return;
          }

          firebase.auth().signInWithEmailAndPassword(email, password)
            .then(res => {
              console.log("res")
              console.log(res)

              this.$parent.login = true
              this.$parent.username = res.user.displayName;
              this.$router.go(-1)
            })
            .catch(e => {
              console.log("cat ch")
              console.error(e)
              this.errMesg = null;
              this.errMesg = e.message;
            })
        }
      }

    }
</script>

<style scoped>
  #errDiv{
    position: fixed;
    top:20%;
    left:10%;
    width: 80%;
    color:red;
    font-size: larger;
    font-weight: bold;
  }

  #registerSignUpView{
    position: fixed;
    top:30%;
    left:10%;
    width: 80%;
    /*height: 300px;*/
    /*border: 1px solid darkgray;*/
    /*margin-top: 10px;*/
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

  /*div#signInBlock{*/
  /*  width:50%;*/
  /*  !*background-color: slategray;*!*/
  /*  float:left;*/
  /*  height: 100%;*/
  /*}*/

  /*div#registerBlock{*/
  /*  width:50%;*/
  /*  !*background-color: #a72267;*!*/
  /*  float:left;*/
  /*  height: 100%;*/
  /*}*/
</style>
