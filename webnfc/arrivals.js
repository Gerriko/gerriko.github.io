var OutputHelper = {
  log: function() {
    var line = Array.prototype.slice.call(arguments).map(function(argument) {
      return typeof argument === 'string' ? argument : JSON.stringify(argument);
    }).join(' ');

    document.querySelector('#log').textContent += line + '\n';
  },

  clearLog: function() {
    document.querySelector('#log').textContent = '';
  },

  setStatus: function(status) {
    document.querySelector('#status').textContent = status;
  },

  setContent: function(newContent) {
    var content = document.querySelector('#content');
    while(content.hasChildNodes()) {
      content.removeChild(content.lastChild);
    }
    content.appendChild(newContent);
  }
};

if (!("NDEFReader" in window))
  OutputHelper.setStatus("Web NFC is not available. Use Chrome on Android.");

async function startScanning() {
  log = OutputHelper.log;

  try {
    const nfcPermissionStatus = await navigator.permissions.query({ name: "nfc" });
    if (nfcPermissionStatus.state === "granted") {
      const ndef = new NDEFReader();
      await ndef.scan();
      log("> NFC Scan started");
      ndef.addEventListener("readingerror", () => {
        log("Argh! Cannot read data from the NFC tag. Try another one?");
      });

      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        log(`> Serial Number: ${serialNumber}`);
        log(`> Records: (${message.records.length})`);
      });
    }
  } catch (error) {
    log("Argh! " + error);
  }
}
