<template>
	<div class="leftMainBox"  v-cloak>
		<Plan-info :start.sync="start" :end.sync="end"  :lktime.sync="lktime"  :eva.sync="eva"></Plan-info>
		<div class="plans">
			<Planbox v-for="item in leftInfo" track-by="$index" :name.sync='item.name' :time='item.cost' :dist='item.dis' :traffic-light='item.trafficLight' :traffic-block='item.trafficBlock' :pathway="item.pathway" :road-condi="item.roadCondi" :type.sync="item.type" :is-eva.sync="isEva" :plan-is-hide.sync='item.planIsHide' :eva="item.eva" :reason="item.reason" :is-best-plan.sync="item.bestPlan" @click="turnPlan(item.index)" :index="item.index" :class="{'bgColor':item.bgcolor}" :plan-type="planType" :label.sync="item.label" :custom-btn="item.customBtn"></Planbox>
			<span class="showHidePlan" v-show="planHasHide" @click="showAllPlan()">显示隐藏方案</span>
		</div>
		<span class="returnBtn" @click="backPage()">返回</span>
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
var DATA = [];//左侧列表信息维护

//原始数据
var LINKS = [];//links数组
var POINTS = [];//points数组
var ROUTE = [];//DrawLines对象
var map = null;//地图对象
//var bounds = null;//bounds 用于fitbounds
var CaseID,CaseTYPE;//case id类型，
var postData = [];//要向服务器提交的数据
var startPoint,endPoint;//起终点坐标
//var intObj = null;//拖拽点相关信息

//-----------------------------------画线部分-------------------------------------------//
function initialize(){
	//加载样式
	sogou.maps.StyleLib.preLoadJson(getStyleJson());
	sogou.maps.StyleLib.preLoadJson([{
		"v:stroke" : {
			"xmlns:v" : "v",
			color : "#0000ff",
			weight : "5",
			endcap : "Round",
			opacity : "1",
			startArrow : "None",
			endArrow : "None",
			dashstyle : "Solid",
			src : "",
			filltype : "solid"
		},
		id : "L0"
		}
	]);
	sogou.maps.StyleLib.preLoadJson([{
		"v:stroke" : {
			"xmlns:v" : "v",
			color : "#C87149",
			weight : "5",
			endcap : "Round",
			opacity : "0",
			startArrow : "None",
			endArrow : "None",
			dashstyle : "Solid",
			src : "",
			filltype : "solid"
		},
		id : "L1"
		}
	]);
	//实例化地图
	var myOptions = {
		'zoom': 14,
		'center': new sogou.maps.Point(12958035.802,4828316.786),
		'mapTypeId': sogou.maps.MapTypeId.ROADMAP
	}
	map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);

	//调用setStart，设置起终点 0起点，1终点
	_keyWayPoints = [null, null];
	_curX = startPoint.x;
	_curY = startPoint.y;
	setStart(0);

	_curX = endPoint.x;
	_curY = endPoint.y;
	setStart(1);

	//根据现有数据画线
	ROUTE = new DrawLines(LINKS,POINTS);
	fitBounds(POINTS);
}


function DrawLines(links,points){
	this.links = links;
	this.points = points;
	this.drawLinePoints = [];
	this.lines = [];
	this.init();

}
DrawLines.prototype.init = function(){
	//获取所有的路况点
	for(var i=0,len = this.links.length;i<len;i++){
		this.drawLinePoints.push(this.dealPoints(this.links[i],this.points[i]));
	}
	if(this.drawLinePoints.length){
		for(i=0,len=this.drawLinePoints.length;i<len;i++){
			this.lines.push(this.drawMap(this.links[i],this.drawLinePoints[i]));
		}
	}
}
//处理每一条数据的link和point
DrawLines.prototype.dealPoints = function(link,point){
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
	return path;
}
//绘制地图
DrawLines.prototype.drawMap = function(color,path){
	var colorArr = ['#C87149','#7FBD09','#F2850D','#E41515','#630000'];
	var pathArr = [];
	for(var i=0,len = path.length;i<len;i++){
		try{
			var p = new sogou.maps.Polyline({
	            'path':path[i],
	            "map": map,
			    opacity: 0.3,
			    strokeWeight: 3,
	            strokeColor: colorArr[color[i].level],
	            dashstyle:"Solid",
        	});
        	pathArr.push(p);
		}catch (ex){
        	console.log(ex);
    	}
	}
	return pathArr;
}
//--------------------------------------拖拽部分------------------------------------------//

