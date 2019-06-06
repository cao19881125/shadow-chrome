
init();
function init() {


    refresh_conbtn_state()

    if(localStorage['gfw_wlist'] == null ||
        localStorage['gfw_blist'] == null){
        refresh_gfw_list()
    }else {
        refresh_current_domain();
    }

    if(localStorage['my_blist'] == null){
        localStorage['my_blist'] = ''
    }

    if(localStorage['my_wlist'] == null){
        localStorage['my_wlist'] = ''
    }



    refresh_ip_port_input();
    refresh_global_switch();

}

function refresh_global_switch() {


    var is_global_proxy = false
    if(localStorage['global-proxy'] != null &&
        localStorage['global-proxy'] == '1'){
        is_global_proxy = true
    }

    if(is_global_proxy){
        $('#global-switch').bootstrapSwitch('state', true, true);
        $("#radio-div").css('display','none');
    }else{
        $('#global-switch').bootstrapSwitch('state', false, false);
        $("#radio-div").css('display','');
    }



}

function refresh_current_domain() {

    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
        function(tabs){
            pageurl = tabs[0].url.split("/");
            var currentdomain =  pageurl[2];


            $('#domain-input').val(currentdomain);

            refresh_proxy_state();


        }


    );
}



function dnsDomainIs(host, pattern) {
    return host.length >= pattern.length && (host === pattern || host.substring(host.length - pattern.length - 1) === '.' + pattern);
};

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

function show_msg(success,msg) {

    var bgcolor = null
    if(success){
        bgcolor = 'greenyellow'
    }else {
        bgcolor = 'red'
    }

    $('#msg-label').css('display','')

    $('#msg-label').css('background',bgcolor)

    $('#msg-label').text(msg)

    //setTimeout("$('#msg-label').css('display','none')", 2000 )
}

//chrome.runtime.onStartup.addListener(function(){ init();});
// bind event for connectbtn
if( $("#connectbtn").length ){
    document.getElementById('connectbtn').addEventListener('click', function() {

        localStorage['connected']=1;
        refresh_conbtn_state()


        console.log($('#input-ip').val())

        if($('#input-ip').val().length <= 0){
            show_msg(false,'请填写IP')
        }

        if($('#input-port').val().length <= 0){
            show_msg(false,'请填写Port')
        }

        localStorage['socks-ip'] = $('#input-ip').val()
        localStorage['socks-port'] = $('#input-port').val()

        connect();

        refresh_ip_port_input();

        refresh_proxy_state()
    });
}


//bind action for disconnect button
if( $("#disconnect").length ){
    document.getElementById('disconnect').addEventListener('click', function() {

        localStorage['connected']=0;
        refresh_conbtn_state()
        removeProxy();

        refresh_ip_port_input();

        refresh_proxy_state()
    });
}

if( $("#refresh-gfw-btn").length ){
    document.getElementById('refresh-gfw-btn').addEventListener('click', function() {

        refresh_gfw_list()
    });
}


$('#radio-direct').click(function () {


    var current_domain = $('#domain-input').val();
    if(current_domain.indexOf("www.")==0){
        current_domain = current_domain.replace("www.","");
    }

    var my_black_array = localStorage['my_blist'].length==0?new Array():localStorage['my_blist'].split(',');
    var n = my_black_array.indexOf(current_domain);
    if(n >= 0){
        my_black_array.splice(n,1)
        localStorage['my_blist'] = my_black_array.toString()
    }else {
        if(localStorage['gfw_blist'].indexOf(current_domain) < 0){
            return
        }

        var my_white_array = localStorage['my_wlist'].length==0?new Array():localStorage['my_wlist'].split(',');
        if(my_white_array.indexOf(current_domain) >= 0){
            return
        }
        my_white_array.push(current_domain);
        localStorage['my_wlist'] = my_white_array.toString();
    }

    refresh_final_black_list();

    if(localStorage['connected']>0 ){
        setproxy()
    }

    seticon_by_proxy_state(true)

});

