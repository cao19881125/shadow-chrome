Chrome插件，支持socks5协议和http协议代理设置，GFW自动更新默认黑名单走代理，可手动设置需要的域名走代理或者直通
# 安装shadow-chrome 插件

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
- shadow-chrome图标有三种颜色，分别为：
    - 黑色：未连接状态
    - 黄色：连接-不走代理状态
    - 绿色：连接-走代理状态
