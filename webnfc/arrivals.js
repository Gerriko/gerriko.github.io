
async function startScanning() {
  $('#arrivals_canvas').hide().removeClass('d-none').fadeIn();
  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    arrivals_data.text("> Scan started.");

    ndef.addEventListener("readingerror", () => {
      arrivals_data.text("Argh! Cannot read data from the NFC tag. Try another one?");
    });

    ndef.addEventListener("reading", ({ message, serialNumber }) => {
      arrivals_data.append(`> Serial Number: ${serialNumber}`);
      arrivals_data.append(`> Records: (${message.records.length})`);
    });
  } catch (error) {
    arrivals_data.text("Argh! " + error);
  }
}
