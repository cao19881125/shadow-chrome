

function init() {
    refresh_conbtn_state()

    if(localStorage['gfw_wlist'] == null ||
        localStorage['gfw_blist'] == null){
        refresh_gfw_list()
    }

    if(localStorage['my_blist'] == null){
        localStorage['my_blist'] = ''
    }

    if(localStorage['my_wlist'] == null){
        localStorage['my_wlist'] = ''
    }
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

    });
}


//bind action for disconnect button
if( $("#disconnect").length ){
    document.getElementById('disconnect').addEventListener('click', function() {

        localStorage['connected']=0;
        refresh_conbtn_state()
        removeProxy();
    });
}

if( $("#refresh-gfw-btn").length ){
    document.getElementById('refresh-gfw-btn').addEventListener('click', function() {

        refresh_gfw_list()
    });
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

        show_msg(true,'更新成功')
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

    var gfw_blk_str = localStorage['gfw_blist'];
    var my_blk_str = localStorage['my_blist'];
    var my_wte_str = localStorage['my_wlist'];

    gfw_blk_str = format_str2pac_list(localStorage['gfw_blist'])
    

    setChromeProxy(gfw_blk_str,'','');



// set pac


}


function setChromeProxy(gfw_blk_list,my_blk_list,my_wte_list){





    var config = {
        mode: "pac_script",
        pacScript: {
            data: "function dnsDomainIs(host, pattern) {return host.length >= pattern.length && (host === pattern || host.substring(host.length - pattern.length - 1) === '.' + pattern);};\n"+
            "function FindProxyForURL(url, host) {\n"+
            "var PROXY = 'SOCKS5 192.168.184.128:1080; SOCKS 192.168.184.128:1080; DIRECT;'\n"+
            "var DEFAULT = 'DIRECT';\n"+
            "if (dnsDomainIs(host, \".cn\")||dnsDomainIs(host,\".local\")||/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i.test(host)){ return DEFAULT; }\n"+

            "var proxy_domains=["+gfw_blk_list+"];\n"+
            "for(i = 0; i < proxy_domains.length; i++) {\n"+
            "  if(dnsDomainIs(host,proxy_domains[i]) ) { \n"+
            "    return PROXY; \n"+
            "  }\n"+
            " }\n"+

            " return DEFAULT;\n"+
            "}\n"
        }
    };


    console.log(config.pacScript.data)

    chrome.proxy.settings.set( {value: config, scope: 'regular'},function() {

    });

}



init()

