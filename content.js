
// content.js
let hideRowsEnabled = true;
let debounceTimeout = null;

function findParentTR(element) {
  let current = element;
  while (current && current.tagName !== 'TR' && current.tagName !== 'BODY') {
    current = current.parentElement;
  }
  return current && current.tagName === 'TR' ? current : null;
}

function toggleRowVisibility(show) {
  console.log('Checking for disabled buttons...');
  
  // Find all buttons with the disabled class
  const inactiveButtons = document.querySelectorAll('button.arco-btn-disabled');
  console.log(`Found ${inactiveButtons.length} disabled buttons`);

  inactiveButtons.forEach(button => {
    const row = findParentTR(button);
    if (row) {
      row.style.display = show ? '' : 'none';
      console.log(`${show ? 'Showing' : 'Hiding'} row for button:`, button);
    }
  });
}

function debounceUpdate() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (hideRowsEnabled) {
      toggleRowVisibility(false);
    }
  }, 500); // Wait for 500ms after last mutation
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.hideRows !== undefined) {
    hideRowsEnabled = request.hideRows;
    if (hideRowsEnabled) {
      toggleRowVisibility(false); // hide rows
    } else {
      toggleRowVisibility(true);  // show rows
    }
  }
});

// Check initial state
chrome.storage.local.get('hideRows', function(data) {
  hideRowsEnabled = data.hideRows !== false;
  toggleRowVisibility(!hideRowsEnabled);
});

// Create a more comprehensive observer for dynamic content
const observer = new MutationObserver((mutations) => {
  // Check if any of the mutations are relevant
  const hasRelevantChanges = mutations.some(mutation => {
    // Check for class changes
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      return true;
    }
    // Check for added nodes
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      return true;
    }
    return false;
  });

  if (hasRelevantChanges) {
    debounceUpdate();
  }
});

// Observe everything that might change
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class'] // Only watch for class changes
});

// Also run on any navigation changes (for single-page apps)
window.addEventListener('popstate', debounceUpdate);
window.addEventListener('hashchange', debounceUpdate);

// Initial check after page load
window.addEventListener('load', () => {
  debounceUpdate();
});