$('#radio-proxy').click(function () {

    console.log('radio-proxy clicked')

    var current_domain = $('#domain-input').val();
    if(current_domain.indexOf("www.")==0){
        current_domain = current_domain.replace("www.","");
    }

    var my_white_array = localStorage['my_wlist'].length==0?new Array():localStorage['my_wlist'].split(',');
    var n = my_white_array.indexOf(current_domain);
    if(n >= 0){
        my_white_array.splice(n,1);
        localStorage['my_wlist'] = my_white_array.toString()
    }else {
        if(localStorage['gfw_blist'].indexOf(current_domain) >= 0){
            return
        }


        var my_black_array = localStorage['my_blist'].length==0?new Array():localStorage['my_blist'].split(',');
        if(my_black_array.indexOf(current_domain) >= 0){
            return
        }
        my_black_array.push(current_domain);
        localStorage['my_blist'] = my_black_array.toString()

    }

    console.log(my_black_array)

    refresh_final_black_list();

    if(localStorage['connected']>0 ){
        setproxy()
    }

    seticon_by_proxy_state(false)
});


$('#global-switch').on('switchChange.bootstrapSwitch',function (event,state) {

    //console.log('bootstrapSwitch' + state)
    if(state){
        localStorage['global-proxy'] = 1
    }else {
        localStorage['global-proxy'] = 0
    }

    refresh_global_switch()

    if(localStorage['connected']>0 ){
        setproxy()


        refresh_proxy_state()

    }


});


