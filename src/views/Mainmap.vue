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
var CaseID;
var dragArr = [];
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
        	if(map.dgObject){
        		map.dgObject.addTarget(p);
        	}
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

function initDrag(){
	if(!wp){
		map.dgObject = new Waypoints();
	}
	dragArr.push(startPoint);
	
	sogou.maps.SEvent.addListener(map.dgObject,'draging',draging);
	sogou.maps.SEvent.addListener(map.dgObject,'dragend',dragend);
}

var ol=null,
start,
end,
dl=0,
max=0,
isMove=false,
st=null,
stime,
speed=400,
isFirst=1,
isdraging=0;
function draging(a,b,c){
	//var bs=toArr(b),tn;
	var tn;
	if(!st)st=Date.now();
	var dt=Date.now();
 	if(dt-st<=speed&&!isFirst)return;
 	else{
 		st=dt;
 		isMove=true;
 		isFirst=0;
 		var dra = new sogou.maps.Point(a.point.x,a.point.y);
 		console.log(a.tar);
 		dragArr.push(dra);
 	};
 		// if(isdraging==0){
 		//     ol=null;
 		// 	stime=now();
 		// 	isdraging=1;
 		// 	dl=0;
 		// 	for(var i=0;i<b.length;i++){

 		// 	}
 			//action=&caseid=xxx&points=x1,y1;x2,y2;x3,y3


 			//求路
 			//拖拽之后
// 			for(var i=0;i<bs.length;i++){
// 			    tn=bs[i]._node
// 				while(tn.parentNode){
//                     tn=tn.parentNode;
//                 }
// 				if(i==0){
// 					start=tn.start;
// 				}
// 				if(i==bs.length-1){
// 					end=tn.end;
// 				}
// 				dl+=tn.attributes.distance;
//                 if(tn&&tn.childNodes)
//                     forArray(tn.childNodes,function(f){
//                         me.map.removeFeature(f.fn);
//                     });
// 			}
//             clearAllViaFn();
// 			if(c!="from"&&c!="to"&&(!b.length||b.length<2))ol=tn;
// 		}
// 		var cwp=a,dra = new Point(a.point.x,a.point.y);
//         me.host.mode = 2;
// 		if(c=="from") {
//             me.host.from.coord = a.point;
//             me.host.from.type = "coord";
//             start = a.point;
//         }else if(c=="to") {
//             me.host.to.coord = a.point;
//             me.host.to.type = "coord";
//             end = a.point;
//         }else if(c && c.indexOf("via")>-1){
//             var idx = parseInt(c.split("|")[1]);
//             me.host.wayPoint[idx-1].coord = a.point;
//             me.host.wayPoint[idx-1].type = "coord";
//         }
// 		if(c=="from"||c=="to") {
//             a=null;
//         }else if(c && c.indexOf("via")>-1){
//            me.host.dragObject["point"] = a.point;
//         }else{
//             var idxArr = getWayNodesIndex(bs[0]);  //[route index,way node idx] 0:线路的idx 1：当前前拖拽点应为的idx
//             if(a.tar && (a.tar.idx || a.tar.idx == 0)) {    //如果拖动本身是拖动点，处理拖动类型。 逻辑有点乱，可以优化。
//                 me.host.dragObject.idx = idxArr[1];    //拖拽点得索引
//                 me.host.dragObject.rId = idxArr[0];     //道路的索引
//                 me.host.dragObject["point"] =  me.host.dragPoint[idxArr[0]][idxArr[1]];
//             }
//             if(!me.host.dragObject["point"]) {      //如果产生的是新的拖拽点，就添加到拖拽对象中。
//                  me.host.dragPoint[idxArr[0]].splice(idxArr[1],0,dra);
//                  me.host.dragObject.idx =  idxArr[1];
//                  me.host.dragObject.rId = idxArr[0];
// //                me.host.dragPoint.push(dra);
//             }else{
//                me.host.dragPoint[idxArr[0]][me.host.dragObject.idx] = dra;   //更新新的拖动对象。
//             }
//             me.host.dragObject["point"] = dra;
//         }
//         var url = me.host.getDragReqUrl(start,end);
// 		function _cb_(a1){
// 			if(!isMove) return;
// 			var pn=null,fn,m;
//             m = cwp.tar;
//             cwp.tar.setTitle(a1.response.Waypoints.Waypoint[1].caption+"("+(me.result.distance-dl+a1.response.distance)/1000+"公里)");
// 			pn=FeatureNode.loadFromJson(a1.response.Route.Feature);
// 			fn=gf("dragLine_Temp");
// 			if(fn){
//                 me.map.removeFeature(fn);
// 			}
//             pn.style.id="L50";
// 			pn.id="dragLine_Temp";
// 			me.map.addFeature(pn);
// 		};
// 		scs.send(null,url,_cb_,true,function(a,b){_cb_("",a,b)});
}
function getPoints(){
	var strArr = [];
	for(var i=0,len = dragArr.length;i<len;i++){
		strArr.push(dragArr[i].x + ',' + dragArr[i].y);
	}
	return strArr.join(';');
}
function dragend(a,b,c){
	dragArr.push(endPoint);
	var url = API_ROOT + 'getroute' + '&caseid=' + CaseID + '&points=' + getPoints();
	console.log(url);
	//action=&caseid=xxx&points=x1,y1;x2,y2;x3,y3;
}










/**
*过滤限定了显示级别的点，只有显示级别低于等于当前缩放级别的点才被记录下来
*@param a Array[Point]	所有的点坐标 [Point]
*@param b Array[Number]   所有的点对应的显示级别 [Number]
*@param c Number	当前的缩放级别
*@return Array[Point] 符合当前缩放级别下显示的点
*/
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

module.exports = {
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
				if(that.leftInfo.length)
				that.turnPlan(0);
			},2000);
		}
	},
	methods:{
		getData(){
			CaseID = this.$route.params.id;
			var url = API_ROOT  + this.$route.params.type + '&caseid='+ this.$route.params.id;
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
					var url = API_ROOT + 'submiteva';

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
				var url = API_ROOT + 'submiteva';
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