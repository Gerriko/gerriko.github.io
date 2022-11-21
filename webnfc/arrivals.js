
async function startScanning() {
  $('#arrivals_canvas').hide().removeClass('d-none').fadeIn();
  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    $('#scan_btn').text("NFC Scan Active...");
    $('#scan_btn').removeClass('btn-outline-light');
    $('#scan_btn').addClass('btn-success');

    ndef.addEventListener("readingerror", () => {
      $('#arrivals_data').text("Argh! Cannot read data from the NFC tag. Try another one?");
    });

    ndef.addEventListener("reading", ({ message, serialNumber }) => {
      $('#arrivals_data').append(`> Serial Number: ${serialNumber}`);
      $('#arrivals_data').append(`> Records: (${message.records.length})`);
      
      if (message.records.length > 0 && message.records[0].recordType != "empty") {
        const decoder = new TextDecoder();
        for (const record of message.records) {
          $('#arrivals_data').append(`> Record Type: (${record.recordType})`);
          $('#arrivals_data').append(`> Data: (${decoder.decode(record.data)})`);
          switch (record.recordType) {
            case "text":
              break;
            case "url":
              break;
            case "mime":
              break;
            case "smart-poster":
              break;
            default:
          }
        }
      }
    });
  } catch (error) {
    $('#arrivals_data').text("Argh! " + error);
  }
}
