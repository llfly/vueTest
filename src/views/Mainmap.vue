<template>
	<div class="leftMainBox">
		<Plan-info :start.sync="start" :end.sync="end"  :lktime.sync="lktime"  :eva.sync="eva"></Plan-info>
		<div class="plans">
			<Planbox v-for="item in leftInfo" track-by="$index" :name='item.name' :time='item.cost' :dist='item.dis' :traffic-light='item.trafficLight' :traffic-block='item.trafficBlock' :pathway="item.pathway" :road-condi="item.roadCondi" :type="item.type" :is-eva.sync="isEva" :plan-is-hide.sync='item.planIsHide'  :is-best-plan.sync="isBestPlan" @click="turnPlan(item.index)" :index="item.index" :class="{'bgColor':item.bgcolor}" :plan-type="planType" :label="item.label"></Planbox>
			<span class="showHidePlan" v-show="planHasHide" @click="showAllPlan()">显示隐藏方案</span>
		</div>
	</div>
	<div class="mapMainBox">
		 <div id="map_canvas"></div>
	</div>
	<Assess v-show="assessShow"></Assess>
	<Bestplan v-show="BestplanShow" :is-best-plan.sync="isBestPlan"></Bestplan>
</template>
<script>

import PlanInfo from '../components/Planinfo';
import Planbox from '../components/Planbox.vue';
import Assess from '../components/Assess.vue';
import Bestplan from '../components/Bestplan.vue';
import API_ROOT from '../store/resources.js';
// import Sgmap from './Sgmap'

//地图相关
var lineObj = [];

//原始数据
var links = [];
var points = [];
var map = null;
var bounds = null;
var drawLinePoints = [];
var lines = [];
var startPoint,endPoint;
//var path = [];


function init(){
	//实例化地图
	var myLatlng = new sogou.maps.Point(12958035.802,4828316.786);
	var myOptions = {
		'zoom': 14,
		'center': myLatlng,
		'mapTypeId': sogou.maps.MapTypeId.ROADMAP
	}
	map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
	fitBounds();
	initStartAndEnd(startPoint,'start');
	initStartAndEnd(endPoint,'end');
	//分别处理links和points
	for(var i=0,len = links.length;i<len;i++){
		drawLinePoints.push(dealPoints(links[i],points[i]));
	}
	//对处理之后的点分别进行划线操作
	if(drawLinePoints){
		for(i=0,len=drawLinePoints.length;i<len;i++){
			lines.push(drawMap(i,drawLinePoints[i]));
		}
	}
	map.fitBounds(bounds);
}

function initStartAndEnd(pos,type){
	var url = type == 'start' ? 'http://map.sogou.com/m/webapp/images/startIcon.png':'http://map.sogou.com/m/webapp/images/endIcon.png';
	var image = new sogou.maps.MarkerImage(url,new sogou.maps.Size(30, 30),new sogou.maps.Point(0,0),new sogou.maps.Point(15, 30));
	var marker = new sogou.maps.Marker({
        position:new sogou.maps.Point(pos.x,pos.y),
        icon:image,
        map: map,
        //draggable:true
    });
    return marker;
}
function dealPoints(link,point){
	// var link = links[0];
	// var point = points[0];
	var path = [];
	for(var i=0 , len=link.length ; i<len; i++){
		var start = link[i]&&link[i].index;
		var end = (link[i+1] && link[i+1].index) || point.length;
		var arr = [];
		for(var j = start;j<=end;j++){
			if(point[j]!=undefined)
 				arr.push(point[j]);
		}
		path.push(arr);
	}
	//console.log(path.length);
	return path;
	//drawMap();
}
function drawMap(index,path){
	var colorArr = ['#0000ff','#00ff00','#ffff00','#ee4444','#990000'];
	var pathArr = [];
	//console.log(path.length);
	//console.log(path[36]);
	for(var i=0,len = path.length;i<len;i++){
		try{
			var p = new sogou.maps.Polyline({
	            'path':path[i],
	            "map": map,
	            //strokeColor: "#FF0000",
			     strokeOpacity: 0.2,
			     strokeWeight: 5,
	            //disableLabel: true,
	            strokeColor: colorArr[links[index][i].level],
	            dashstyle:"Solid"
        	});
        	pathArr.push(p);
        	//console.log(i,path[i]);
		}catch (ex){
        	console.log(ex);
    	}
	}
	//console.log(1);
	return pathArr;
	//map.fitBounds(bounds);
	//console.log(pathArr);
}
function fitBounds(){
	bounds = new sogou.maps.Bounds(points[0][0].x,points[0][0].y,points[0][0].x,points[0][0].y);
	for(var i=0,len= points.length;i<len;i++){
		for(var j =0,len1=points[i].length;j<len1;j++){
			bounds.extend(points[i][j]);
		}
	}
}

