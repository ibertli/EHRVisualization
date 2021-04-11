var width, height, ratio,
    scene, camera, cameraControls, renderer, carPos, TboxCarPos, searchPose,
    car_veyron,
    centerLng, centerLat,
    lineArr = [], geometryArr = [], positionArr = [],
    longitudeArr = [], latitudeArr = [],
    CamLeftlongitudeArr = [], CamLeftlatitudeArr = [],
    CamRightlongitudeArr = [], CamRightlatitudeArr = [],

    EQUATORHALF = 20037508.3427892,
    tileSize = 100,
    R_Earth = 6378137,
    dom = document.getElementById("container"),
    myChart = echarts.init(dom);
option = null;
// option对象定义了仪表盘的相关参数
option = {
  backgroundColor: '#000',
  tooltip: {
    formatter: '{a} <br/>{c} {b}'
  },
  toolbox: {
    show: false,
    feature: {
      mark: {show: true},
      restore: {show: true},
      saveAsImage: {show: true}
    }
  },
  series: [
    {
      name: '速度',
      type: 'gauge',
      min: 0,
      max: 220,
      splitNumber: 11,
      radius: '100%',
      // center:['50%',110],
      axisLine: {            // 坐标轴线
        lineStyle: {       // 属性lineStyle控制线条样式
          color: [[0.09, 'lime'], [0.82, '#1e90ff'], [1, '#ff4500']],
          width: 2,
            // shadowColor: '#fff', //默认透明
            // shadowBlur: 10
          }
      },
      axisLabel: {            // 坐标轴小标记
        fontWeight: 'bolder',
        color: '#fff',
        // shadowColor: '#fff', //默认透明
        // shadowBlur: 10
      },
      axisTick: {            // 坐标轴小标记
        length: 10,        // 属性length控制线长
        lineStyle: {       // 属性lineStyle控制线条样式
          color: 'auto',
          // shadowColor: '#fff', //默认透明
          // shadowBlur: 10
        }
      },
      splitLine: {           // 分隔线
        length: 15,         // 属性length控制线长
        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
          width: 3,
          color: '#fff',
          // shadowColor: '#fff', //默认透明
          // shadowBlur: 10
        }
      },
      pointer: {           // 分隔线
        shadowColor: '#fff', //默认透明
        shadowBlur: 5
      },
      title: {
        offsetCenter: [0, '-35%'], 
        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
          fontWeight: 'bolder',
          fontSize: 20,
          fontStyle: 'italic',
          color: '#fff',
          // shadowColor: '#fff', //默认透明
          // shadowBlur: 10
        }
      },
      detail: {
        backgroundColor: 'rgba(30,144,255,0.8)',
        borderWidth: 1,
        borderColor: '#fff',
        // shadowColor: '#fff', //默认透明
        // shadowBlur: 5,
        offsetCenter: [0, '75%'],       // x, y，单位px
        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
          fontWeight: 'bolder',
          color: '#fff',
          fontSize: 20,
        }
      },
      data: [{value: 40, name: 'km/h'}]
    }
  ]
};


function lonLat2WebMercator (lng, lat) {
  var x = (lng / 180.0) * EQUATORHALF, y;
  if(lat == 0){
    y = 0;
  }else{
    if (lat > 85.05112877980659) {
      lat = 85.05112877980659;
    }
    if (lat < -85.05112877980659) {
      lat = -85.05112877980659;
    }
    var tmp = Math.PI / 4.0 + (Math.PI / 2.0) * lat / 180.0,
        y = EQUATORHALF * Math.log(Math.tan(tmp)) / Math.PI;
  }
  var result = {
    x: x,
    y: y
  };
  return result;
}

