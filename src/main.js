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
//import Login from './views/Login';


Vue.use(Router);
Vue.use(Resource);
Vue.config.debug = true;

var router = new Router({})

router.map({
	'/':{
		component:Tasklist
	},
	// '/login':{
	// 	name:'login',
	// 	component:Login
	// },
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
