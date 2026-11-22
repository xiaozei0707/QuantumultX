/*
 *
 *
#!name= 网易云svip会员（完全免费不要到处分享）
#!desc= 共享网易云svip会员 完全免费不要到处分享 失效群内反馈频道
#!author=暗夜[https://t.me/IPAs_share] 
#!homepage = https://apps.apple.com/app/id590338362
#!icon= https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2d/e8/1b/2de81bfd-29a0-d067-63c3-38315cc1661a/AppIcon-1x_U007emarketing-0-9-0-0-85-220-0.png/460x0w.webp
#!date = 2025-11-10 00:00:00
#===================================
#⚠️【免责声明】
#-----------------------------------
#1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
#2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
#3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
#4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
#5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
#6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
#7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。

[Rule]
DOMAIN,iadmat.nosdn.127.net,REJECT
DOMAIN,iadmatapk.nosdn.127.net,REJECT
DOMAIN,iadmusicmat.music.126.net,REJECT
DOMAIN,iadmusicmatvideo.music.126.net,REJECT
DOMAIN,ipv4.music.163.com,REJECT
DOMAIN,ipv6.music.163.com,REJECT

[Rewrite]
^https?://interface.*\.music\.163\.com/eapi/ad/get reject
^https?://interface.*\.music\.163\.com/eapi/ad/config/get reject
^https?://interface.*\.music\.163\.com/eapi/ad/iyunIds reject
^https?://interface.*\.music\.163\.com/eapi/ad/prefetch/select reject
^https?://interface.*\.music\.163\.com/eapi/ad/loading/current reject

^https?:\/\/interface\d?\.music\.163\.com\/e?api\/(ocpc\/)?ad\/ mock-response-body data-type=text
^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:delivery\/(batch-)?deliver|moment\/tab\/info\/|side-bar\/mini-program\/music-service\/account|yunbei\/account\/entrance\/) reject-dict
^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:community\/friends\/fans-group\/artist\/group\/|mine\/applet\/redpoint|music\/songshare\/text\/recommend\/|resniche\/position\/play\/new\/|resniche\/tspopup\/show|resource\/comments?\/musiciansaid\/|user\/sub\/artist) reject-dict
^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:ios\/version|mlivestream\/entrance\/playpage\/|link\/position\/show\/strategy|link\/scene\/show\/resource|v1\/content\/exposure\/comment\/banner\/) reject-dict
^https?:\/\/interface\d?\.music\.163.com\/w?e?api\/search\/default mock-response-body data-type=text
^https?:\/\/interface\d?\.music\.163\.com\/w?eapi\/(?:activity\/bonus\/playpage\/time\/query|resource-exposure\/|search\/(?:chart\/|rcmd\/keyword\/|specialkeyword\/)) reject-dict
^https:\/\/interface\d\.music\.163\.com\/eapi\/my\/podcast\/tab\/recommend reject-dict

[Script]
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/playermode\/ script-path=https://he2o.vercel.app/Resource/-Rewrite/anyehttp/wyy-s.js, timeout=60, tag=皮肤
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/search\/(?:complex\/page|complex\/rec\/song\/get|song\/list\/page) script-path=https://he2o.vercel.app/Resource/-Rewrite/anyehttp/wyy-s.js, timeout=60, tag=歌曲、听书
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/v3\/song\/detail script-path=https://he2o.vercel.app/Resource/-Rewrite/anyehttp/wyy-s.js, timeout=60, tag=歌曲、听书
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/song\/(?:chorus|enhance\/|play\/|type\/detail\/get) script-path=https://he2o.vercel.app/Resource/-Rewrite/anyehttp/wyy-s.js, timeout=60, tag=歌曲、听书
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:v1\/artist\/top\/song|v3\/discovery\/recommend\/songs) script-path=https://he2o.vercel.app/Resource/-Rewrite/anyehttp/wyy-s.js, timeout=60, tag=歌曲、听书
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/vipnewcenter\/app\/resource\/newaccountpage script-path=https://he2o.vercel.app/Resource/-Rewrite/anyehttp/wyy-s.js, timeout=60, tag=等级
http-request ^https?:\/\/interface\d?\.music\.163\.com\/w?e?api\/(homepage\/|v6\/)?playlist\/(?!(?:delete|subscribe|unsubscribe)) script-path=https://he2o.vercel.app/Resource/-Rewrite/anyehttp/wyy-s.js, timeout=60, tag=首页歌单
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/vipauth\/app\/auth\/(soundquality\/)?query script-path=https://he2o.vercel.app/Resource/-Rewrite/anyehttp/wyy-s.js, timeout=60, tag=音质

[Mitm]
hostname = interface*.music.163.com
*
*
*/