function webMercator2TileimageInfo (x, y, level){
  y = EQUATORHALF - y;
  x = EQUATORHALF + x;
  var size = Math.pow(2, level) * 256,
      imgx = x * size / (EQUATORHALF * 2),
      imgy = y * size / (EQUATORHALF * 2),
      col = Math.floor(imgx / 256),
      row = Math.floor(imgy / 256),
      imgdx = imgx % 256,
      imgdy = imgy % 256,
      position = {
        x : imgx,
        y : imgy
      },
      tileinfo = {
        x : col,
        y : row,
        level : level
      },
      offset = {
        x : imgdx,
        y : imgdy
      },
      result = {
        position : position,
        tileinfo : tileinfo,
        offset : offset
      };
  return result;
}

// (116.2739020, 40.1179500, 18) --> ({x: 42.84280888969079, y: 46.1864803408389})
function lonLat2WebGL(lng, lat, level) {
  var webMercator = lonLat2WebMercator(lng, lat),
      tilePos = webMercator2TileimageInfo(webMercator.x, webMercator.y, level).position,
      centerWM = lonLat2WebMercator(centerLng, centerLat),
      centerTP = webMercator2TileimageInfo(centerWM.x,centerWM.y, level),
      x = (tilePos.x - centerTP.position.x + (centerTP.offset.x - 256/2) )*tileSize/256,
      y = (tilePos.y - centerTP.position.y + (-centerTP.offset.y + 256/2))*tileSize/256,
      result = {
        x: -x,
        y: y
      };
  return result;
}