var _curX, _curY;
var _keyWayPoints,_dragWayPoint;
var _lastDragTime = 0;
var routes = null;
var routesArr = [];//画出的route
var lineHadSave = false;//是否有线未保存
//初始化

//设置起终点
function setStart(i) {
	if (_dragWayPoint)
		_dragWayPoint.marker.dragging = false;
	var point = new sogou.maps.Point(_curX, _curY);

	if (_keyWayPoints[i]) {
		_keyWayPoints[i].marker.position.x = _curX;
		_keyWayPoints[i].marker.position.y = _curY;
	} else
		_keyWayPoints[i] = new WayPoint(point, i);//封装成waypoint对象
	_keyWayPoints[i].marker.relocation = true;

	// if (_keyWayPoints[0] && _keyWayPoints[1]) {
	// 	routing(_keyWayPoints, -1, false, true);
	// }
}

//type:0--start,1--target,2--drag,3--temp drag
function WayPoint(point, type, route) {
	var t = this;
	t.prevRoute = route ? route : null;
	t.nextRoute = route ? route : null;
	t.marker = drawWayPointMarker(t, point, type);
}
function drawWayPointMarker(wayPoint, point, type) {
	var styleId;
	switch (type) {
	case 0:
		styleId = "S1875"; //"S1875";
		break;
	case 1:
		styleId = "S1876"; //"S1876";
		break;
	case 2:
		styleId = "S1878";
		break;
	case 3:
		styleId = "S1872";
		break;
	}
	var draggable = true;
	if(type == 0 || type == 1){
		draggable = false;
	}
	var marker = new sogou.maps.Marker({
			map : map,
			position : point,
			draggable : draggable,
			styleId : styleId,
			id : type == 3 ? "dragPoint" : ""
		});

	function routingByMarker(withMarker, dragging) {
		var wayPoints = [];

		if (wayPoint.prevRoute)
			wayPoints.push(wayPoint.prevRoute.fromWayPoint);

		var dpi = -1;
		if (withMarker) {
			dpi = wayPoints.length;
			wayPoints.push(wayPoint);
		}

		if (wayPoint.nextRoute)
			wayPoints.push(wayPoint.nextRoute.toWayPoint);

		if (wayPoints.length > 1)
			routing(wayPoints, dpi, dragging);
	};

	function getAllWayPoints(){
		var wayPoints = [];
		wayPoints.push(wayPoint.marker.position);
		var prev = wayPoint.prevRoute;
		var next = wayPoint.nextRoute;

		while(prev){
			wayPoints.unshift(prev.fromWayPoint.marker.position);
			prev = prev.fromWayPoint.prevRoute;
		}
		while(next){
			wayPoints.push(next.toWayPoint.marker.position);
			next = next.toWayPoint.nextRoute;
		}
		return wayPoints;
	}
	if (type == 3) {
		sogou.maps.event.addListener(marker, "click", function (e) {
			routingByMarker(true, false);
		});
	}
	//
	sogou.maps.event.addListener(marker, "dragstart", function (e) {
		marker.dragging = true;
	});
	//*
	sogou.maps.event.addListener(marker, "drag", function (e) {
		marker.position.x = e.point.x;
		marker.position.y = e.point.y;
		if (type == 3)
			marker.setVisible(true); //防止因触发mouseout事情Marker不可见
		//延迟执行
		var curTime = Date.now();
		if (!_lastDragTime)
			_lastDragTime = curTime;

		if (curTime - _lastDragTime > 400){
			_lastDragTime = curTime;
			routingByMarker(true, true);
		}
	});
	//*/
	sogou.maps.event.addListener(marker, "dragend", function (e) {
		marker.position.x = e.point.x;
		marker.position.y = e.point.y;
		marker.dragging = false;
		marker.relocation = true;
		_lastDragTime = 0;
		routingByMarker(true, false);
		var wayPoints = getAllWayPoints();
		var url = API_ROOT + 'getroute' + '&caseid=' + CaseID + '&points=' + wayPoints.join(';');
		setTimeout(function(){
			getJSONP(url,getDATA);
		},500)
		//1. 获取所有的wayPoint
		//2. 请求接口获取数据
		//3. 结合左边
	});

	if (type == 3) {
		sogou.maps.event.addListener(marker, "mouseout", function (e) {
			marker.setVisible(false);
		});
	}

	if (type == 2) {
		sogou.maps.event.addListener(marker, "rightclick", function (e) {
			var wayPoints = getAllWayPoints();
			if(wayPoints.length == 2 && wayPoints[0].x == startPoint.x && wayPoints[0].y == startPoint.y && wayPoints[1].x == endPoint.x && wayPoints[1].y == endPoint.y){//只剩起终点
				//删线
				DATA.pop();
			}else{
				routingByMarker(false, false);
				var url = API_ROOT + 'getroute' + '&caseid=' + CaseID + '&points=' + wayPoints.join(';');
				setTimeout(function(){
					getJSONP(url,getDATA);
				},500)
			}
			//阻止map右键菜单
			e.stopPropagation();
			//阻止浏览器右键菜单
			e.preventDefault();
		});
	}

	return marker;
}
//wayPoints对象(start,end),dpi,是否是拖拽，是否是第一次，第几条数据
function routing(wayPoints, dpi, dragging,noData,index) {
	var wp = "";
	var bounds = new sogou.maps.Bounds();
	for (var i = 0; i < wayPoints.length; ++i) {
		if (i > 0)
			wp += ";";
		var point = wayPoints[i].marker.position;
		wp += point;
		bounds.extend(point);
	}
	bounds.extend(startPoint);
	bounds.extend(endPoint);
	map.fitBounds(bounds);
	var url = API_ROOT + 'getroute' + '&caseid=' + CaseID + '&points=' + wp;
	if(noData){
		//从服务器端获取的第一次数据，起终点
		drawRoute(routes[index || 0],wayPoints,dpi,dragging,noData,index)
	}else{
		console.log(url);
		getJSONP(url,function(data){
			if(data.status == 'success'){
				if(data.routes[0]){
					drawRoute(data.routes[0],wayPoints,dpi,dragging);
				}
			}else{
				console.log('请求失败');
			}
		});
	}
}

