let windowScript = document.createElement('script');
windowScript.src = chrome.runtime.getURL('script.js');
(document.head || document.documentElement).appendChild(windowScript);
