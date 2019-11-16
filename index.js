
/**
 * id를 이용해 id에 해당되는 html element를 가지고옵니다.
 */
const searchForm = document.getElementById("searchForm");
const input = document.getElementById("searchText");
const temp = document.getElementById("temp");
const city = document.getElementById("city");
const image = document.getElementById("image");

// 도시 이름을 입력하고, Enter키를 누루면 아래 함수가 실행됩니다.
searchForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const text = input.value;

  input.value = "";
  input.disabled = true;

  getGeoCode(text)
    .then(function(code) {
      return getWeatherData(code.lat, code.lng);
    })
    .then(function(weatherInfo) {
      setWeatherInfo(text, weatherInfo);
    })
    .catch(function(err) {
      console.log("에러가 발생했습니다.", err);
      input.disabled = false;
    });
});
  //버튼 클릭시..
  let button = document.querySelector(".fa-search");
  button.onclick = function(){
    let searchTEXT =document.querySelector('#searchText');
    let text = "";
    if(searchTEXT.textContent.trim().length===0){
       let first = document.querySelector('#city');
       let select = document.querySelector("#city_name");
       select.style.display = "none"
       text = first.textContent;
    } 
    else{
      text = searchTEXT.textContent;
      getGeoCode(text)
      .then(function(code) {
        return getWeatherData(code.lat, code.lng);
      })
      .then(function(weatherInfo) {
        setWeatherInfo(text, weatherInfo);
      })
      .catch(function(err) {
        console.log("에러가 발생했습니다.", err);
        input.disabled = false;
      });
    }
  }
  button.onclick();
// 1. 입력된 도시의 위도, 경도 값을 가지고 옵니다.
function getGeoCode(city) {
  return new Promise(function(resolve, reject) {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${GOOGLE_KEY}`
    ).then(function(response) {
      response.json().then(function(data) {
        /**
         * - input으로 받은 data에서 우리가 필요한 정보만 찾아 resolve에 인풋으로 넣어주세요!
         *
         * * resolve에 넘겨주어야 하는 input 형식
         * {
         *   lat: 위도,
         *   lng: 경도
         * }
         */
      //  console.log("우리가 받은 위치 데이터 ", data);
         resolve(data.results[0].geometry["location"]); // 여기에 저희가 원하는 형식의 값을 넣어주세요!
      });
    });
  });
}
//지역에 있는 값들 위도경도 -> 날씨 가져오기
function WeatherPrint(location){
   return new Promise(function(resolve,rejcect){
    getGeoCode(location).then(function(value){
      getWeatherData(value.lat,value.lng).then(function(value){
        setWeatherInfo(value.name,value);
     });
    });
 });
}
//미세먼지 지역에 따른 값 가져오기
function finedustGet(location){
  finedust(location).then(function(Value){
      let select = document.querySelector("#city_name");
      select.innerHTML = ""; //초기화...
      if(Value.length===0){
        select.style.display = "none"
        let pm10 = document.querySelector("#pm10");
        let pm25 = document.querySelector("#pm25");
        pm10.textContent ="";
        pm25.textContent ="";
      }
      else{
        select.style.display = "block"
      }
      for(let i=0;i<Value.length;i++){
        let value = document.createElement("option");
        value.text = Value[i].stationName;
        select.options.add(value,i);
        select.onchange = function(result){
          let index = event.target.selectedIndex;
          let pm10 = document.querySelector("#pm10");
          let pm25 = document.querySelector("#pm25");
          pm10.textContent = "미세먼지 "+Value[index].pm10+" "+Value[index].state.pm10state;
          pm25.textContent = "초미세먼지 "+ Value[index].pm25+" "+Value[index].state.pm25state;
        }
      }
      let pm10 = document.querySelector("#pm10");
      let pm25 = document.querySelector("#pm25");
      pm10.textContent = "미세먼지 "+Value[0].pm10+" "+Value[0].state.pm10state;
      pm25.textContent = "초미세먼지 "+ Value[0].pm25+" "+Value[0].state.pm25state;
    
      console.log(select);

  });
}


// let result = WeatherPrint("서울").then(function(val){
//   return val;
// });

// 2. 위도, 경도를 바탕으로 해당 지역의 날씨를 가지고 옵니다.
/**
 * getGeoCode 함수에서 return한 객체에서 lat, lng 값을 가지고 옵니다.
 * lat - 위도
 * lng - 경도
 */
function getWeatherData(lat, lng) {
  return new Promise(function(resolve, reject) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=${WEATHER_KEY}`
    ).then(function(response) {
      response.json().then(function(data) {
        /**
         * - input으로 받은 data에서 우리가 필요한 정보만 찾아 resolve에 인풋으로 넣어주세요!
         *
         * * resolve에 넘겨주어야 하는 input 형식
         * {
         *    temp: 기온
         *    weather: 날씨(데이터에서 weather -> main을 찾아 설정해주세요!)
         * }
         */
       // console.log("우리가 받은 날씨 데이터 ", data);
        let object = {};
        object["weather"] = data.weather[0].main;//날씨
        object["weatherDe"] = data.weather[0].description;//세부날씨설명
        object["maxTemp"]   = data.main.temp_max;//최고온도
        object["minTemp"]   = data.main.temp_min;//최저온도
        object["temp"]      = data.main.temp;//온도
        object["pressure"]     = data.main.pressure;//압력
        object["humidity"]     = data.main.humidity;//습도
        object["name"]         = data.name; //도시이름
        resolve(object); // 여기에 저희가 원하는 형식의 값을 넣어주세요!
      });
    });
  });
}