function seticon_by_proxy_state(is_direct) {

    if(localStorage['connected'] ==null ||
        localStorage['connected'] == 0){
        chrome.browserAction.setIcon({
            path: "icon.png"
        });

        return
    }

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

function refresh_proxy_state() {

    if(localStorage['global-proxy'] >0){
        seticon_by_proxy_state(false);
        return
    }

    var current_domain = $('#domain-input').val();

    var is_proxy = is_domain_proxy(current_domain);



    if(is_proxy){
        $('#radio-proxy').attr('checked', 'checked');
        seticon_by_proxy_state(false)
    }else {
        $('#radio-direct').attr('checked', 'checked');
        seticon_by_proxy_state(true)
    }
}

function refresh_ip_port_input() {


    if(localStorage['socks-ip'] &&
        localStorage['socks-ip'].length >= 7){
        $('#input-ip').val(localStorage['socks-ip'])

    }

    if(localStorage['socks-port'] &&
        localStorage['socks-port'].length >= 0){
        $('#input-port').val(localStorage['socks-port'])
    }

    if(localStorage['connected']>0 ){
        $('#input-ip').attr("disabled", true);
        $('#input-port').attr("disabled", true);
    }else {
        $('#input-ip').attr("disabled", false);
        $('#input-port').attr("disabled", false);
    }
}

function refresh_conbtn_state() {
    if( localStorage['connected']>0 ) {
        $('#connectbtn').attr("disabled", true);
        $('#disconnect').attr("disabled", false);
    }else {
        $('#connectbtn').attr("disabled", false);
        $('#disconnect').attr("disabled", true);
    }
}


function extrace_domain(str) {
    result_str = str
    if (result_str.startWith('||')){
        result_str = result_str.slice(2)
    }else if(result_str.startWith('|')){
        result_str = result_str.slice(1)
    }else if(result_str.startWith('.')){
        result_str = result_str.slice(1)
    }

    if(result_str.startWith('http://')){
        result_str = result_str.slice(7)
    }else if(result_str.startWith('https://')){
        result_str = result_str.slice(8)

    }

    if(result_str.startWith('*.')){
        result_str = result_str.slice(2)
    }else if(result_str.startWith('*')){
        result_str = result_str.slice(1)
    }

    result_str = result_str.split('/')[0]
    return result_str



}

function refresh_final_black_list() {

    var final_blist = new Array();

    if(localStorage['gfw_blist'] == null){
        localStorage['final_blist'] = final_blist.toString();
        return
    }


    var gfw_blist_array = localStorage['gfw_blist'].split(',');
    var my_blist_array = localStorage['my_blist'].length==0?new Array():localStorage['my_blist'].split(',');
    var my_wlist_array = localStorage['my_wlist'].length==0?new Array():localStorage['my_wlist'].split(',');

    for(n in gfw_blist_array){
        if(my_wlist_array.indexOf(gfw_blist_array[n]) < 0){
            final_blist.push(gfw_blist_array[n])
        }
    }


    for(n in my_blist_array){
        if(final_blist.indexOf(my_blist_array[n]) < 0){
            final_blist.push(my_blist_array[n])
        }
    }

    localStorage['final_blist'] =final_blist.toString()

    return final_blist.toString()

}

String.prototype.startWith = function(compareStr){
    return this.indexOf(compareStr) == 0;
}

function refresh_gfw_list() {
    
    function parse_result(data) {
        //console.log(data)
        var b = new Base64();
        var gfw_result = b.decode(data)
        //console.log(gfw_result)

        var lines = gfw_result.split('\n')

        var black_list = []
        var white_list = []

        for(n in lines){
            var line = lines[n]
            if (line == null ||
                line.startWith('!') ||
                line.startWith('[') ||
                line.length == 0 ){
                continue;
            }

            if (line.startWith('@@')){
                result_domain = extrace_domain(line.slice(2))
                if (result_domain){
                    white_list.push(result_domain)
                }
            }else if(line.startWith('/') ||
                line.indexOf('.*') >=0 ) {
                continue
            }else {
                result_domain = extrace_domain(line)
                if (black_list.indexOf(result_domain) < 0){
                    black_list.push(result_domain)
                }

            }
        }




        localStorage['gfw_wlist'] = white_list.toString();
        localStorage['gfw_blist'] = black_list.toString();
        //localStorage['gfw_blist'] = 'google.com,youtube.com,facebook.com'

        show_msg(true,'GFW更新成功')

        refresh_current_domain()

        refresh_final_black_list()
    }
    
    $.ajax({
        url: 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
        type: "GET", /* or type:"GET" or type:"PUT" */
        success: function (data, textStatus, response) {
            parse_result(data)

        },
        error: function (result) {
            console.log(result);
        }
    });
}


function removeProxy(){

    var config = {
        mode: "system"
    };

    chrome.proxy.settings.set(
        {value: config, scope: 'regular'},
        function() {});


}



function connect(){


    setproxy()


}

function format_str2pac_list(array_str) {

    var domain_array = array_str.split(',');

    var result_str = ''
    for(item in domain_array){
        result_str += "'" + domain_array[item] + "'";
        if(item < domain_array.length - 1){
            result_str += ','
        }
    }
    return result_str
}

function setproxy(){

    final_blk_str = format_str2pac_list(localStorage['final_blist'])
    

    setChromeProxy(final_blk_str);



// set pac


}


function setChromeProxy(final_blk_str){


    // var proxy_str = 'SOCKS5 ' + localStorage['socks-ip'] + ':' + localStorage['socks-port'] + '; ' +
    //                 'SOCKS ' + localStorage['socks-ip'] + ':' + localStorage['socks-port'] + '; DIRECT;';

    var proxy_str = 'PROXY ' + localStorage['socks-ip'] + ':' + localStorage['socks-port'];

    var global_proxy_str = ""
    if(localStorage['global-proxy'] != null &&
        localStorage['global-proxy'] == '1'){
        global_proxy_str = "return PROXY;\n"
    };



    var config = {
        mode: "pac_script",
        pacScript: {
            data: "function dnsDomainIs(host, pattern) {return host.length >= pattern.length && (host === pattern || host.substring(host.length - pattern.length - 1) === '.' + pattern);};\n"+
            "function FindProxyForURL(url, host) {\n"+
            "var PROXY = '" + proxy_str + "'\n"+
            "var DEFAULT = 'DIRECT';\n"+
            "if (dnsDomainIs(host, \".cn\")||dnsDomainIs(host,\".local\")||/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i.test(host)){ return DEFAULT; }\n"+

            global_proxy_str +

            "var proxy_domains=["+final_blk_str+"];\n"+
            "for(i = 0; i < proxy_domains.length; i++) {\n"+
            "  if(dnsDomainIs(host,proxy_domains[i]) ) { \n"+
            "    return PROXY; \n"+
            "  }\n"+
            " }\n"+

            " return DEFAULT;\n"+
            "}\n"
        }
    };


    chrome.proxy.settings.set( {value: config, scope: 'regular'},function() {

    });

}





