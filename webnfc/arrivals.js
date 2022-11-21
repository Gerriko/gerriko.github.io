
async function startScanning() {
  $('#arrivals_canvas').hide().removeClass('d-none').fadeIn();
  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    $('#scanning_btn').text("NFC Scan Active...");
    $('#scanning_btn').removeClass('btn-outline-light');
    $('#scanning_btn').addClass('btn-success');
    $('#arrivals_data').text("> Scan started.");

    ndef.addEventListener("readingerror", () => {
      $('#arrivals_data').text("Argh! Cannot read data from the NFC tag. Try another one?");
    });

    ndef.addEventListener("reading", ({ message, serialNumber }) => {
      $('#arrivals_data').append(`\n> Serial Number: ${serialNumber}`);
      $('#arrivals_data').append(`\n> Records: (${message.records.length})`);
      
      if (message.records.length > 0 && message.records[0].recordType != "empty") {
        const decoder = new TextDecoder();
        for (const record of message.records) {
          $('#arrivals_data').append(`\n> Record Type: (${record.recordType})`);
          switch (record.recordType) {
            case "text":
              break;
            case "url":
              break;
            case "mime":
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