// 3. 저희가 받은 날씨 정보로 화면을 변경합니다.
/**
 * cityName - 입력한 도시 이름
 * weatherInfo - getWeatherData에서 return해준 객체
 * {
 *    temp: 기온
 *    weather: 날씨
 * }
 */
function setWeatherInfo(cityName, weatherInfo) {
  /**
   * 우리가 받아온 온도는 Kelvin 형식으로 표시되어있습니다.
   * 어떻게 Celsius 형식으로 변경할 수 있을까요?
   */
  let weatherLink;
    if (weatherInfo.weather === "Fog" || weatherInfo.weather === "Mist" 
      || weatherInfo.weather === "Smoke" || weatherInfo.weather === "Haze") {
      weatherLink = "Fog.gif";
    } else {
      weatherLink = weatherInfo.weather+".gif";
    }
    image.src = `./img/${weatherLink}`; // 이곳에 이미지 파일의 경로를 입력해주면 이미지 파일이 표시됩니다.
  



  console.log(weatherInfo);
  temp.innerText = (weatherInfo.temp-273).toFixed(1); // 이곳에 넣어준 값이 온도로 표시됩니다!



  
  /**
   * data.js 파일에 있는 imgLinks 객체를 사용해 날씨에 맞는 이미지를 표시해보세요!
   */

  let tempFah = document.body.querySelector('#fah');
  tempFah.addEventListener('click', function(){
    temp.innerText = ((weatherInfo.temp-273) * 1.8 + 32).toFixed(1);
  });
  
  let tempCel = document.body.querySelector('#cel');
  tempCel.addEventListener('click', function(){
    temp.innerText = (weatherInfo.temp-273).toFixed(1);
  });

  /**
   * 아래의 코드는 어떤 역할을 할까요?
   */
  //도시이름 넣기..
  city.innerText = cityName;
  finedustGet(cityName);
  input.disabled = false;
}
/**
 * 해볼 것들
 *
 * - 날씨별로 맞추어 배경색상을 변경해보기
 * javasciprt를 사용해 element의 내용 뿐만 아니라 element의 style도 변경할 수 있습니다.
 * 어떻게 javascript를 사용해 css를 다룰 수 있을까요?
 *
 * 배경 참고 사이트 https://uigradients.com/
 *
 * - 나만의 날씨 이미지로 변경하기
 * 이미지를 수정하거나, 새로운 이미지를 추가해보세요.
 * 원하는 이미지를 찾아 img 폴더에 저장 후 data.js 파일을 수정해보세요.
 *
 */
//미세먼지 도시이름을 입력했을 경우만가져오기..
function finedust(city) {
  return new Promise(function(resolve, reject) {
    fetch(
      `http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?sidoName=${city}&pageNo=1&numOfRows=40&ServiceKey=CrwzQV%2FObWLeHhsvGFOw6AMlZWK5XXkLnPmOSGhUXrdylBBghRysHKqvsYfv6GDlOjC1lrT8fbLNbdqXHZGsug%3D%3D&_returnType=json&ver=1.7`
    ).then(function(response) {
      response.json().then(function(data){
        data = data.list;
        let array = [];
        for(let i=0;i<data.length;i++){
           if(data[i].pm10Value!==""&&data[i].pm25Value!==""&&!isNaN(Number(data[i].pm10Value))){
             let object ={};
             object["pm10"]=(data[i].pm10Value); //미세먼지
             object["pm25"]=(data[i].pm25Value); //초미세먼지
             object["stationName"]=(data[i].stationName); //지역이름
             object["state"]= finddustline(data[i].pm10Value,data[i].pm25Value);
             array.push(object);
           }
        }
        resolve(array);
      });
    });
  });
}
//미세먼지 농도기준에 따른 기준
function finddustline(pm10,pm25){
  let object = {};
  let pm10state = "";
  let pm25state = "";
  if(pm10>=151){
    pm10state = "매우나쁨";
  }
  else if(pm10>=81){
    pm10state = "나쁨";
  }
  else if(pm10>=31){
    pm10state = "보통";
  }
  else{
    pm10state = "좋음";
  }

  if(pm25>=151){
    pm25state = "매우나쁨";
  }
  else if(pm25>=81){
    pm25state = "나쁨";
  }
  else if(pm25>=31){
    pm25state = "보통";
  }
  else{
    pm25state = "좋음";
  }
  object["pm10state"] = pm10state;
  object["pm25state"] = pm25state;
  return object;
}

// Changes XML to JSON
function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};