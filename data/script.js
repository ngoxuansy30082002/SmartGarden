var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener("load", onload);
var value_soiMoisture;
var value_humAir;
var value_tempAir;
var value_light;
//
var state_Light = 0;
var state_pumpDew = 0;
var state_roof = 0;
//
var auto_value_soiMoisture;
var auto_value_humAir;
var auto_value_tempAir;
var auto_value_lightSensor;

var state_auto = 0;
var roof;
// khác
function onload(event) {
  initWebSocket();
}
// khác
function getValues() {
  websocket.send("getValues");
}

function initWebSocket() {
  console.log("Trying to open a WebSocket connection…");
  websocket = new WebSocket(gateway);
  websocket.onopen = onOpen;
  websocket.onclose = onClose;
  websocket.onmessage = onMessage;
}

function onOpen(event) {
  console.log("Connection opened");
  getValues();
}

function onClose(event) {
  console.log("Connection closed");
  setTimeout(initWebSocket, 2000);
}
// send auto value to sever
function updateSliderPWM(element) {
  var sliderNumber = element.id.charAt(element.id.length - 1);
  var sliderValue = document.getElementById(element.id).value;
  document.getElementById("percent" + sliderNumber).sliderValue =
    parseInt(sliderValue);
  document.getElementById("auto_value" + sliderNumber).innerHTML =
    sliderValue.toString() + "";
  // document.getElementById("sliderValue" + sliderNumber).innerHTML = sliderValue;
  // document.getElementById("auto_value1").innerHTML = auto_input1.value + "%";
  console.log(sliderNumber + "s" + sliderValue.toString());
  websocket.send(sliderNumber + "s" + sliderValue.toString());
  if (sliderNumber === "1") {
  }
  if (sliderNumber === "2" && state_auto === "1") {
    if (value_humAir <= sliderValue && state_pumpDew === "0") {
      document.getElementById("js-button2").classList.add("slider2");
      websocket.send("button2on");
    }
    if (value_humAir > sliderValue && state_pumpDew === "1") {
      document.getElementById("js-button2").classList.remove("slider2");
      websocket.send("button2off");
    }
  }
  if (sliderNumber === "3" && state_auto === "1") {
    if (value_tempAir >= sliderValue && state_roof === "0") {
      if (roof === 0) {
        document.getElementById("js-button3").classList.add("slider3");
        websocket.send("button3on");
      }
    }
    if (value_tempAir < sliderValue && state_roof === "1")
      if (roof === 0) {
        document.getElementById("js-button3").classList.remove("slider3");
        websocket.send("button3off");
      }
  }
  if (sliderNumber === "4" && state_auto === "1") {
    if (value_light <= sliderValue && state_Light === "0") {
      document.getElementById("js-button4").classList.add("slider4");
      websocket.send("button4on");
    }
    if (value_light > sliderValue && state_Light === "1") {
      document.getElementById("js-button4").classList.remove("slider4");
      websocket.send("button4off");
    }
  }
}
function updateAuto(index, auto_value) {
  document.getElementById("percent" + index).value = parseInt(auto_value);
  document.getElementById("auto_value" + index).innerHTML =
    auto_value.toString() + "";
  if (index === "1") {
  }
  if (index === "2" && state_auto === "1") {
    if (value_humAir <= auto_value && state_pumpDew === "0") {
      document.getElementById("js-button2").classList.add("slider2");
      websocket.send("button2on");
    }
    if (value_humAir > auto_value && state_pumpDew === "1") {
      document.getElementById("js-button3").classList.remove("slider3");
      websocket.send("button2off");
    }
  }
  if (index === "3" && state_auto === "1") {
    if (value_tempAir >= auto_value && state_roof === "0") {
      if (roof === 0) {
        document.getElementById("js-button3").classList.add("slider3");
        websocket.send("button3on");
      }
    }
    if (value_tempAir < auto_value && state_roof === "1")
      if (roof === 0) {
        document.getElementById("js-button3").classList.remove("slider3");
        websocket.send("button3off");
      }
  }
  if (index === "4" && state_auto === "1") {
    if (value_light <= auto_value && state_Light === "0") {
      document.getElementById("js-button4").classList.add("slider4");
      websocket.send("button4on");
    }
    if (value_light > auto_value && state_Light === "1") {
      document.getElementById("js-button4").classList.remove("slider4");
      websocket.send("button4off");
    }
  }
}
// input range set value
const auto_inputs = document.querySelectorAll(".percent");
for (const auto_input of auto_inputs) {
  auto_input.addEventListener("input", () => {
    var auto_value = Array.prototype.indexOf.call(auto_inputs, auto_input) + 1;
    document.getElementById("auto_value" + auto_value.toString()).innerHTML =
      auto_input.value + "";
  });
}

