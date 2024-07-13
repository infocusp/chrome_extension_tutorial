document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("chooseFirstN")
    .addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "CLASSIFY_FIRST_N_IMAGES",
        });
      });
    });

  document.getElementById("resetAll").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "REMOVE_EXTENSION_TEXTS" });
    });
  });
});
