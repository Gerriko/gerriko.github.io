let ndef;
let AbortCtrlr;

async function startScanning() {
  $('#arrivals_canvas').hide().removeClass('d-none').fadeIn();
  try {
    ndef = new NDEFReader();
    AbortCtrlr = new AbortController();
    const signal = AbortCtrlr.signal;
    await ndef.scan({ signal });
    $('#scan_btn').text("NFC Scan Active...");
    $('#scan_btn').removeClass('btn-outline-light');
    $('#scan_btn').addClass('btn-success disabled');

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
          switch (record.recordType) {
            case "text":
              const textDecoder = new TextDecoder(record.encoding);
              $('#arrivals_data').append(`<br/>Text: ${textDecoder.decode(record.data)} (${record.lang})`);
              $('#get_btn').hide().addClass('d-none');
              break;
            case "url":
              $('#get_btn').hide().addClass('d-none');
              break;
            case "mime":
              $('#get_btn').hide().addClass('d-none');
              break;
            case "smart-poster":
              for (const record of record.data.toRecords()) {
                $('#arrivals_data').append(`<br/>Type: ${record.recordType})`);
              }
                
              $('#get_btn').hide().removeClass('d-none').fadeIn();
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
  $('#get_btn').hide().addClass('d-none');
  $('#stop_btn').hide().addClass('d-none');
  $('#arrivals_canvas').addClass('d-none').fadeOut();
  $('#scan_btn').removeClass('btn-success disabled');
  $('#scan_btn').addClass('btn-outline-light');
  $('#scan_btn').text("Where's my bus?");
  
}


