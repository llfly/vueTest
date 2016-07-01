<template>
	<div class="leftMainBox"  v-cloak>
		<Plan-info :start.sync="start" :end.sync="end"  :lktime.sync="lktime"  :eva.sync="eva"></Plan-info>
		<div class="plans">
			<Planbox v-for="item in leftInfo" track-by="$index" :name.sync='item.name' :time='item.cost' :dist='item.dis' :traffic-light='item.trafficLight' :traffic-block='item.trafficBlock' :pathway="item.pathway" :road-condi="item.roadCondi" :type="item.type" :is-eva.sync="isEva" :plan-is-hide.sync='item.planIsHide'  :is-best-plan.sync="isBestPlan" @click="turnPlan(item.index)" :index="item.index" :class="{'bgColor':item.bgcolor}" :plan-type="planType" :label="item.label" :custom-btn="item.customBtn"></Planbox>
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
import Vue from 'vue';
// import Sgmap from './Sgmap'

//地图相关
var lineObj = [];
var DATA = [];
//原始数据
var links = [];
var points = [];
var map = null;
var bounds = null;
var drawLinePoints = [];
var lines = [];
var startPoint,endPoint;
var CaseID,CaseTYPE;
var dragArr = [];
var intObj = null;
var postData = [];//要向服务器提交的数据

