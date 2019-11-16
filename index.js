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
getGeoCode("서울");
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
function WeatherPrint(location){
   return new Promise(function(resolve,rejcect){
    getGeoCode(location).then(function(value){
      getWeatherData(value.lat,value.lng).then(function(value){
        setWeatherInfo(value.name,value);
     });
    });
 });
}
let result = WeatherPrint("서울").then(function(val){
  return val;
});
console.log(result);
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
//미세먼지
function finedust(city) {
  return new Promise(function(resolve, reject) {
    fetch(
      //`https://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${AIRKOREA_KEY}&numOfRows=1&pageNo=1&sidoName=${city}&ver=1.3`
      "https://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=CrwzQV%2FObWLeHhsvGFOw6AMlZWK5XXkLnPmOSGhUXrdylBBghRysHKqvsYfv6GDlOjC1lrT8fbLNbdqXHZGsug%3D%3D&numOfRows=10&pageNo=1&sidoName=%EC%9D%B8%EC%B2%9C&ver=1.3"
      ).then(function(response) {
      response.text().then(function(data){
        debugger;
        console.log(data);
      });
    });
  });
}
finedust("서울");
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