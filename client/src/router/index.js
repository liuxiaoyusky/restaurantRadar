import Vue from 'vue'
import Router from 'vue-router'
import welcomePage from '@/components/welcomePage'
import registerSignUpView from "../components/registerSignUpView";
import searchView from "../components/searchView";
import storeView from "../components/storeView";
import notFound from "../components/notFoundView"

Vue.use(Router)

//this file defines the router behavior in front end.
export default new Router({
  routes: [
    {
      path: '/',
      name: 'welcomePage',
      component: welcomePage
    }
    , {
      path: '/registerSignUp',
      name: 'registerSignUp',
      component: registerSignUpView
    }
    , {
      //todo: empty search, use ip address
      path: '/search',
      name: 'defaultSearch',
      component: searchView
    }
    , {
      path: '/search/:query',
      name: 'search',
      component: searchView
    }
    , {
      path: '/store/:store_id',
      name: 'store',
      component: storeView
    }
    , {
      path: '*',
      name: 'notFound',
      component: notFound
    }
  ]
  //this will remove the # in url
  //todo:cannot register without #; url too redundant, not correct
  ,mode:'history'
})