// click event button
document.querySelector("#js-button0").addEventListener("click", function () {
  websocket.send("button0");
});
const buttons = document.querySelectorAll(".js-button");
for (const btn of buttons) {
  // console.log(btn);
  btn.addEventListener("click", function () {
    updateState(Array.prototype.indexOf.call(buttons, btn) + 1);
  });
}
function updateState(index) {
  // var button = "js-button" + index.toString();
  // var slider = "slider" + index.toString();
  // var element = document.getElementById(button);
  // console.log(button);
  // element.classList.add(slider);
  console.log("button" + index.toString());
  var element = document
    .getElementById("js-button0")
    .classList.contains("slider0");
  if (element) alert("Bạn muốn điều khiển?? Hãy tắt chế độ auto");
  else {
    if (index === 2) {
      if (state_pumpDew === "1")
        websocket.send("button" + index.toString() + "off");
      else websocket.send("button" + index.toString() + "on");
    }
    if (index === 3) {
      if (roof) {
        alert("Rèm đang chạy!!");
      } else {
        if (state_roof === "1")
          websocket.send("button" + index.toString() + "off");
        else websocket.send("button" + index.toString() + "on");
      }
    }
    if (index === 4) {
      if (state_Light === "1")
        websocket.send("button" + index.toString() + "off");
      else websocket.send("button" + index.toString() + "on");
    }
  }
}

function onMessage(event) {
  console.log(event.data);
  var myObj = JSON.parse(event.data);
  var keys = Object.keys(myObj);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    switch (key) {
      case "value_soiMoisture":
        value_soiMoisture = parseInt(myObj[key]);
        updateHumSoil();
        break;
      case "value_humAir":
        value_humAir = parseInt(myObj[key]);
        updateHumAir();
        break;
      case "value_tempAir":
        value_tempAir = parseInt(myObj[key]);
        undateTempAir();
        break;
      case "value_lightSensor":
        value_light = myObj[key];
        if (value_light === "1")
          value_light = parseInt(20 + Math.random() * 3 + 1);
        else value_light = parseInt(70 + Math.random() * 3 + 1);
        updateLight();
        break;
      case "state_light":
        state_Light = myObj[key];
        if (state_Light === "1")
          document.getElementById("js-button4").classList.add("slider4");
        else document.getElementById("js-button4").classList.remove("slider4");
        break;
      case "state_pumpDew":
        state_pumpDew = myObj[key];
        if (state_pumpDew === "1")
          document.getElementById("js-button2").classList.add("slider2");
        else document.getElementById("js-button2").classList.remove("slider2");
        break;
      case "state_roof":
        state_roof = myObj[key];
        if (state_roof === "1")
          document.getElementById("js-button3").classList.add("slider3");
        else document.getElementById("js-button3").classList.remove("slider3");
        break;
      case "auto_value_soiMoisture":
        auto_value_soiMoisture = parseInt(myObj[key]);
        updateAuto("1", auto_value_soiMoisture);
        break;
      case "auto_value_humAir":
        auto_value_humAir = parseInt(myObj[key]);
        updateAuto("2", auto_value_humAir);

        break;
      case "auto_value_tempAir":
        auto_value_tempAir = parseInt(myObj[key]);
        updateAuto("3", auto_value_tempAir);

        break;
      case "auto_value_lightSensor":
        auto_value_lightSensor = parseInt(myObj[key]);
        updateAuto("4", auto_value_lightSensor);

        break;
      case "auto_state":
        state_auto = myObj[key];
        if (state_auto === "1")
          document.getElementById("js-button0").classList.add("slider0");
        else document.getElementById("js-button0").classList.remove("slider0");
        break;
      case "roof":
        if (myObj[key] === "1") roof = 1;
        else roof = 0;
    }
    // var state;
    // if (myObj[key] == "1") state = "ON";
    // else state = "OFF";
    // document.getElementById(key).innerHTML = state;
  }
}