function selectPath(index){
	for(var i=0,len= lines.length;i<len;i++){
		for(var j=0,len1 = lines[i].length;j<len1;j++){
			lines[i][j].setStyle({"StyleStroke":{opacity:"0.2",weight:'3px'}});
		}
	}
	for(i=0,len= lines[index].length;i<len;i++){
		lines[index][i].setStyle({"StyleStroke":{opacity:"1",weight:'5px'}});
	}
}

export default{
	data(){
		return{
			//基本信息相关
			start:'',
			end:'',
			lktime:'',
			eva:'',
			caseid:'',
			planType:'',
			//左侧信息相关
			//['线上方案','世纪高通','全程畅通','老自定义','新自定义','历史不合理','新结果']
			type:'',
			time:'',
			rmBest:'',
			ishide:'',
			dist:'',
			trafficLight:'',
			trafficBlock:'',
			pathway:'',
			roadCondi:'',
			//是否评价过，改变文案显示：评价or重新评价
			isEva:false,
			evaPlanCur:'',
			assessShow:false,

			//设为最佳 or 取消最佳 相关
			isBestPlan:false,
			bestPlanCur:'',
			BestplanShow:false,

			//左侧信息
			leftInfo:[],

			//显示与隐藏相关
			planHasHide:false,
			planHided:[],
			//地图相关
			// links:[],
			// points:[],
		}
	},
	components:{
		Planbox,
		Assess,
		Bestplan,
		PlanInfo,
		//Sgmap
	},
	// ready(){
	// 	this.getData();
	// 	var that = this;
	// 	setTimeout(function(){
	// 		that.turnPlan(0);
	// 	},2000);
	// 	//action=getevaroute&caseid=xxx
	// },
	route:{
		data(){
			map&&map.clearAll();
			links = [];
			points = [];
			bounds = null;
			drawLinePoints = [];
			lines = [];
			this.leftInfo = [];
			this.getData();
			var that = this;
			setTimeout(function(){
				that.turnPlan(0);
			},2000);
		}
	},
	methods:{
		getData(){
			var url = API_ROOT + '&action=' + this.$route.params.type + '&caseid='+ this.$route.params.id;
			console.log(url);
			//普通匹配 getevaroute  匹配校验 getmatchroute  getevaroute  getmatchroute
			this.planType = this.$route.params.type;
			//console.log(this.planType);
			this.$http.get(url, function(data) {
				//console.log(data);
                if(data.status == 'success')
                	this.turnData(data);
            }).catch(function(data, status, request) {
                console.log('fail' + status + "," + request);
            });
		},
		turnData(data){
			//console.log(data);
			//加载基本信息
			this.start = data.start;
			this.caseid = data.caseid;
			this.end = data.end;
			this.eva = data.eva;
			this.lktime = data.lktime;
			this.rous = data.routes;
			startPoint = data.routes[0].points[0];
			endPoint = data.routes[0].points[data.routes[0].points.length-1];

			//对数据进行排序整理,地图绘制数据
			//整理每一个planBox
			for(var i=0,len = data.routes.length;i<len;i++){
				links.push(data.routes[i].links);
				points.push(data.routes[i].points);
				var obj = {
					index:i,
					bgcolor:false,
					planIsHide:true,//是否显示
					name:data.routes[i].name,//方案名称
					eva: data.routes[i].eva,//评价
					label:data.routes[i].label,//标签
					reason: data.routes[i].reason,//理由
					cost: data.routes[i].cost + '分钟',//时间:单位分钟
					dis: data.routes[i].dis/1000 + '公里',//长度：单位米
				}
				if(data.routes[i].light){
					obj.trafficLight = data.routes[i].light+'个红绿灯';
					if(data.routes[i].left)
						obj.trafficLight += '('+ data.routes[i].left + '个左转弯)';
				}
				if(data.routes[i].jamnum){
					obj.trafficBlock = data.routes[i].jamnum+ '段拥堵';
					if(data.routes[i].jamlen)
						obj.trafficBlock += '，共'+ data.routes[i].jamlen/1000 +'公里';
				}
				if(data.routes[i].lanelen){
					obj.pathway = '小路' + data.routes[i].lanelen/1000 + '公里';
				}
				if( data.routes[i].lklen){
					obj.roadCondi = '有路况' + data.routes[i].lklen/1000 + '公里';
				}
				//['线上方案','世纪高通','全程畅通','老自定义','新自定义','历史不合理']

				var exp = new RegExp("线上方案|世纪高通|全程畅通|历史不合理|新结果|老自定义|历史方案");
				//console.log(exp.test(data.routes[i].name));
				if(exp.test(data.routes[i].name)){
					obj.type = data.routes[i].name.replace(/\d/,'');
				}else{
					obj.type = '新自定义';
				}
				// if(data.routes[i].name == '线上方案' || data.routes[i].name == '世纪高通'  || data.routes[i].name == '全程畅通' ||
				// 	data.routes[i].name == '历史不合理' || data.routes[i].name == '新结果' || data.routes[i].name == '老自定义'
				// ){
				// 	obj.type = data.routes[i].name;
				// }else{
				// 	obj.type = '世纪高通';//'新自定义';
				// }
				this.leftInfo.push(obj);
			}

			init();
			//dealPoints();
			//drawMap();
			//console.log(this.rous[0]);
		},
		turnPlan(index){
			//console.log(this);// = '#ff0000';
			for(var i=0,len=this.leftInfo.length;i<len;i++){
				this.leftInfo[i].bgcolor = false;
			}
			this.leftInfo.filter(function(item) {
				return item.index == index
			})[0].bgcolor = true;

			selectPath(index);
			//this.bgcolor = true;
		},
		//显示全部逻辑
		showAllPlan(){
			var that = this;
			for(var i=0,len = this.planHided.length;i<len;i++){
				this.planHided[i].planIsHide = true;
			}
			this.planHided.length = 0;
			this.planHasHide = false;
		},
		getItem(index){
			return this.leftInfo.filter(function(item){
				return item.index == index;
			})[0];
		}

	},
	events:{
		//评论按钮点击，显示逻辑
		evaBox(index){
			this.evaPlanCur = this.getItem(index);
			this.assessShow = true;
		},
		//评论窗口数据逻辑
		assessSave(bool,read,sead,assessText){
			if(bool){
				if(sessionStorage.user){
				//上传数据
					var url = API_ROOT + '&action=submiteva';

					this.$http.post(url,{
						taskid:this.$route.params.id,
						user:sessionStorage.user,
						eva:[{
							caseid:this.caseid,
							name:this.evaPlanCur.name,
							cost:0,dis:0,
							eva:read,
							label:sead,
							reason:assessText,
						}]
					}).then((response)=>{
							//console.log(response);
							alert('上传成功');
						},(response)=>{
							alert('上传失败');
						});
					//修改逻辑为重新评价
					this.isEva = true;
				//post action=submiteva
				}else{
					this.$route.router.go({name:'login',params:{type:'mainmap',type2:this.$route.params.type,id:this.$route.params.id}});
				}
			}
			this.assessShow = false;
		},

		//设为最佳相关函数
		bestPlanShow(index){
			this.bestPlanCur = this.getItem(index);
			this.BestplanShow = true;
		},
		bestPlanBox(bool,assessText){
			if(bool){
				//上传数据
				 //this.$http.post(
				var url = API_ROOT + '&action=submiteva';
				// }, [options]).then(successCallback, errorCallback);
				//设为最佳 or 取消最佳
				if(sessionStorage.user){
					this.$http.post(url,{
						taskid:this.$route.params.id,
						user:sessionStorage.user,
						eva:[{
							caseid:this.caseid,
							name:this.bestPlanCur.name,
							cost:0,dis:0,
							eva:this.bestPlanCur.eva,
							label:this.bestPlanCur.label,
							reason:assessText,
						}]
					}).then((response)=>{
							//console.log(response);
							alert('上传成功');
						},(response)=>{
							alert('上传失败');
						})
					this.isBestPlan = !this.isBestPlan;
				}else{
					this.$route.router.go({name:'login',params:{type:'mainmap',type2:this.$route.params.type,id:this.$route.params.id}});
				}
			}
			this.BestplanShow = false;
		},
		//隐藏逻辑
		hidePlan(index){
			this.planHasHide = true;
			var item = this.getItem(index);
			this.planHided.push(item);
			item.planIsHide = false;
		}
	}
}
</script>
<style>
	.leftMainBox{
		width:440px;
		padding:5px;
		border:1px solid #999;
		float: left;
	}
	.bgColor{
		background: #ccc;
	}
	.mapMainBox{
		margin-left: 450px;
	}
	.showHidePlan{
		float: right;
		color:blue;
		cursor: pointer;
	}
	#map_canvas{
		width:1000px;
		height: 600px;
	}
</style>