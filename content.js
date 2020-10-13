/* let jquery = document.createElement('script');
jquery.src = chrome.runtime.getURL('jquery.js');
(document.head || document.documentElement).appendChild(jquery); */


let windowScript = document.createElement('script');
windowScript.src = chrome.runtime.getURL('script.js');
(document.head || document.documentElement).appendChild(windowScript);

/* document.addEventListener('keypress', function (e) {
   if (e.key === 'w') {
      //throw new Error(1)
   }
}); */

/* chrome.extension.onMessage.addListener(function (response, sender, sendResponse) {

}) */