function drawRoute(jsonRes, wayPoints, dpi, dragging,noData,index) {
	var routePath = [];
	var jsonRoute = jsonRes;
	//if(dragging)
	//	jsonRoute = jsonRes.Route.Feature;
	var curWayPoint = wayPoints[0];//起点
	var lastWayPoint = wayPoints[wayPoints.length - 1];//终点
	//debugger;
	while (curWayPoint.nextRoute) {//作用？
		curWayPoint.nextRoute.polyline.setMap(null);//清空所有的polyline
		if(curWayPoint.nextRoute.linkPolyline){
			for(var i=0,len = curWayPoint.nextRoute.linkPolyline.length;i<len;i++){
				curWayPoint.nextRoute.linkPolyline[i].setMap(null);
			}
		}
		curWayPoint = curWayPoint.nextRoute.toWayPoint;

		if (curWayPoint == lastWayPoint)
			break;
		if (dpi >= 0 && curWayPoint == wayPoints[dpi])
			continue;
		curWayPoint.marker.setMap(null);//清除marker
	}
	var allLinks = jsonRoute.links;
	if (dpi > 0 && dpi < wayPoints.length - 1 && !dragging && wayPoints[1] == _dragWayPoint) {
		wayPoints[1] = new WayPoint(wayPoints[1].marker.getPosition(), 2);
	}

	var allPoints = jsonRoute["points"];
	//var allLevels = fn["levels"][0];

	var jsonWayPoints = jsonRoute.waypoints,i;
	for (i = 0; i < wayPoints.length; ++i) {
		if (i != dpi || !dragging) {
			//拖拽等操作会使其他节点位置发生偏移，因此，对于每个节点我们只进行一次重定位
			if (wayPoints[i].marker.relocation == true) {
				wayPoints[i].marker.relocation = false;
				var point;
				if(noData){
					point = i == 0 ? new sogou.maps.Point(startPoint.x,startPoint.y) : new sogou.maps.Point(endPoint.x,endPoint.y);
				}else{
					point = allPoints[jsonWayPoints[i].pidx];
				}
				wayPoints[i].marker.setPosition(point);
				wayPoints[i].marker.position.x = point.x;
				wayPoints[i].marker.position.y = point.y;
			}
			if(jsonWayPoints)
				wayPoints[i].pct = jsonWayPoints[i].pct;
		}

		if (i == wayPoints.length - 1)
			break;
		var links = [],
		path = [],
		levels = [],
		len,j;
		if(noData){//第一次没有wayPoint
			for(j=0;j<allPoints.length;j++){
				path.push(allPoints[j]);
			}
			links = allLinks;
		}else{
			if(i==0)
				j = jsonWayPoints[i].idx;
			else
				j = jsonWayPoints[i].idx + 1;
			for(;j<=jsonWayPoints[i+1].idx;++j){
				links.push(allLinks[j]);
			}

			for (j = jsonWayPoints[i].pidx; j <= jsonWayPoints[i + 1].pidx; ++j) {
				path.push(allPoints[j]);
				//levels.push(allLevels[j]);
			}
		}
		var route = new Route(path, levels, links,index);
		wayPoints[i].nextRoute = route;
		wayPoints[i + 1].prevRoute = route;
		route.fromWayPoint = wayPoints[i];
		route.toWayPoint = wayPoints[i + 1];
		routePath.push(route);
	}

	return routePath;
}
function Route(path, levels, links,index) {
	var t = this;
	t.fromWayPoint = null;
	t.toWayPoint = null;
	//t.links = links;
	//t.linkPolyline = drawLinkPolyline(t,path,links);
	if(ROUTE.lines[index]){
		t.linkPolyline = true;
	}
	t.polyline = drawRoutePolyline(t, path, levels);
}
function drawRoutePolyline(route, path, levels) {
	var fn = new sogou.maps.FeatureNode();
	fn.points = path;
	//fn.levels = [0];
	fn.type = "L";

	var styleId = route.linkPolyline?'L1':'L0';
	var polyline = new sogou.maps.Polyline({
			//path:path,
			'feature' : fn,
			'map' : map,
			'styleId' :styleId
		});
	sogou.maps.event.addListener(polyline, "mousemove", function (e) {
		if (_dragWayPoint) {
			if (_dragWayPoint.marker.dragging == true)
				return;
			_dragWayPoint.marker.setVisible(true);
			_dragWayPoint.marker.setPosition(e.point);
			//_dragWayPoint.marker.position.x = e.point.x;
			//_dragWayPoint.marker.position.y = e.point.y;
			_dragWayPoint.prevRoute = route;
			_dragWayPoint.nextRoute = route;
		} else {
			_dragWayPoint = new WayPoint(e.point, 3, route);
			_dragWayPoint.marker.dragging = false;
		}
	});
	return polyline;
}
//路况 线
function drawLinkPolyline(route, path, links){
	var zero = links.every(function(item){
		return item.level == 0;
	});
	if(zero){
		return;
	}
	var colorArr = ['#C87149','#7FBD09','#F2850D','#E41515','#630000'];
	var pathArr = [];
	var linkArr = [];
	if(links&&links.length){//links存在
		for(var i=0 , len=links.length ; i<len; i++){
			var start = links[i]&&links[i].index;
			var end = (links[i+1] && links[i+1].index) || path.length;
			var arr = [];
			for(var j = start;j<=end;j++){
				if(path[j]!=undefined)
	 				arr.push(path[j]);
			}
			linkArr.push(arr);
		}
		for(var i=0,len = linkArr.length;i<len;i++){
			try{
				var p = new sogou.maps.Polyline({
		            'path':linkArr[i],
		            "map": map,
		            //strokeColor: "#FF0000",
				    opacity: 0.2,
				    strokeWeight: 5,
		            strokeColor: colorArr[links[i].level],
		            dashstyle:"Solid",
		            //isFixed:true
        	});
        		pathArr.push(p);
        	}catch (ex){
        		console.log(ex);
    		}
		}
		return pathArr;
	}
	return null;
}
function getDATA(response){
	var obj;
	if(response.status == 'success'){
		if(lineHadSave){
			DATA.pop();
			lineHadSave = false;
		}
		var i = DATA[DATA.length]?DATA.length+1:DATA.length;
		var data = response.routes[0];
		obj = {
			index:i,
			bgcolor:false,
			planIsHide:true,
			name:'自定义',
			eva:data.eva,
			label:data.label,
			reason:data.reason,
			cost:fixed2(data.cost) + '分钟',
			dis:fixed2(data.dis/1000) + '公里',
			customBtn:true,
			bestPlan:false,
		}
		postData[obj.index] = response;
		if(data.light){
			obj.trafficLight = data.light + '个红绿灯';
		if(data.left)
			obj.trafficLight +='('+ data.left + '个左转弯)';
		}
		if(data.jamnum){
			obj.trafficBlock = data.jamnum+ '段拥堵';
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
		DATA.push(obj);
		lineHadSave = true;
	}else{
		console.log('请求失败');
	}
}

//--------------------------------------------------------------------------------//
//tool methods
//选择对应的route 进行高亮
// function selectPath(index){
// 	if (_keyWayPoints[0] && _keyWayPoints[1]) {
// 		routing(_keyWayPoints, -1, false, true,index);
// 	}
// }
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
function getStyleJson() {
	var c = [],
	b = [
		[2, "", "6,6", "19,87,12,12"], //,"7,7","34,87,14,1"],//
		[3, "", "12,12", "1,62,24,24"],
		[4, "", "12,12", "26,62,24,24"],
		[5, "C3", "12,29", "0,0,24,29"],
		[6, "C3", "12,29", "25,0,24,29"],
		[7, "", "12,12", "1,100,24,24"],
		[8, "", "6,6", "4,87,12,12", "6,6", "19,87,12,12"]
	];
	function gImg(a, b, c) {
		var e = {
			src : "http://api.go2map.com/maps/images/v2.0/c31.png",
			width : 51,
			height : 156,
			pointcoord : a,
			clip : b
		};
		if (c)
			e["iconclass"] = c;
		return e;
	}
	for (var i = 0, j, k; i < b.length; i++) {
		k = b[i];
		j = {
			id : "S187" + k[0],
			img : k.length > 4 ? [gImg(k[2], k[3], k[1]), gImg(k[4], k[5], k[1])] : gImg(k[2], k[3], k[1])
		};
		c.push(j);
	}
	return c;
}
function fixed2(str){
	return parseFloat(str).toFixed(2);
}
function fitBounds(points){
	var bounds = new sogou.maps.Bounds(points[0][0].x,points[0][0].y,points[0][0].x,points[0][0].y);
	for(var i=0,len= points.length;i<len;i++){
		for(var j =0,len1=points[i].length;j<len1;j++){
			bounds.extend(points[i][j]);
		}
	}
	map&&map.fitBounds(bounds);
}
function selectPath(index){
	for(var i=0,len= ROUTE.lines.length;i<len;i++){
		if(ROUTE.lines[i]){
			for(var j=0,len1 = ROUTE.lines[i].length;j<len1;j++){
				ROUTE.lines[i][j].setStyle({"StyleStroke":{opacity:"0.3",weight:'3px'}});
			}
		}
	}
	if(index || index == 0){
		//高亮选中道路
		for(i=0,len= ROUTE.lines[index].length;i<len;i++){
			ROUTE.lines[index][i].setStyle({"StyleStroke":{opacity:"1",weight:'5px'}});
		}
		//添加对应的拖拽逻辑
		if (_keyWayPoints[0] && _keyWayPoints[1]) {
			routing(_keyWayPoints, -1, false, true,index);
		}
	}
}
//-------------------------------------------------------------------------------------//



//原始数据

/*
var drawLinePoints = [];//结合links和points处理之后的点对象


var dragArr = [];
var intObj = null;

function init(){
	//实例化地图
	var myOptions = {
		'zoom': 14,
		'center': new sogou.maps.Point(12958035.802,4828316.786),
		'mapTypeId': sogou.maps.MapTypeId.ROADMAP
	}
	map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
	if(CaseTYPE != 'dispcase')
		initDrag();
	fitBounds();
	initStartAndEnd(startPoint,'start');
	initStartAndEnd(endPoint,'end');


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
	var i = DATA[DATA.length]?DATA.length+1:DATA.length;
	var obj = {
		index:i,
		bgcolor:false,
		planIsHide:true,
		name:'自定义',
		eva:data.eva,
		label:data.label,
		reason:data.reason,
		cost:fixed2(data.cost) + '分钟',
		dis:fixed2(data.dis/1000) + '公里',
		customBtn:true,
		bestPlan:false,
	};
	postData[obj.index] = response;
	if(data.light){
		obj.trafficLight = data.light + '个红绿灯';
		if(data.left)
			obj.trafficLight +='('+ data.left + '个左转弯)';
	}
	if(data.jamnum){
		obj.trafficBlock = data.jamnum+ '段拥堵';
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

*/


//----------------------------------------------------------------------------------------------------//

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
			isBestPlan:false,//是否设置为最佳 or 取消最佳 文案显示
			bestPlanCur:'',//当前操作的item
			BestplanShow:false,//最佳框的显示隐藏

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
	},
	route:{
		data(){
			this.init();
		}
	},
	methods:{
		init(){
			map&&map.clearAll();
			LINKS = [];
			POINTS = [];
			//bounds = null;
			//drawLinePoints = [];
			routesArr = [];
			//lines = [];
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
			var url = API_ROOT  + CaseTYPE + '&caseid='+ CaseID;
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
			routes = data.routes;
			startPoint = data.routes[0].points[0];
			endPoint = data.routes[0].points[data.routes[0].points.length-1];

			//对数据进行排序整理,地图绘制数据
			//整理每一个planBox
			for(var i=0,len = data.routes.length;i<len;i++){
				LINKS.push(data.routes[i].links);
				POINTS.push(data.routes[i].points);
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
					bestPlan:data.routes[i].label == '最佳',//设为最佳
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

				var exp = new RegExp("线上方案|世纪高通|全程畅通|历史不合理|新结果");
				//console.log(exp.test(data.routes[i].name));
				if(exp.test(data.routes[i].name)){
					obj.type = data.routes[i].name.replace(/\d/,'');
				}else{
					obj.type = '老自定义';
				}
				//this.leftInfo.push(obj);
				DATA.push(obj);
			}
			//初始化地图
			//init();
			initialize();
		},
		turnPlan(index){

			for(var i=0,len=this.leftInfo.length;i<len;i++){
				this.leftInfo[i].bgcolor = false;
			}
			this.leftInfo.filter(function(item) {
				return item.index == index
			})[0].bgcolor = true;

			selectPath(index);
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
		},
		backPage(){
			history.go(-1);
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
						"taskid":+this.$route.params.taskid,
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
							if(response.data.status == "success"){
								alert('评价成功');
								//修改逻辑为重新评价
								this.isEva = true;
								//修改对应item上的label
								this.evaPlanCur.label = sead;
								//修改人工评价上的 待评价/合理/不合理
								if(this.planType == 'getevaroute'){
									this.eva = read;
								}
							}
						},(response)=>{
							alert('评价失败');
						});
				//post action=submiteva
				}else{
					this.$route.router.go({name:'login',params:{type:'mainmap',type2:CaseTYPE,id:CaseID,taskid:this.$route.params.taskid}});
				}
			}
			this.assessShow = false;
		},

		//设为最佳相关函数
		bestPlanShow(index){
			this.bestPlanCur = this.getItem(index);
			this.isBestPlan = this.bestPlanCur.bestPlan;
			this.BestplanShow = true;
		},
		bestPlanBox(bool,assessText){
			if(bool){
				this.bestPlanCur.label = this.bestPlanCur.bestPlan ?"null":"最佳";
				//上传数据
				 //this.$http.post(
				var url = API_ROOT + 'submiteva';
				// }, [options]).then(successCallback, errorCallback);
				//设为最佳 or 取消最佳
				if(sessionStorage.user){
					this.$http.post(url,{
						"status":"success",
						"taskid":+this.$route.params.taskid,
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
							if(response.data.status == "success"){
								alert('操作成功');
								this.bestPlanCur.bestPlan = !this.bestPlanCur.bestPlan;
							}
						},(response)=>{
							alert('操作失败');
						})
				}else{
					this.$route.router.go({name:'login',params:{type:'mainmap',type2:CaseTYPE,id:CaseID,taskid:this.$route.params.taskid}});
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
								lineHadSave = false;
								this.getItem(index).customBtn = false;
								this.getItem(index).type = '老自定义';
							}else if(response.data.detail == 'Error:route name is already exist.'){
								alert('名称重复，保存失败');
							}else{
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
		},
		//删除
		delPlan(index){

			if(sessionStorage.user){
				var that = this;
				//发送请求
				var name = this.getItem(index).name;
				var url = API_ROOT + 'delroute&caseid=' + this.caseid + '&name=' + name +'&user=' + sessionStorage.user;
				this.$http.get(url).then((response)=>{
					if(response.data.status == 'success'){
					//删除左侧框
					that.leftInfo.filter(function(item,i){
						if(item.index == index){
							that.leftInfo.splice(i, 1);
						}
					});
					//删除地图区线路
					//lines[index]
					if(ROUTE.lines[index]){
						for(var i=0,len=ROUTE.lines[index].length;i<len;i++){
							ROUTE.lines[index][i].setMap(null);
						}
						ROUTE.splice(index,1);
					}
					}else{
						alert('删除失败！');
					}
				},(response)=>{
					alert('请求失败!');
				})
			}else{
				this.$route.router.go({name:'login',params:{type:'mainmap',type2:CaseTYPE,id:CaseID,taskid:this.$route.params.taskid}});
			}
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
	.returnBtn{
		color:blue;
		cursor: pointer;
	}
	[v-cloak] {
  		display: none;
	}
</style>