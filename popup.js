
// popup.js
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('hideRows', function(data) {
      document.getElementById('toggleHiding').checked = data.hideRows !== false;
    });
  
    document.getElementById('toggleHiding').addEventListener('change', function(e) {
      const hideRows = e.target.checked;
      chrome.storage.local.set({ hideRows: hideRows });
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { hideRows: hideRows });
      });
    });
  });