function updateHumSoil() {
  // var val = parseInt($(this).val());
  var $circle = $("#SOIL_moisture #svg #bar");
  if (isNaN(value_soiMoisture)) {
    value_soiMoisture = 100;
  } else {
    var r = $circle.attr("r");
    var c = Math.PI * (r * 2);

    if (value_soiMoisture < 0) {
      value_soiMoisture = 0;
    }
    if (value_soiMoisture > 100) {
      value_soiMoisture = 100;
    }

    var pct = ((100 - value_soiMoisture) / 100) * c;
    $circle.css({ strokeDashoffset: pct });
    $("#SOIL_moisture #cont").attr("data-pct", value_soiMoisture);
  }
}
function updateHumAir() {
  // var val = parseInt($(this).val());
  var $circle = $("#Air_humidity #svg #bar");

  if (isNaN(value_humAir)) {
    value_humAir = 100;
  } else {
    var r = $circle.attr("r");
    var c = Math.PI * (r * 2);

    if (value_humAir < 0) {
      value_humAir = 0;
    }
    if (value_humAir > 100) {
      value_humAir = 100;
    }

    var pct = ((100 - value_humAir) / 100) * c;

    $circle.css({ strokeDashoffset: pct });

    $("#Air_humidity #cont").attr("data-pct", value_humAir);
  }
}
function undateTempAir() {
  // var val = parseInt($(this).val());
  var $circle = $("#tempurature #svg #bar");

  if (isNaN(value_tempAir)) {
    value_tempAir = 100;
  } else {
    var r = $circle.attr("r");
    var c = Math.PI * (r * 2);

    if (value_tempAir < 0) {
      value_tempAir = 0;
    }
    if (value_tempAir > 100) {
      value_tempAir = 100;
    }

    var pct = ((100 - value_tempAir) / 100) * c;

    $circle.css({ strokeDashoffset: pct });

    $("#tempurature #cont").attr("data-pct", value_tempAir);
  }
}

function updateLight() {
  var $circle = $("#light #svg #bar");

  if (isNaN(value_light)) {
    value_light = 100;
  } else {
    var r = $circle.attr("r");
    var c = Math.PI * (r * 2);

    if (value_light < 0) {
      value_light = 0;
    }
    if (value_light > 100) {
      value_light = 100;
    }

    var pct = ((100 - value_light) / 100) * c;

    $circle.css({ strokeDashoffset: pct });

    $("#light #cont").attr("data-pct", value_light);
  }
}

const chartBtns = document.querySelectorAll(".chart");
const modals = document.querySelectorAll(".modal");
const modalContainers = document.querySelectorAll(".modal-container");

function showBuyTickets(index) {
  document.querySelector(".js-modal" + index.toString()).classList.add("open");
  document
    .querySelector(".js-modal-container" + index.toString())
    .classList.add("open");
}
function closeBuyTickets(index) {
  document
    .querySelector(".js-modal-container" + index.toString())
    .classList.remove("open");
  document
    .querySelector(".js-modal-container" + index.toString())
    .classList.add("close");
  setTimeout(() => {
    document
      .querySelector(".js-modal-container" + index.toString())
      .classList.remove("close");
  }, 500);
  document
    .querySelector(".js-modal" + index.toString())
    .classList.remove("open");
  document.querySelector(".js-modal" + index.toString()).classList.add("close");
  setTimeout(() => {
    document
      .querySelector(".js-modal" + index.toString())
      .classList.remove("close");
  }, 500);
}
for (const chartBtn of chartBtns) {
  chartBtn.addEventListener("click", () => {
    showBuyTickets(Array.prototype.indexOf.call(chartBtns, chartBtn) + 1);
  });
}
for (const modal of modals) {
  modal.addEventListener("click", () => {
    closeBuyTickets(Array.prototype.indexOf.call(modals, modal) + 1);
  });
}
// modalClose.addEventListener("click", closeBuyTickets);
for (const modalContainer of modalContainers) {
  modalContainer.addEventListener("click", function (event) {
    event.stopPropagation();
  });
}