function init() {
  var div = document.getElementById("main"), fov = 70;
  width = window.innerWidth;
  height = window.innerHeight;
  ratio = width / height;
  car_veyron = {
    name: "Bugatti Veyron",
    url: "models/veyron/VeyronNoUv_bin.js",
    init_rotation: [1.57, -1.57, 0],
    scale: 0.01,
    mmap: {
      0: new THREE.MeshLambertMaterial({
        color: 0x909090
      }),
      1: new THREE.MeshLambertMaterial({
        color: 0x808080
      }), 
      2: new THREE.MeshLambertMaterial({
        color: 0x909090,
        combine: THREE.MultiplyOperation
      }), 
      3: new THREE.MeshLambertMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
      }), 
      4: new THREE.MeshLambertMaterial({
        color: 0xffffff
      }), 
      5: new THREE.MeshLambertMaterial({
        color: 0xff0000
      }), 
      6: new THREE.MeshLambertMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true
      }), 
      7: new THREE.MeshLambertMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true
      }) 
    }
  };
  scene = new THREE.Scene();
  var ambient = new THREE.AmbientLight(0x050505);
  scene.add(ambient);
  var directionalLight = new THREE.DirectionalLight(0x0f0f0f, 2);
  directionalLight.position.set(2, 1.2, 1000).normalize();
  scene.add(directionalLight);
  var pointLight = new THREE.PointLight(0x808080, 2);
  pointLight.position.set(20, 12, 10000);
  scene.add(pointLight);
  camera = new THREE.PerspectiveCamera(fov, ratio, 0.1, 150000000);
  camera.position.set(0, 4000, -100);
  camera.lookAt(scene.position);
  renderer = new THREE.WebGLRenderer({
    antialias: true 
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000);
  cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.enablePan = true;
  cameraControls.enableRotate = true;
  cameraControls.zoomSpeed = 2.0;
  cameraControls.panSpeed = 2.0;
  cameraControls.rotateSpeed = 1.0;
  cameraControls.maxDistance = 2000000;
  cameraControls.minDistance = 1000;
  cameraControls.update();

  for (var i = 0; i < 52; i++) {
    positionArr[i] = new Float32Array(200*3);
    geometryArr[i] = new THREE.BufferGeometry();
    geometryArr[i].addAttribute( 'position', new THREE.BufferAttribute( positionArr[i], 3 ) );
    
    // 三种颜色来区分不同的车道，红：d43c43, 黄：ffff00, 蓝：13227a
    if( i < 10 ){
        lineArr[i] = new THREE.Line( geometryArr[i], new THREE.LineDashedMaterial({color:0xffffff,linewidth:1,dashSize:0.4,gapSize:0.6}));
    }else if( i >= 10 && i < 20 ){
        lineArr[i] = new THREE.Line( geometryArr[i], new THREE.LineDashedMaterial({color:0xffffff,linewidth:1,dashSize:0.4,gapSize:0.6}));
    }else if( i >= 20 && i < 30 ){
        lineArr[i] = new THREE.Line( geometryArr[i], new THREE.LineDashedMaterial({color:0xffffff,linewidth:1,dashSize:0.4,gapSize:0.6}));
    }else if( i >= 30 && i < 40 ){
        lineArr[i] = new THREE.Line( geometryArr[i], new THREE.LineDashedMaterial({color:0xffffff,linewidth:1,dashSize:0.4,gapSize:0.6}));
    }else{
        lineArr[i] = new THREE.Line( geometryArr[i], new THREE.LineDashedMaterial({color:0xffffff,linewidth:1,dashSize:0.4,gapSize:0.6}));
    }
    lineArr[i].frustumCulled = false;
    scene.add( lineArr[i] );
  }
  div.appendChild(renderer.domElement);
  var render = function() {
    cameraControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  render();
}

var laneModel_Id = -1, count = 0, drawCount = 0;
var  arrayLaneModel_Id = [0,0,0,0,0];
var color_map = ["0xff0000", "0x00ff00","0x0000ff","0xff00ff","0x00ffff"];
function laneDraw() {
  //
  var doc = document;
  if("WebSocket" in window){
    console.log("您的浏览器支持websocket");
    var ws = new WebSocket('ws://localhost:8100/echo');
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      console.log('连接已建立');
    };
    ws.onerror = e => {
      console.log(e);
    };
    ws.onmessage = e => {
      var buf = new Uint8Array(e.data);
      protobuf.load("js/lmu_location.proto", function(err, root){
        if(err){
          throw err;
        }
        var messageFile = root.lookupType("lmu.location.Message");
        var message = messageFile.decode(buf);
        if(message.type == 0){
          //发送localmapData数据
          var data = message.localmapData;

          var map_count = 0;
          for(var i=0;i<5;i++) {
            if (data.instanceId == arrayLaneModel_Id[i]) {
              map_count = 0;
              break;
            } else {
              map_count = 1;
            }
          }
          if(map_count == 1) {
            arrayLaneModel_Id[0] = arrayLaneModel_Id[1];
            arrayLaneModel_Id[1] = arrayLaneModel_Id[2];
            arrayLaneModel_Id[2] = arrayLaneModel_Id[3];
            arrayLaneModel_Id[3] = arrayLaneModel_Id[4];
            arrayLaneModel_Id[4] = data.instanceId;
          }
          console.log(arrayLaneModel_Id);
          if(map_count == 0) {
            //路径id相同，不做处理

          }else {
            doc.getElementsByClassName("MapRecStatus")[0].innerHTML = data.mapValid;
            doc.getElementsByClassName("InstanceId")[0].innerHTML = data.instanceId;
            doc.getElementsByClassName("TotalLane")[0].innerHTML = data.totalLaneNum;
            doc.getElementsByClassName("lane_offset")[0].innerHTML = data.laneOffset;
            doc.getElementsByClassName("lane_endoffset")[0].innerHTML = data.laneEndoffset;
            doc.getElementsByClassName("FunctionalRoadClass")[0].innerHTML = data.functionalRoadClass;
            doc.getElementsByClassName("FormOfWay")[0].innerHTML = data.formOfWay;
            doc.getElementsByClassName("Tunnel")[0].innerHTML = data.tunnel;
            doc.getElementsByClassName("SpecialSituation")[0].innerHTML = data.specialSituation;
  
            // laneModel_Id = data.instanceId;

            for (var i = 0; i < 2000; i++) {
              var pointLoc = 2000*count+i;
              if (data.lineLon[i] == 0) {
                longitudeArr[pointLoc] = 0;
                latitudeArr[pointLoc] = 0;
              }else{
                var longLat = lonLat2WebGL( data.lineLon[i], data.lineLat[i], 18 );
                longitudeArr[pointLoc] = longLat.x;
                latitudeArr[pointLoc] = longLat.y;
              }
            }

            for (var i = 0; i < 2000; i = i+200){
              var temp = parseInt( i / 200) + count*10,
                  temp2 = temp-10*count;

              for (var j = i; j < i + data.linePointNum[temp2]; j++) {
                var k = j - i;
                var X = longitudeArr[2000*count+j];
                var Y = latitudeArr[2000*count+j];
                var Z = 0;
                positionArr[temp][k*3+0] = X;
                positionArr[temp][k*3+1] = Y;
                positionArr[temp][k*3+2] = Z;
              }

              lineArr[temp].geometry.setDrawRange( 0, data.linePointNum[temp2] );
              lineArr[temp].geometry.verticesNeedUpdate = true;
              lineArr[temp].geometry.attributes.position.needsUpdate = true; 
              lineArr[temp].computeLineDistances();

              switch(data.lineType[temp2]){
                // '2' 表示当前是 LaneMarking
                case 2:
                  switch(data.lineMarking[temp2]){
                    // '1' 表示 ‘单实线’
                    case 1:
                    case 4:
                    case 6:
                    case 7:
                      lineArr[temp].material.gapSize = 0;
                      // switch(data.lineColor[temp2]){
                      //   // '1' 表示 '白色'
                      //   case 1:
                      //     lineArr[temp].material.color.setHex('0xffffff');
                      //     break;
                      //   // '2' 表示 '黄色'
                      //   case 2:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     break;
                      //   // '3' 表示 '橙色'
                      //   case 3:
                      //     lineArr[temp].material.color.setHex('0xffa500');
                      //     break;
                      //   // '4' 表示 '蓝色'
                      //   case 4:
                      //     lineArr[temp].material.color.setHex('0x0000ff');
                      //     break;
                      //   // '5' 表示 '绿色'
                      //   case 5:
                      //     lineArr[temp].material.color.setHex('0x008000');
                      //     break;
                      //   // '6' 表示 '灰色'
                      //   case 6:
                      //     lineArr[temp].material.color.setHex('0x808080');
                      //     break;
                      //   // 此处 default随便给的颜色
                      //   default:
                      //     lineArr[temp].material.color.setHex('0x808080');
                      //     break;
                      // }
                    break;

                    // '2' 表示 '单虚线'
                    case 2:
                    case 5:
                      lineArr[temp].material.dashSize = 0.4;
                      lineArr[temp].material.gapSize = 0.4;
                      // switch(data.lineColor[temp2]){
                      //   case 1:
                      //     lineArr[temp].material.color.setHex('0xffffff');
                      //     break;
                      //   case 2:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     break;
                      //   case 3:
                      //     lineArr[temp].material.color.setHex('0xffa500');
                      //     break;
                      //   case 4:
                      //     lineArr[temp].material.color.setHex('0x0000ff');
                      //     break;
                      //   case 5:
                      //     lineArr[temp].material.color.setHex('0x008000');
                      //     break;
                      //   case 6:
                      //     lineArr[temp].material.color.setHex('0x808080');
                      //     break;
                      //   // 此处 default随便给的颜色
                      //   default:
                      //     lineArr[temp].material.color.setHex('0x808080');
                      //     break;
                      // }
                    break;

                    // '3' 表示 '短虚线'
                    case 3:
                      lineArr[temp].material.dashSize = 1.2;
                      lineArr[temp].material.gapSize = 1.8;
                      // switch(data.lineColor[temp2]){
                      //   case 1:
                      //     lineArr[temp].material.color.setHex('0xffffff');
                      //     break;
                      //   case 2:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     break;
                      //   case 3:
                      //     lineArr[temp].material.color.setHex('0xffa500');
                      //     break;
                      //   case 4:
                      //     lineArr[temp].material.color.setHex('0x0000ff');
                      //     break;
                      //   case 5:
                      //     lineArr[temp].material.color.setHex('0x008000');
                      //     break;
                      //   case 6:
                      //     lineArr[temp].material.color.setHex('0x808080');
                      //     break;
                      //   // 此处 default随便给的颜色
                      //   default:
                      //     lineArr[temp].material.color.setHex('0x808080');
                      //     break;
                      // }
                    break;

                    // '4' 表示 '双实线', 将之后的先改为'单实线'

                    case 4:
                      lineArr[temp].material.gapSize = 0;
                      var TempGeometry1 = lineArr[temp].geometry.clone;
                      TempGeometry1.translate(0.5,0,0);
                      var TempLine1 = new THREE.Line( TempGeometry1, new THREE.LineBasicMaterial({linewidth:1}) );
                      scene.add(TempLine1);
                      // switch(data.lineColor[temp2]){
                      //   case 7:
                      //     lineArr[temp].material.color.setHex('0xffffff');
                      //     TempLine1.material.color.setHex('0xffff00');
                      //     break;
                      //   case 8:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     TempLine1.material.color.setHex('0xffffff');
                      //     break;
                      //   // 此处 default随便给的颜色
                      //   default:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     TempLine1.material.color.setHex('0xffffff');
                      //     break;
                      // }
                    break;

                    // '5' 表示 '双虚线'
                    case 5:
                      var TempGeometry2 = lineArr[temp].geometry.clone;
                      TempGeometry2.translate(0.5,0,0);
                      var TempLine2 = new THREE.Line( TempGeometry2, new THREE.LineDashedMaterial({linewidth:1,dashSize:0.4,gapSize:0.6}) );
                      TempLine2.computeLineDistances();
                      scene.add(TempLine2);
                      // switch(data.lineColor[temp2]){
                      //   case 7:
                      //     lineArr[temp].material.color.setHex('0xffffff');
                      //     TempLine2.material.color.setHex('0xffff00');
                      //     break;
                      //   case 8:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     TempLine2.material.color.setHex('0xffffff');
                      //     break;
                      //   // 此处 default随便给的颜色
                      //   default:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     TempLine2.material.color.setHex('0xffffff');
                      //     break;
                      // }
                    break;

                    // '6' 表示 '左实右虚'
                    case 6:
                      lineArr[temp].material.gapSize = 0;
                      var TempGeometry3 = lineArr[temp].geometry.clone;
                      TempGeometry3.translate(0.5,0,0);
                      var TempLine3 = new THREE.Line( TempGeometry3, new THREE.LineDashedMaterial({linewidth:1,dashSize:0.4,gapSize:0.6}) );
                      TempLine3.computeLineDistances();
                      scene.add(TempLine3);
                      // switch(data.lineColor[temp2]){
                      //   case 7:
                      //     lineArr[temp].material.color.setHex('0xffffff');
                      //     TempLine3.material.color.setHex('0xffff00');
                      //     break;
                      //   case 8:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     TempLine3.material.color.setHex('0xffffff');
                      //     break;
                      //   // 此处 default随便给的颜色
                      //   default:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     TempLine3.material.color.setHex('0xffffff');
                      //     break;
                      // }
                    break;

                    // '7' 表示 '右实左虚'
                    case 7:
                      lineArr[temp].material.gapSize = 0;
                      var TempGeometry4 = lineArr[temp].geometry.clone;
                      TempGeometry4.translate(-0.5,0,0);
                      var TempLine4 = new THREE.Line( TempGeometry4, new THREE.LineDashedMaterial({linewidth:1,dashSize:0.4,gapSize:0.6}) );
                      TempLine4.computeLineDistances();
                      scene.add(TempLine4);
                      // switch(data.lineColor[temp2]){
                      //   case 7:
                      //     lineArr[temp].material.color.setHex('0xffffff');
                      //     TempLine4.material.color.setHex('0xffff00');
                      //     break;
                      //   case 8:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     TempLine4.material.color.setHex('0xffffff');
                      //     break;
                      //   // 此处 default随便给的颜色
                      //   default:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     TempLine4.material.color.setHex('0xffffff');
                      //     break;
                      // }
                    break;
                    default:
                      // 此处改为单实线
                      lineArr[temp].material.gapSize = 0;
                      // switch(data.lineColor[temp2]){
                      //   // '1' 表示 '白色'
                      //   case 1:
                      //     lineArr[temp].material.color.setHex('0xffffff');
                      //     break;
                      //   // '2' 表示 '黄色'
                      //   case 2:
                      //     lineArr[temp].material.color.setHex('0xffff00');
                      //     break;
                      //   // '3' 表示 '橙色'
                      //   case 3:
                      //     lineArr[temp].material.color.setHex('0xffa500');
                      //     break;
                      //   // '4' 表示 '蓝色'
                      //   case 4:
                      //     lineArr[temp].material.color.setHex('0x0000ff');
                      //     break;
                      //   // '5' 表示 '绿色'
                      //   case 5:
                      //     lineArr[temp].material.color.setHex('0x008000');
                      //     break;
                      //   // '6' 表示 '灰色'
                      //   case 6:
                      //     lineArr[temp].material.color.setHex('0x808080');
                      //     break;
                      //   // 此处 default随便给的颜色
                      //   default:
                      //     lineArr[temp].material.color.setHex('0x808080');
                      //     break;
                      // }
                      break;
                  }
                break;
              
                // '99' , 'default' 表示当前是 Other, 目前是自定义的：加宽，颜色随机
                default:
                  lineArr[temp].material.gapSize = 0;
                  lineArr[temp].material.linewidth = 2;
                  lineArr[temp].material.color.setHex(color_map[count]);
                break;
                
                // 'lineType' 数组内的其他值
                // default:
                //   console.log('lineType数组定义有问题');
                //   break;
              } // switch 结束
            }   // for 循环结束

            count++;
            if (count == 5) {
              count = 0;
            }
          }
        }else if (message.type == 1) {
          //发送locoutputData数据
          var LocData = message.locoutputData;
          var TboxData = LocData.tboxData;
          var PositionData = LocData.locGnssData;
          var GroundTruthData = LocData.grdthData;
          var CameraMessage = message.camData;

          doc.getElementsByClassName("PosSize")[0].innerHTML = LocData.posSize;
          doc.getElementsByClassName("pos_pathid1")[0].innerHTML = LocData.posPathid[0];
          doc.getElementsByClassName("pos_pathid2")[0].innerHTML = LocData.posPathid[1];
          doc.getElementsByClassName("pos_pathid3")[0].innerHTML = LocData.posPathid[2];
	        doc.getElementsByClassName("pos_pathid4")[0].innerHTML = LocData.posPathid[3];


          doc.getElementsByClassName("pos_offset1")[0].innerHTML = LocData.posOffset[0];
          doc.getElementsByClassName("pos_offset2")[0].innerHTML = LocData.posOffset[1];
          doc.getElementsByClassName("pos_offset3")[0].innerHTML = LocData.posOffset[2];
	        doc.getElementsByClassName("pos_offset4")[0].innerHTML = LocData.posOffset[3];




          doc.getElementsByClassName("TboxLon")[0].innerHTML = TboxData.lon02.toFixed(6);
          doc.getElementsByClassName("TboxLat")[0].innerHTML = TboxData.lat02.toFixed(6);
          doc.getElementsByClassName("TboxHeading")[0].innerHTML = TboxData.course.toFixed(2);
          doc.getElementsByClassName("TboxStatus")[0].innerHTML = TboxData.rtkQuality + ', ' + TboxData.qdrCalibrate;

          doc.getElementsByClassName("PositionLon")[0].innerHTML = PositionData.lon02.toFixed(6);
          doc.getElementsByClassName("PositionLat")[0].innerHTML = PositionData.lat02.toFixed(6);
          doc.getElementsByClassName("PositionHeading")[0].innerHTML = PositionData.course.toFixed(2);
          doc.getElementsByClassName("PositionStatus")[0].innerHTML = LocData.locState;

          doc.getElementsByClassName("GroundLon")[0].innerHTML = GroundTruthData.lon02.toFixed(6);
          doc.getElementsByClassName("GroundLat")[0].innerHTML = GroundTruthData.lat02.toFixed(6);
          doc.getElementsByClassName("GroundHeading")[0].innerHTML = GroundTruthData.course.toFixed(2);
          doc.getElementsByClassName("GroundStatus")[0].innerHTML = GroundTruthData.posFlag + ', ' + GroundTruthData.courseFlag;



          doc.getElementsByClassName("time-display")[0].innerHTML =  PositionData.year+"-"+PositionData.month+"-"+PositionData.day+'\xa0\xa0'+PositionData.hour+":"+PositionData.minute+":"+PositionData.second;
          // doc.getElementsByClassName("RTKStatus")[0].innerHTML = TboxData.rtkQuality;
          doc.getElementsByClassName("LocPathID")[0].innerHTML = LocData.pathId;
          doc.getElementsByClassName("LocLaneID")[0].innerHTML = LocData.currentLane;
          // doc.getElementsByClassName("LocStatus")[0].innerHTML = LocData.locState;
          doc.getElementsByClassName("PathDetcMode")[0].innerHTML = LocData.pathDetectionMode;
          doc.getElementsByClassName("LaneDetcMode")[0].innerHTML = LocData.laneDetectionMode;
          doc.getElementsByClassName("MapMatchMode")[0].innerHTML = LocData.mapMatchingMode;
          option.series[0].data[0].value = PositionData.speed.toFixed(2);

          doc.getElementsByClassName("LeftQuality")[1].innerHTML = CameraMessage.LeftQuality;
          doc.getElementsByClassName("RightQuality")[1].innerHTML = CameraMessage.RightQuality;


          
          // console.log("LocData",LocData);
          myChart.setOption(option);
          if (option && typeof option === "object") {
            myChart.setOption(option, true);
          }
          var angle1 = TboxData.course;
          var angle2 = PositionData.course;
          doc.getElementsByClassName("pointer1")[0].style.transform = 'rotate('+angle1+'deg)';
          doc.getElementsByClassName("pointer2")[0].style.transform = 'rotate('+angle2+'deg)';

          var particlePosition = lonLat2WebGL( PositionData.lon02, PositionData.lat02, 18 );
          var TboxPosition = lonLat2WebGL(TboxData.lon02, TboxData.lat02, 18);
          var GroundTruthPosition = lonLat2WebGL(GroundTruthData.lon02, GroundTruthData.lat02, 18);
          var x = particlePosition.x;
          var y = particlePosition.y;
          carPos.position.x = x;
          carPos.position.y = y;
          carPos.rotation.y = -PositionData.course / 180.0 * Math.PI;
          TboxCarPos.position.x = TboxPosition.x;
          TboxCarPos.position.y = TboxPosition.y;
          GroudCarPos.position.x = GroundTruthPosition.x;
          GroudCarPos.position.y = GroundTruthPosition.y;

          searchPose[drawCount].position.x = carPos.position.x;
          searchPose[drawCount].position.y = carPos.position.y;
          searchPose[drawCount].position.z = carPos.position.z;

          drawCount++;
          if (drawCount > 19) {
            drawCount = 0;
          }
        }else if (message.type == 2) {
          // get Camera info
          var camData = message.camData;
          for (var i = 0; i < 5; i++) {
            if (camData.CamLeftLineLon[i] == 0) {
              CamLeftlongitudeArr[i] = 0;
              CamLeftlatitudeArr[i] = 0;
            }else{
              var CamLeftlongLat = lonLat2WebGL( camData.CamLeftLineLon[i], camData.CamLeftLineLat[i], 18 );
              CamLeftlongitudeArr[i] = CamLeftlongLat.x;
              CamLeftlatitudeArr[i] = CamLeftlongLat.y;
            }

            if (camData.CamRightLineLon[i] == 0) {
              CamRightlongitudeArr[i] = 0;
              CamRightlatitudeArr[i] = 0;
            }else{
              var CamRightlongLat = lonLat2WebGL( camData.CamLeftLineLon[i], camData.CamLeftLineLat[i], 18 );
              CamRightlongitudeArr[i] = CamRightlongLat.x;
              CamRightlatitudeArr[i] = CamRightlongLat.y;
            }
          }

          for (var i = 0; i < 5; i++) {
            positionArr[50][i*3+0] = CamLeftlongitudeArr[i];
            positionArr[50][i*3+1] = CamLeftlatitudeArr[i];
            positionArr[50][i*3+2] = 0;
            positionArr[51][i*3+0] = CamRightlongitudeArr[i];
            positionArr[51][i*3+1] = CamRightlatitudeArr[i];
            positionArr[51][i*3+2] = 0;
          }

          lineArr[50].geometry.setDrawRange( 0, 5 );
          lineArr[50].geometry.verticesNeedUpdate = true;
          lineArr[50].geometry.attributes.position.needsUpdate = true; 
          lineArr[50].computeLineDistances();

          lineArr[51].geometry.setDrawRange( 0, 5 );
          lineArr[51].geometry.verticesNeedUpdate = true;
          lineArr[51].geometry.attributes.position.needsUpdate = true; 
          lineArr[51].computeLineDistances();
        }

      });
    }; // onmessage
    ws.onclose = () => {
      console.log('连接已断开');
    };

  }else{
    console.log("您的浏览器不支持");
  }
  //
}

