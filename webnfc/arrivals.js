let ndef;
let AbortCtrlr;
let geoLoc = "";
let placeID = "";
let stnName = "";
let trainLink = "";
let busLink = "";

$(document).ready(async function() {
  if (!("NDEFReader" in window)) {
    $('#nfc-error').hide().removeClass('d-none').fadeIn();
  }
  else {
    $('#nfc-pass').hide().removeClass('d-none').fadeIn();
    try {
			await getGoogs();
    }
    catch (error) {
      console.log("Argh fetch! " + error);
    }
  }
});

async function getGoogs() {
	let response = await fetch("googs.abc");
	if(response.status != 200) {
		throw new Error("Server Error");
	}
	// read response stream as text
	let text_data = await response.text();
	var textArr = text_data.split(',');
	if (textArr.length == 2) {
		trainLink = textArr[0].substring(3);
		busLink = textArr[1].substring(3);
	}
}

async function startScanning() {
  let URLfind;
  let TXTfind;
  $('#arrivals_canvas').hide().removeClass('d-none').fadeIn();
  $('html, body').animate({ scrollTop: $("#nfc-pass").offset().top }, 300);
  try {
    ndef = new NDEFReader();
    AbortCtrlr = new AbortController();
    const signal = AbortCtrlr.signal;
    await ndef.scan({ signal });
    $('#scan_btn').text("NFC Scan Active...");
    $('#scan_btn').removeClass('btn-outline-light');
    $('#scan_btn').addClass('btn-warning disabled');
		$('#arrivals_header').text("Waiting for tag data...");

    ndef.addEventListener("readingerror", () => {
			$('#arrivals_header').text("Read Error:");
      $('#arrivals_data').text("Argh! Cannot read data from the NFC tag. Try another one?");
    });

    ndef.addEventListener("reading", ({ message, serialNumber }) => {
			$('#arrivals_header').text("Your NFC Tag Data:");
      $('#arrivals_data').text(`Tag Serial Number: ${serialNumber}`);
      $('#arrivals_data').append(`<br/>NDEF Records: (${message.records.length})`);
      
      if (message.records.length > 0 && message.records[0].recordType != "empty") {
        const decoder = new TextDecoder();
        for (const record of message.records) {
          $('#arrivals_data').append(`<br/>NDEF Record Type: (${record.recordType})`);
          $('#arrivals_data').append(`<br/>NDEF Data: (${decoder.decode(record.data)})`);
          $('#bus_btn').hide().addClass('d-none');
          $('#train_btn').hide().addClass('d-none');
           $('#map_btn').hide().addClass('d-none');
          switch (record.recordType) {
            case "text":
              const textDecoder = new TextDecoder(record.encoding);
              $('#arrivals_data').append(`<br/>Text: ${textDecoder.decode(record.data)} (${record.lang})`);
              break;
            case "url":
              break;
            case "mime":
              if (record.mediaType === "application/json") {
                $('#arrivals_data').append(`<br/>Mime JSON: ${JSON.parse(decoder.decode(record.data))}`);
              } else {
                const textDecoder = new TextDecoder(record.encoding);
                $('#arrivals_data').append(`<br/>Text: ${textDecoder.decode(record.data)}`);
                //console.log(`MIME Media not handled`);
              }
              break;
            case "smart-poster":
              URLfind = false;
              TXTfind = 0;
              for (const sprecord of record.toRecords()) {
                const spData = decoder.decode(sprecord.data);
                $('#arrivals_data').append(`<br/>- SP Type: ${sprecord.recordType} | Data: ${spData}`);
                if (sprecord.recordType == "url" && spData.includes("geo:53.")) {
                  const GEOlat = spData.indexOf("geo:")+4;
                  const GEOlong = spData.indexOf(",");
                  geoLoc = "query="+spData.substring(GEOlat, GEOlong)+"%2C"+spData.substring(GEOlong+1);
                  //console.log("geoLoc: "+geoLoc);
                  URLfind = true;
                }
                else if (sprecord.recordType == "text") {
                  if (spData.includes(", stop")) {
										TXTfind = 1;
									}
                  else if (spData.includes(", StationCode")) {
										const StnStart = spData.indexOf("ode=")+4;
										const StnEnd = spData.indexOf(", Place");
										stnName = spData.substring(StnStart, StnEnd);
										TXTfind = 2;
									}
                  if (spData.includes("ID: ")) {
                    const placeIDstart = spData.indexOf("ID: ")+4;
                    placeID = "query_place_id="+spData.substring(placeIDstart);
                    //console.log("placeID: "+placeID);
                  }
                }
              }
              
              if (URLfind == true && TXTfind == 1) {
                $('#bus_btn').hide().removeClass('d-none').fadeIn();
                $('#map_btn').hide().removeClass('d-none').fadeIn();
              }
              if (URLfind == true && TXTfind == 2) {
                $('#train_btn').hide().removeClass('d-none').fadeIn();
                $('#map_btn').hide().removeClass('d-none').fadeIn();
              }
                
              break;
            default:
          }
        }
        $('#stop_btn').hide().removeClass('d-none').fadeIn();
      }
    });
  } catch (error) {
    $('#arrivals_data').text("Argh! " + error);
  }
}

async function stopScan() {
  await AbortCtrlr.abort();
  $('#arrivals_data').text("");
  $('#bus_btn').hide().addClass('d-none');
  $('#train_btn').hide().addClass('d-none');
  $('#map_btn').hide().addClass('d-none');
  $('#stop_btn').hide().addClass('d-none');
  $('#arrivals_canvas').addClass('d-none').fadeOut();
  $('#scan_btn').removeClass('btn-warning disabled');
  $('#scan_btn').addClass('btn-outline-light');
  $('#scan_btn').text("Where's my transport?");
  $('html, body').animate({ scrollTop: $("#bus-header").offset().top }, 500);
  
}

function getMapData() {
  if (geoLoc.length > 5 && placeID.length > 5) {
    window.open('https://www.google.com/maps/search/?api=1&'+geoLoc+'&'+placeID);
  }
}

async function getTrainData() {
	await AbortCtrlr.abort();
	if (trainLink.length > 32 && stnName.length > 1) {
		const trainULS = "https://script.google.com/macros/s/" + trainLink + "/exec?station=" + stnName;
		//console.log(trainULS);
		$.getJSON(trainULS, function(data, status) {
			console.log("Status (" + status + ")");
			var items = [];
			$('#arrivals_header').text("Your " + stnName + " Train Arrivals:");
			$('#arrivals_data').text("");
			$.each( data, function( key, val ) {
				console.log("key:" + key + " | val:" + val);
				if (key == "T1" || key == "T2" || key == "T3" || key == "T4") {
					var textArr = val.toString().split(',');
					$('#arrivals_data').append(key.toString() + ": "+ textArr[0] + " due in " + textArr[1] + "<br/>");
				}
			});
		});
	}
}

async function getBusData() {
	
}

