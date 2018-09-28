 var bkg = chrome.extension.getBackgroundPage();
var lastCallTimestamp = 0;
var lastCallId = 0;
 
function dnsDomainIs(host, pattern) {
  return host.length >= pattern.length && (host === pattern || host.substring(host.length - pattern.length - 1) === '.' + pattern);
}



 
 

