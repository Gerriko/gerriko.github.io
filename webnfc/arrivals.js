
async function startScanning() {
  $('#arrivals_canvas').hide().removeClass('d-none').fadeIn();
  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    $('#scan_btn').text("NFC Scan Active...");
    $('#scan_btn').removeClass('btn-outline-light');
    $('#scan_btn').addClass('btn-success disabled');

    ndef.addEventListener("readingerror", () => {
      $('#arrivals_data').text("Argh! Cannot read data from the NFC tag. Try another one?");
    });

    ndef.addEventListener("reading", ({ message, serialNumber }) => {
      if ($('#get_btn').hasClass('d-none') == false) $('#get_btn').addClass('d-none');
      if ($('#stop_btn').hasClass('d-none') == false) $('#stop_btn').addClass('d-none');
      $('#arrivals_data').text(`Tag Serial Number: ${serialNumber}`);
      $('#arrivals_data').append(`<br/>NDEF Records: (${message.records.length})`);
      
      if (message.records.length > 0 && message.records[0].recordType != "empty") {
        const decoder = new TextDecoder();
        for (const record of message.records) {
          $('#arrivals_data').append(`<br/>NDEF Record Type: (${record.recordType})`);
          $('#arrivals_data').append(`<br/>NDEF Data: (${decoder.decode(record.data)})`);
          switch (record.recordType) {
            case "text":
              break;
            case "url":
              break;
            case "mime":
              break;
            case "smart-poster":
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
