 var bkg = chrome.extension.getBackgroundPage();
var lastCallTimestamp = 0;
var lastCallId = 0;
 
function dnsDomainIs(host, pattern) {
  return host.length >= pattern.length && (host === pattern || host.substring(host.length - pattern.length - 1) === '.' + pattern);
}

 function is_domain_proxy(domain) {

     var gwf_blkstr = localStorage['final_blist'];

     blk_array = gwf_blkstr.split(',');

     for(n in blk_array){
         if(dnsDomainIs(domain,blk_array[n])){
             return true
         }
     }

     return false
 }

 function seticon_by_proxy_state(is_direct) {


     if(is_direct){
         chrome.browserAction.setIcon({
             path: "icon-direct.png"
         });
     }else {
         chrome.browserAction.setIcon({
             path: "icon-proxy.png"
         });
     }



 }

 function set_icon_by_tab(tab) {
     if( localStorage['connected']>0 ){
         var domaintmp = tab.url.split("/");
         var domain = domaintmp[2];
         if(domain.indexOf("www.")==0){
             domain = domain.replace("www.","");
         }

         if(localStorage['global-proxy'] != null &&
             localStorage['global-proxy'] == '1'){
             seticon_by_proxy_state(false);
             return;
         }

         if(is_domain_proxy(domain)){
             seticon_by_proxy_state(false);
         }else {
             seticon_by_proxy_state(true);
         }

     }
 }

 chrome.tabs.onActivated.addListener(function(activeInfo) {
     // how to fetch tab url using activeInfo.tabid
     chrome.tabs.get(activeInfo.tabId, function(tab){
       set_icon_by_tab(tab)


     });
 });



 chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
     set_icon_by_tab(tab)
     
 });

 // chrome.tabs.onActivated.addListener(function(activeInfo) {
 //     // how to fetch tab url using activeInfo.tabid
 //     chrome.tabs.get(activeInfo.tabId, function(tab){
 //         if( localStorage['connected']>0 ){
 //             var domaintmp = tab.url.split("/");
 //             var domain = domaintmp[2];
 //             if(domain.indexOf("www.")==0){
 //                 domain = domain.replace("www.","");
 //             }
 //             var isSSL = 0;
 //             auto_black = localStorage['localbldomain'].split("\n");
 //             for(i = 0; i < auto_black.length; i++) {
 //                 if( auto_black[i].length<3) continue;
 //                 if( dnsDomainIs(domain,auto_black[i] ) ){
 //                     isSSL =1;
 //                     break;
 //                 }
 //             }
 //             if(localStorage['globalssl'] >0)isSSL=1;
 //
 //             if(isSSL>0){
 //                 chrome.browserAction.setIcon({
 //                     path: "icon-ok-go.png"
 //                 });
 //             }else{
 //
 //                 chrome.browserAction.setIcon({
 //                     path: "icon-ok.png"
 //                 });
 //
 //             }
 //         }
 //
 //     });
 // });
 
 

