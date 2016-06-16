import Vue from 'vue';
import Router from 'vue-router';
import Resource from 'vue-resource';

import App from './views/App';
import Tasklist from './views/Tasklist';
import SampleList from './views/SampleList'
import Newtask from './views/Newtask';
import Artificial from './views/Artificial';
import MatchList from './views/MatchList';
import Mainmap from './views/Mainmap';


Vue.use(Router);
Vue.use(Resource);
Vue.config.debug = true;

var router = new Router({})

router.map({
	'/':{
		component:Tasklist
	},
	'/taskList':{
		name:'taskList',
		component:Tasklist
	},
	'/newTask':{
		name:'newTask',
		component:Newtask
	},
	'/sampleList':{
		name:'sampleList',
		component:SampleList
	},
	'/artificial/:id':{
		name:'artificial',
		component:Artificial
	},
	'/matchlist/:id':{
		name:'matchList',
		component:MatchList
	},
	'/mainmap/:id':{
		name:'mainmap',
		component:Mainmap
	}
})

router.start(App,'app');

// new Vue({
//   el: 'body',
//   components: { App }
// })


// import Router from 'vue-router'
// import App from './components/App.vue'
// import List from './views/list.vue'
// import Content from './views/content.vue'
// import User from './views/user.vue'
// import Node from './views/node.vue'
// import Index from './views/index.vue'
// import Login from './views/login.vue'
// import Resource from 'vue-resource'
// import filters from './filters/filter'

// // 挂载路由
// Vue.use(Router)
// Vue.use(Resource)
// Vue.config.debug = false
// Vue.config.silent = true

// // 初始化路由
// var router = new Router({
//     hashbang: true,
//      history: false,
//      saveScrollPosition: true,
//      transitionOnLoad: true
// })


// Object.keys(filters).forEach(k => Vue.filter(k, filters[k]))

// router.map({
//   '/list': {
//   	name:'list',
//     component: List
//   },
//   '/': {
//     component: Index
//   },
//   '/content/:id/':{
//   	name:'content',
//   	component:Content
//   },
//   '/user/:username/':{
//     name:'user',
//     component:User
//   },
//   '/node':{
//     name:'node',
//     component:Node
//   },
//   '/login':{
//     name:'login',
//     component:Login
//   }
// })


// router.start(App, '#app')