function init(){
	//实例化地图
	var myLatlng = new sogou.maps.Point(12958035.802,4828316.786);
	var myOptions = {
		'zoom': 14,
		'center': myLatlng,
		'mapTypeId': sogou.maps.MapTypeId.ROADMAP
	}
	map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
	if(CaseTYPE != 'dispcase')
		initDrag();
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
			lines.push(drawMap(links[i],drawLinePoints[i]));
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
function drawMap(color,path){
	var colorArr = ['#0000ff','#00ff00','#ffff00','#ee4444','#990000'];
	var pathArr = [];
	for(var i=0,len = path.length;i<len;i++){
		try{
			var p = new sogou.maps.Polyline({
	            'path':path[i],
	            "map": map,
	            //strokeColor: "#FF0000",
			    opacity: 0.2,
			    strokeWeight: 5,
	            //disableLabel: true,
	            strokeColor: colorArr[color[i].level],
	            dashstyle:"Solid",
	            //isFixed:true
        	});
        	if(map.dgObject){
        		map.dgObject.addTarget(p);
        	}
        	pathArr.push(p);
        	//console.log(i,path[i]);
		}catch (ex){
        	console.log(ex);
    	}
	}
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
	if(index || index == 0){
			for(i=0,len= lines[index].length;i<len;i++){
			lines[index][i].setStyle({"StyleStroke":{opacity:"1",weight:'5px'}});
		}
	}
}

//拖拽点相关
var wp,evt=sogou.maps.SEvent.trigger;
function point2lineDistance(x0,y0,x1,y1,x2,y2){
	var a=0;if(x1==x2&&y1==y2)
		return Math.sqrt((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0));
	if(x1==x2){
		a=Math.abs(x1-x0)
	}else if(y1==y2){
		a=Math.abs(y1-y0)
	}else{
		var xc,yc,a1,b1,c1,a2,b2,c2;a1=y2-y1;b1=x1-x2;c1=x1*y2-x2*y1;a2=x1-x2;b2=y1-y2;c2=(x1-x2)*x0+(y1-y2)*y0;
		xc=(b1*c2-b2*c1)/(a2*b1-a1*b2);
		yc=(a1*c2-a2*c1)/(a1*b2-a2*b1);
		a=Math.sqrt((yc- y0)*(yc-y0)+(xc-x0)*(xc-x0));
	}
	return a
}
function initDrag(){
	if(!wp){
		map.dgObject = new Waypoints();
	}
	dragArr.push(startPoint);

	sogou.maps.SEvent.addListener(map.dgObject,'draging',draging);
	sogou.maps.SEvent.addListener(map.dgObject,'dragend',dragend);
}

var ol=null,isMove=false,st=null,speed=400,isFirst=1,isdraging=0;
var dragLinesArr;
function draging(a,b,c){
	var tn;
	if(!st)st=Date.now();
	var dt=Date.now();
 	if(dt-st<=speed&&!isFirst)return;
 	else{
 		st=dt;
 		isMove=true;
 		isFirst=0;
 	}
 	if(isdraging==0){
		isdraging=1;
		//清除所有拖拽点
 	}

 	if(dragLinesArr&&dragLinesArr.length){
 		for(var i=0,len = dragLinesArr.length;i<len;i++){
			dragLinesArr[i].setMap(null);
		}
 	}
	//dragLinesArr = null;
 	var dra = new sogou.maps.Point(a.point.x,a.point.y);
 	dragArr.push(dra);
 	dragArr.push(endPoint);
	var url = API_ROOT + 'getroute' + '&caseid=' + CaseID + '&points=' + getPoints();
	dragArr.length = 1;
	//map.clearAll();
	console.log(url);
	getJSONP(url,getDragData);
	intObj = null;
}
function getPoints(){
	var strArr = [];
	for(var i=0,len = dragArr.length;i<len;i++){
		strArr.push(dragArr[i].x + ',' + dragArr[i].y);
	}
	return strArr.join(';');
}
function dragend(a,b,c){
	// var dra = new sogou.maps.Point(a.point.x,a.point.y);
 // 	dragArr.push(dra);
 // 	dragArr.push(endPoint);
	// var url = API_ROOT + 'getroute' + '&caseid=' + CaseID + '&points=' + getPoints();
	// dragArr.length = 1;
	// console.log(url);
	// getJSONP(url,getDragData);
	DATA.push(intObj);
	lines.push(dragLinesArr);
	//selectPath(lines.length-1);
	intObj = null;
	//dragArr.push(endPoint);
	//var url = API_ROOT + 'getroute' + '&caseid=' + CaseID + '&points=' + getPoints();
	//getJSONP(url,getDragData);
	isdraging=0;
	isFirst=1;
	isMove=false;
}
function getDragData(response){
	//获取拖拽数据
	//生成新路线
	//生成新框
	//map.clearAll();
	selectPath();
	var data = response.routes[0];
	var path = dealPoints(data.links,data.points);
	var obj = {
		index:vm.data().leftInfo.length,
		bgcolor:false,
		planIsHide:true,
		name:'自定义',
		eva:data.eva,
		label:data.label,
		reason:data.reason,
		cost:fixed2(data.cost) + '分钟',
		dis:fixed2(data.dis/1000) + '公里',
		customBtn:true,
	};
	postData[obj.index] = response;
	if(data.light){
		obj.trafficLight = data.light + '个红绿灯';
		if(data.left)
			obj.trafficLight +='('+ data.left + '个左转弯)';
	}
	if(data.jamnum){
		obj.trafficBlock = data.routes[i].jamnum+ '段拥堵';
 		if(data.jamlen)
			obj.trafficBlock += '，共'+ fixed2(data.jamlen/1000) +'公里';
	}
	if(data.lanelen){
		obj.pathway = '小路' + fixed2(data.lanelen/1000) + '公里';
	}
	if( data.lklen){
		obj.roadCondi = '有路况' + fixed2(data.lklen/1000) + '公里';
	}
	obj.type = '新自定义';
	dragLinesArr = drawMap(data.links,path);
	for(var i=0,len= dragLinesArr.length;i<len;i++){
		dragLinesArr[i].setStyle({"StyleStroke":{opacity:"1",weight:'5px'}});
	}
	intObj = obj;
}

//waypoints对象
function Waypoints()
{
	var t=this,m;
	t.m=m=map;
    t.targets = [];
    t.wayNodes;
	sogou.maps.SEvent.addDomListener(m.div,"mousemove",function(e){t.onMouseMove(e)});
    //SEvent.addListener(ServiceConfig,"ClearNav",function(e){t.clear();});
    sogou.maps.SEvent.addListener(m,"clearall",function(e){
        if(t.tp) delete t.tp;  //释放内存
    });
};
var wyp=Waypoints.prototype=new sogou.maps.G2MObject();
wyp.listeners = [];
wyp.addTarget = function(a,b){
	var t = this;
	t.listeners.push(sogou.maps.SEvent.addListener(a,"mouseover",function(e){t.onMouseOver(a,e)}));
}
wyp.onMouseMove=function(a){
	var t=this,d=t.tp,e=t.cl,m=t.m,c,f,g,h=0,i,k=t.sm,l,o,p,q,r=1,s,u,v,x1,x2,y1,y2,x,y,z;
	if(!a) a=event;
	if(d) u=d;
	if(e) v=e;
	if(u&&v)
	{
		c=_getRelativePointByEvent(a,m.div);
		g=m.divToBitmapCoordinate(c.x,c.y);
		if(k)
		{
			q=t.wayNodes;
			q=!q?[]:q;
			x1=Math.min(k[0].x,k[1].x)-5;
			x2=Math.max(k[0].x,k[1].x)+5;
			y1=Math.min(k[0].y,k[1].y)-5;
			y2=Math.max(k[0].y,k[1].y)+5;
			if(x1<g.x&&g.x<x2&&y1<g.y&&g.y<y2)
			{
				h=point2lineDistance(g.x,g.y,k[0].x,k[0].y,k[1].x,k[1].y);
				if(h<5)
				{
					o=k[1].y-k[0].y;
					p=k[1].x-k[0].x;
					if(Math.abs(o)>Math.abs(p)){y=g.y;x=(y-k[0].y)*p/o+k[0].x}
					else{x=g.x;y=o*(x-k[0].x)/p+k[0].y}
					for(i=0;i<q.length;i++)
					{
						s=m.spec.getBitmap(q[i].y,q[i].x,m.getLevelIndex());
						if(s.x>x-10&&x+10>s.x&&s.y>y-10&&y+10>s.y) {
                            r=0;break;
                        }
					}
					if(r)
					{
						t.show(u,e);
                        d.setPosition(m.spec.getMer(x,y,m.getZoom()));
						return
					}
				}
			}
			window.clearTimeout(t.hideTimer);
			t.hideTimer=t.setTimeout(t.hide,100,u,e);
		}
        f = [];

        // if(e.feature.segments && e.feature.levels)
        // 		z =  _filterNodes(e.feature.segments,e.feature.levels,t.m.getZoom())[0];
        // else
        //		z =  e.feature.points;
        z = e.path;
        for(i=0;i<z.length;i++){      //将摩卡托转换为bitmap坐标
            var zi = z[i];
            f.push(m.spec.getBitmap(zi.y,zi.x,t.m.getLevelIndex()))
        }
		for(i=0;i<f.length-1;i++)
		{
			x1=Math.min(f[i].x,f[i+1].x)-5;
			x2=Math.max(f[i].x,f[i+1].x)+5;
			y1=Math.min(f[i].y,f[i+1].y)-5;
			y2=Math.max(f[i].y,f[i+1].y)+5;
			if(x1<g.x&&g.x<x2&&y1<g.y&&g.y<y2)
			{
				h=point2lineDistance(g.x,g.y,f[i].x,f[i].y,f[i+1].x,f[i+1].y);
				if(h<5) {t.sm=[f[i],f[i+1]];
				break}
			}
		}
	}
	else if(u) t.hide(u,e);
};
wyp.onMouseOver=function(a,b){
	var t=this,c=t.tp,d,e,f,g,h,k,u="WP"+_uniqueId(),m=t.m;
	if(a&&a.fType=="L"&&b){
		d=b.latLng;
		t.cl=a;
        //g = a.feature.caption;
        // if(g.byteLength() > 20)
        //     h = "Lable01";
        // else
        //     h = "Lable02";
		if(!c){
            c = t.tp =new sogou.maps.Marker({
            map:map,
            position:d,
            // label:{
            //    visible:true,
            //    pixelOffset:new Point(10,20),
            //    style : h
            // },
            //styleId : "S1923",
            id: u
            });
            c.setZIndex(9999);
            c.setDraggable(true);
            sogou.maps.SEvent.addListener(c,"drag",function(a){
                t.isdging=1;
                a.tar = c;
                sogou.maps.SEvent.trigger(t,"draging",a,t.cl.path)}
            );
            sogou.maps.SEvent.addListener(c,"dragend",function(a){
                t.isdging=0;
                t.hide(c,t.cl);
                sogou.maps.SEvent.trigger(t,"dragend",a.point,t.cl)
            });
	   }
    c.getLabelObj() && c.getLabelObj().setStyle(h);
	}
};
wyp.show=function(a,b){
	var t = this;
	a.setVisible(true);
}
wyp.hide=function(a,b){
    if(!this.isdging){
        a.setVisible(false);
    }
}
/**
*过滤限定了显示级别的点，只有显示级别低于等于当前缩放级别的点才被记录下来
*@param a Array[Point]	所有的点坐标 [Point]
*@param b Array[Number]   所有的点对应的显示级别 [Number]
*@param c Number	当前的缩放级别
*@return Array[Point] 符合当前缩放级别下显示的点
*/
function fixed2(str){
	return parseFloat(str).toFixed(2);
}

function getJSONP(url, callback) {
    if (!url) {
        return;
    }
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']; //定义一个数组以便产生随机函数名
    var r1 = Math.floor(Math.random() * 10);
    var r2 = Math.floor(Math.random() * 10);
    var r3 = Math.floor(Math.random() * 10);
    var name = 'getJSONP' + a[r1] + a[r2] + a[r3];
    url += '&cb=' + name;
    var script = document.createElement('script');
    //定义被脚本执行的回调函数
    window[name] = function (e) {
        try {
        	callback && callback(e);
        } catch (e) {
        	console.log(e);
        }
        finally {//最后删除该函数与script元素
            delete window[name];
            script.parentNode.removeChild(script);
        }

    }
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
}
function _filterNodes(a,b,c)
{
    var i,j,d=[];
    if(!b)return a;
    for(i=0;i<a.length;i++){
        d[i]=[];
        for(j=0;j<a[i].length;j++){
            if(b[i][j]!=null&&b[i][j]<=c)d[i].push(a[i][j]);
        }
    }
    return d
}
function _uniqueId(){
	var a=Math.random,b=parseInt;
	return Number(new Date()).toString()+b(10*a())+b(10*a())+b(10*a())
}
function _getRelativePointByEvent(a, b, c) {
	if (!c) {
		c = new sogou.maps.Point(0, 0)
	}
	var e = getPointByEvent(a),
		f = _offsetPositionAbsolute(b);
	c.x = e.x - f.x;
	c.y = e.y - f.y
	return c
}

function getPointByEvent(e) {
	var b = document.documentElement,
		c = document.body;
	return {
		x: e.pageX || (e.clientX + (b.scrollLeft || c.scrollLeft)),
		y: e.pageY || (e.clientY + (b.scrollTop || c.scrollTop))
	}
}

function _offsetPositionAbsolute(a) {
	var b = {
		"x": 0,
		"y": 0
	};
	while (a) {
		b.x += a.offsetLeft || 0;
		b.y += a.offsetTop || 0;
		a = a.offsetParent
	}
	return b
}

var vm = {
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
			leftInfo:DATA,

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
			this.init();
		}
	},
	methods:{
		init(){
			map&&map.clearAll();
			links = [];
			points = [];
			bounds = null;
			drawLinePoints = [];
			lines = [];
			//this.leftInfo = [];
			DATA = [];
			//postData是否需要更新?
			postData = [];
			this.leftInfo = DATA;
			this.getData();
			var that = this;
			setTimeout(function(){
				if(that.leftInfo.length)
				that.turnPlan(0);
			},2000);
		},
		getData(){
			CaseID = this.$route.params.id;
			CaseTYPE = this.$route.params.type;
			var url = API_ROOT  + CaseTYPE + '&caseid='+ this.$route.params.id;
			if(CaseTYPE == 'getmatchroute'){
				url +='&taskid='+ this.$route.params.taskid;
			}
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
					customBtn:false,//是否显示保存按钮
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

				var exp = new RegExp("线上方案|世纪高通|全程畅通|历史不合理|新结果|历史方案");
				//console.log(exp.test(data.routes[i].name));
				if(exp.test(data.routes[i].name)){
					obj.type = data.routes[i].name.replace(/\d/,'');
				}else{
					obj.type = '老自定义';
				}
				//this.leftInfo.push(obj);
				DATA.push(obj);
			}

			init();
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
					var url = API_ROOT + 'submiteva';

					this.$http.post(url,{
						"taskid":+this.$route.params.id,
						"user":sessionStorage.user,
						"evas":[{
							"caseid":+this.caseid,
							"name":this.evaPlanCur.name,
							"cost":0,"dis":0,
							"eva":read,
							"label":sead,
							"reason":assessText,
						}]
					},{
						headers:{
							"Content-Type":"application/x-www-form-urlencoded"
						}
					}).then((response)=>{
							//console.log(response);
							if(response.data.status == "success")
							alert('评价成功');
						},(response)=>{
							alert('评价失败');
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
				this.bestPlanCur.label = this.isBestPlan ?"null":"最佳";
				//上传数据
				 //this.$http.post(
				var url = API_ROOT + 'submiteva';
				// }, [options]).then(successCallback, errorCallback);
				//设为最佳 or 取消最佳
				if(sessionStorage.user){
					this.$http.post(url,{
						"status":"success",
						"taskid":+this.$route.params.id,
						"user":sessionStorage.user,
						"evas":[{
							"caseid":+this.caseid,
							"name":this.bestPlanCur.name,
							"cost":0,"dis":0,
							"eva":this.bestPlanCur.eva,
							"label":this.bestPlanCur.label,
							"reason":assessText,
						}]
					},{
						headers:{
							"Content-Type":"application/x-www-form-urlencoded"
						}
					}).then((response)=>{
						console.log(response);
							if(response.data.status == "success")
								alert('操作成功');
						},(response)=>{
							alert('操作失败');
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
		},

		//新自定义 保存
		customSave(index){
			var url = API_ROOT + 'saveroute&caseid=' + this.caseid;
			var that = this;
			if(postData[index]){
					this.$http.post(url,postData[index],{
						headers:{
							"Content-Type":"application/x-www-form-urlencoded"
						}
					}).then((response)=>{
						console.log(response);
							if(response.data.status == "success"){
								alert('保存成功');
								this.getItem(index).customBtn = false;
							}
							else{
								alert('保存失败');
							}
						},(response)=>{
							alert('请求失败');
						})
				}
		},
		//新自定义 修改名称
		changeName(index,text){
			var name = text.replace(/<br>|<br\/>/g,"") || '默认名称';
			this.getItem(index).name = name;
			postData[index].routes[0].name = name;
		}
	},
	computed:{

	}
}
module.exports = vm;
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
		margin-left: 460px;
	}
	.showHidePlan{
		float: right;
		color:blue;
		cursor: pointer;
	}
	.mapMainBox{
		height: 100%;
	}
	#map_canvas{
		width:100%;
		height: 100%;
	}
	[v-cloak] {
  		display: none;
	}
</style>