var WYYHeaders = $request.headers;
WYYHeaders['cookie'] = 'MUSIC_U=006378DC42B50D73F6EE497BC7F5AE9E6D149654BDFC9440238830821E2211B415F49C90A8744AC1ECE4F5E70177BA8952BFE1BED1B8DBE9802C196F25AED54B2CA77DF2B85BF86068E4214C2F7C78D1F47ABD164E8AA14679249671C3C1AB7C8F94810F17924332B23223E2E3629B7140B916385045E67B2AAE26CCA48E7A80C40CAA3959E6E98A282666829AEC20BA393E1A317F7ECD79354F22B12CAAF9CE2545FFCF1FD9B4D15E2C82DE3B1FACCE25E86AFB8D13B3926A39E18342EAE59017A5524D6E13A5EAD080AA0CF124F33DD5C5CBBB72A18D42285536E87C3819A5D546E3213A90D3DFD894AEE842299AE27AFD671DF31D5554E6A9BE50F007C306F2D09B1CCBEFB3318D461E32AC3387532EBF68949F626FD0F442C533BDD018EC54BDE47C369A42DFCAA3D0F27E9BBE5A1E58190458ABEDED9E65E928464E637C0632F1321407FE8648FEBB834ACBA1CE7179A1378BD341A5B3A69FF1FC7A76F425; caid={"lastIyunId":"ffc023aae144c9f62a4689f87b2c5327","iyunId":"b644be4da92a059cd896a49faaa7083d","iyunVersion":"20260506","lastIyunVersion":"20250325"}; buildver=7724; sDeviceId=e423f1fcdadc4964a3f80e44b91f033f; channel=distribution; idfa=; packageType=release; appver=9.6.30; deviceId=e423f1fcdadc4964a3f80e44b91f033f; EVNSM=1.0.0; os=iPhone OS; osver=27.0.1; machineid=iPhone16.1; NMCID=xhghpp.1758879024000.01.3; appkey=IuRPVVmc3WWul9fT; idfv=D827DBE4-7521-45D4-BD57-4937B3581151; URS_APPID=384E118E5777D990FA867B065429297263A9FCDB7BB7DFFA8D0F0633B75188199CC2821647BBF7FC67D9350F9678A060; NMDI=Q1NKTQcBDABPhdC%2FZYg5Imep0EFoAAAAgMakEEQSNmRDGHDKekjw6Bn0%2FUn6Zlijr2NKqmzdO6z3slyu1sQlyiR4XpmE%2BuDsHJMmNpTrUJmRO9JnwCZvA7wUAhu40FKPuHNhwQHDvd67CSSizDYAmVvMzwZmAETu3%2Bi08W9rbow%3D; NMTID=00O7vEqffezV731ykmkrR0fHoR0faUAAAGiAY-5SQ; ntes_kaola_ad=1; __csrf=8613e85c705599e1afbd4061a3d52098; JSESSIONID-WYYY=bYa0h%5CZMKCcnCKvwnT%5CdRcOvJe%2B4hH5ukbx7CGRhpQVjQbyY6GSTYChYbqdzOXHPRVOtbRJBIa8DgMiJPgiSXJgE%5CzZBIQedCGZiHkqfondTrNt7MZqhg8DPWfluTIAhC5E6BqSQRKjnnA9agKn7%5CMIQDdszgne2Z1T2YwNjM9sHQ%2Fkx%3A1795322979116; _iuqxldmzr_=33; WEVNSM=1.0.0; WNMCID=puglge.1792672184316.01.0; _ntes_nnid=1a14300f362cd7c5d0b7a727288a4e51,1781841344962; _ntes_nuid=1a14300f362cd7c5d0b7a727288a4e51';

$done({headers : WYYHeaders});
