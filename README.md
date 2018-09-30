# 1.安装shadowsocks client
## macos & linux
### 安装shadowsocks client
```
pip install shadowsocks
```

#### config file

```
# cat /etc/shadowsocks.json
{
        "server":"SHADOWSOCKS-SERVER-IP",
        "server_port": PORT,
        "local_address": "127.0.0.1",
        "local_port": 1080,
        "password":"PASSWORD",
        "timeout":300,
        "method":"aes-256-cfb"
}
```
- SHADOWSOCKS-SERVER-IP:服务器的IP地址
- PORT：端口
- PASSWORD:密码

#### 启动

```
sslocal -c /etc/shadowsocks.json -d start
```

## windows

### 安装shadowsocks client
> 下载地址：https://github.com/shadowsocks/shadowsocks-windows/releases/download/4.1.2/Shadowsocks-4.1.2.zip

- 下载之后解压运行压缩包里面的Shadowsocks.exe

- 按照如下配置服务器

```
服务器地址:SHADOWSOCKS-SERVER-IP
服务器端口:PORT
密码:PASSWORD
加密:aes-256-cfb
```

- 可以设置开机自启动

# 2.安装shadow-chrome 插件

## 下载插件代码

```
git clone https://github.com/cao19881125/shadow-chrome.git
```

## 加载插件
- 打开chrome浏览器，输入chrome://extensions/
- 点击：加载已解压的扩展程序
- 选择shadow-chrome目录，确定


# 3.使用说明
- 点击chrome浏览器右上角的飞机图标，打开shadow-chrome
- 默认本地socks代理地址为127.0.0.1:1080，为上面运行shadowsocks client配置的本地代理地址，可以根据上面的配置自己修改
- 也可以在其他主机上运行shadowsocks client，只要本机能访问到的地方均可，此处配置shadowsocks client的运行地址即可
- 点击连接按钮即开始代理
- 默认使用gfw的黑名单确定域名是否走代理，由底部的代理状态可以看出来，当前页面的域名是否走代理
- 可以手动更改其代理状态
- 若选中全局代理，则所有域名均走代理
