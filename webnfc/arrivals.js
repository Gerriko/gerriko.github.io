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

log = OutputHelper.log;

if (!("NDEFReader" in window))
  OutputHelper.setStatus("Web NFC is not available. Use Chrome on Android.");
</script>

async function startScanning() {
  try {
    const nfcPermissionStatus = await navigator.permissions.query({ name: "nfc" });
    if (nfcPermissionStatus.state === "granted") {
      const ndef = new NDEFReader();
      await ndef.scan();
      console.log("> NFC Scan started");
      ndef.addEventListener("readingerror", () => {
        console.log("Argh! Cannot read data from the NFC tag. Try another one?");
      });

      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        console.log(`> Serial Number: ${serialNumber}`);
        console.log(`> Records: (${message.records.length})`);
      });
    }
  } catch (error) {
    console.log("Argh! " + error);
  }
}