var chartTempAir = new Highcharts.Chart({
  chart: { renderTo: "chart-temperature" },
  title: { text: "TEMPURATURE" },
  series: [
    {
      showInLegend: false,
      data: [],
    },
  ],
  plotOptions: {
    line: { animation: false, dataLabels: { enabled: true } },
    series: { color: "#059e8a" },
  },
  xAxis: { type: "datetime", dateTimeLabelFormats: { second: "%H:%M:%S" } },
  yAxis: {
    title: { text: "TEMPURATURE (Celsius)" },
    //title: { text: 'Temperature (Fahrenheit)' }
  },
  credits: { enabled: false },
});
setInterval(function () {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var x = new Date().getTime(),
        y = parseFloat(this.responseText) + parseInt(Math.random() * 2 + 1);
      //console.log(this.responseText);
      if (chartTempAir.series[0].data.length > 40) {
        chartTempAir.series[0].addPoint([x, y], true, true, true);
      } else {
        chartTempAir.series[0].addPoint([x, y], true, false, true);
      }
    }
  };
  xhttp.open("GET", "/temperature", true);
  xhttp.send();
}, 3000);

var chartHumAir = new Highcharts.Chart({
  chart: { renderTo: "chart-humAir" },
  title: { text: "AIR HUMIDITY" },
  series: [
    {
      showInLegend: false,
      data: [],
    },
  ],
  plotOptions: {
    line: { animation: false, dataLabels: { enabled: true } },
  },
  xAxis: {
    type: "datetime",
    dateTimeLabelFormats: { second: "%H:%M:%S" },
  },
  yAxis: {
    title: { text: "AIR HUMIDITY (%)" },
  },
  credits: { enabled: false },
});
setInterval(function () {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var x = new Date().getTime(),
        y = parseFloat(this.responseText) + parseInt(Math.random() * 2 + 1);
      //console.log(this.responseText);
      if (chartHumAir.series[0].data.length > 40) {
        chartHumAir.series[0].addPoint([x, y], true, true, true);
      } else {
        chartHumAir.series[0].addPoint([x, y], true, false, true);
      }
    }
  };
  xhttp.open("GET", "/humAir", true);
  xhttp.send();
}, 3000);

var chartHumSoil = new Highcharts.Chart({
  chart: { renderTo: "chart-humSoil" },
  title: { text: "SOIL MOISTURE" },
  series: [
    {
      showInLegend: false,
      data: [],
    },
  ],
  plotOptions: {
    line: { animation: false, dataLabels: { enabled: true } },
    series: { color: "#18009c" },
  },
  xAxis: {
    type: "datetime",
    dateTimeLabelFormats: { second: "%H:%M:%S" },
  },
  yAxis: {
    title: { text: "SOIL MOISTURE (hPa)" },
  },
  credits: { enabled: false },
});
setInterval(function () {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var x = new Date().getTime(),
        y = parseFloat(this.responseText) + parseInt(Math.random() * 2 + 1);
      //console.log(this.responseText);
      if (chartHumSoil.series[0].data.length > 40) {
        chartHumSoil.series[0].addPoint([x, y], true, true, true);
      } else {
        chartHumSoil.series[0].addPoint([x, y], true, false, true);
      }
    }
  };
  xhttp.open("GET", "/humSoil", true);
  xhttp.send();
}, 3000);

var chartLight = new Highcharts.Chart({
  chart: { renderTo: "chart-light" },
  title: { text: "LIGHT" },
  series: [
    {
      showInLegend: false,
      data: [],
    },
  ],
  plotOptions: {
    line: { animation: false, dataLabels: { enabled: true } },
  },
  xAxis: {
    type: "datetime",
    dateTimeLabelFormats: { second: "%H:%M:%S" },
  },
  yAxis: {
    title: { text: "LIGHT (%)" },
  },
  credits: { enabled: false },
});
setInterval(function () {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var x = new Date().getTime(),
        y = parseFloat(this.responseText);
      // console.log(this.responseText);
      if (y == 0) y = parseInt(70 + Math.random() * 2 + 1);
      else y = parseInt(20 + Math.random() * 2 + 1);
      if (chartLight.series[0].data.length > 40) {
        chartLight.series[0].addPoint([x, y], true, true, true);
      } else {
        chartLight.series[0].addPoint([x, y], true, false, true);
      }
    }
  };
  xhttp.open("GET", "/light", true);
  xhttp.send();
}, 3000);