function onWindowResize() {
    height = window.innerHeight;
    width = window.innerWidth;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
window.addEventListener('resize', onWindowResize, false);

function markCurrentPosition(x, y) {
    var loader = new THREE.BinaryLoader();
    loader.load(car_veyron.url, function(geometry) {
      geometry.sortFacesByMaterialIndex();
      var m = [];
      for (var i in car_veyron.mmap) {
        m[i] = car_veyron.mmap[i];
      }
      carPos = new THREE.Mesh(geometry, m);
      carPos.rotation.x = car_veyron.init_rotation[0];
      carPos.rotation.y = car_veyron.init_rotation[1];
      carPos.rotation.z = car_veyron.init_rotation[2];
      carPos.position.x = x;
      carPos.position.y = y;
      carPos.position.z = 1;
      carPos.scale.x = carPos.scale.y = carPos.scale.z = car_veyron.scale;
      
      scene.add(carPos);
      camera.position.set(0, 1500, -1);
      carPos.add(camera);
      
      var geometryTbox = new THREE.SphereGeometry(0.3, 30, 30);
      var materialTbox = new THREE.MeshBasicMaterial({
        color: '#0023ff'
      });
      TboxCarPos = new THREE.Mesh(geometryTbox, materialTbox);
      TboxCarPos.position.x = x;
      TboxCarPos.position.y = y;
      TboxCarPos.position.z = 1;

      var geometryGroud = new THREE.SphereGeometry(0.5, 30, 30);
      var materialGroud = new THREE.MeshBasicMaterial({
        // 黄色
        color: '#ffa500'
      });
      GroudCarPos = new THREE.Mesh(geometryGroud, materialGroud);
      GroudCarPos.position.x = x;
      GroudCarPos.position.y = y;
      GroudCarPos.position.z = 1;

      scene.add(TboxCarPos);
      scene.add(GroudCarPos);
    });  
}

function markSearchPose(x, y) {
  searchPose = Array();
  for (var i = 0; i < 20; i++) {
    var geometry = new THREE.SphereGeometry(0.3, 30, 30);
    var material = new THREE.MeshBasicMaterial({
      // 绿色
      color: '#00ff00'
    });
    searchPose[i] = new THREE.Mesh(geometry, material);
    searchPose[i].position.x = x + i * 2;
    searchPose[i].position.y = y + 10;
    searchPose[i].position.z = 1;
    scene.add(searchPose[i]);
  }
}
function main() {
    centerLng = 116.2739020;
    centerLat = 40.1179500;
    var currentWebGLPos = [centerLng, centerLat];
    markCurrentPosition(currentWebGLPos[0], currentWebGLPos[1]);
    markSearchPose(currentWebGLPos[0], currentWebGLPos[1]);
    laneDraw();
}
init();
main();