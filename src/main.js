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
import Login from './views/Login';

Vue.use(Router);
Vue.use(Resource);
Vue.config.debug = true;
//Vue.http.options.emulateJSON = true;
//Vue.http.options.xhr = {withCredentials: true};

var router = new Router({
	hashbang:true
	//history:true
})


Vue.filter('isNull',function(value){
	if(value == null || value == 'null'){
		return "";
	}else{
		return value;
	}
});
router.map({
	'/':{
		component:Tasklist
	},
	'login/:type/:type2/:taskid/:id':{
		name:'login',
		component:Login
	},
	'taskList':{
		name:'taskList',
		component:Tasklist
	},
	'newTask':{
		name:'newTask',
		component:Newtask
	},
	'sampleList':{
		name:'sampleList',
		component:SampleList
	},
	'artificial/:id':{
		name:'artificial',
		component:Artificial
	},
	'matchlist/:id':{
		name:'matchList',
		component:MatchList
	},
	'mainmap/:type/:taskid/:id':{
		name:'mainmap',
		component:Mainmap
	}
})

router.start(App,'app');
