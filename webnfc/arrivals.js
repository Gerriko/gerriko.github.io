let ndef;
let AbortCtrlr;

async function startScanning() {
  let URLfind;
  let TXTfind;
  $('#arrivals_canvas').hide().removeClass('d-none').fadeIn();
  $('html, body').animate({ scrollTop: $("#nfc-pass").offset().top }, 500);
  try {
    ndef = new NDEFReader();
    AbortCtrlr = new AbortController();
    const signal = AbortCtrlr.signal;
    await ndef.scan({ signal });
    $('#scan_btn').text("NFC Scan Active...");
    $('#scan_btn').removeClass('btn-outline-light');
    $('#scan_btn').addClass('btn-warning disabled');

    ndef.addEventListener("readingerror", () => {
      $('#arrivals_data').text("Argh! Cannot read data from the NFC tag. Try another one?");
    });

    ndef.addEventListener("reading", ({ message, serialNumber }) => {
      $('#arrivals_data').text(`Tag Serial Number: ${serialNumber}`);
      $('#arrivals_data').append(`<br/>NDEF Records: (${message.records.length})`);
      
      if (message.records.length > 0 && message.records[0].recordType != "empty") {
        const decoder = new TextDecoder();
        for (const record of message.records) {
          $('#arrivals_data').append(`<br/>NDEF Record Type: (${record.recordType})`);
          $('#arrivals_data').append(`<br/>NDEF Data: (${decoder.decode(record.data)})`);
          $('#bus_btn').hide().addClass('d-none');
          $('#train_btn').hide().addClass('d-none');
          switch (record.recordType) {
            case "text":
              const textDecoder = new TextDecoder(record.encoding);
              $('#arrivals_data').append(`<br/>Text: ${textDecoder.decode(record.data)} (${record.lang})`);
              break;
            case "url":
              break;
            case "mime":
              break;
            case "smart-poster":
              URLfind = false;
              TXTfind = 0;
              for (const sprecord of record.toRecords()) {
                const spData = decoder.decode(sprecord.data);
                $('#arrivals_data').append(`<br/>- SP Type: ${sprecord.recordType} | Data: ${spData}`);
                if (sprecord.recordType == "url" && spData.includes("geo:53.")) URLfind = true;
                else if (sprecord.recordType == "text" && spData.includes(", stop")) TXTfind = 1;
                else if (sprecord.recordType == "text" && spData.includes(", StationCode")) TXTfind = 2;
              }
              
              if (URLfind == true && TXTfind == 1)
                $('#bus_btn').hide().removeClass('d-none').fadeIn();                
              if (URLfind == true && TXTfind == 2)
                $('#train_btn').hide().removeClass('d-none').fadeIn();                
                
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
  $('#stop_btn').hide().addClass('d-none');
  $('#arrivals_canvas').addClass('d-none').fadeOut();
  $('#scan_btn').removeClass('btn-warning disabled');
  $('#scan_btn').addClass('btn-outline-light');
  $('#scan_btn').text("Where's my bus?");
  
}


