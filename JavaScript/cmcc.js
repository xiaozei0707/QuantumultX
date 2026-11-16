/**
 * 中国移动 · 中国移动 APP「签到赢好礼」每日签到
 *
 * 抓取:先划掉后台的「中国移动」APP 再重新打开 → 进「签到赢好礼」点一次签到,自动抓登录凭证 + 积分信封 + 签到标识
 * 签到:cron 每天自动用登录凭证静默续登并签到,顺带查积分;凭证长期有效,免短信
 *
 * 2026-11-16 修复:
 *   1) APP 端(client.app)协议密钥会随版本轮换 —— 现在登录信封/响应改为「多密钥组」探测,
 *      自动依次试 app 组、biz 组、以及 BoxJS 里 cmcc_keys 自定义组(JSON 数组),
 *      不再一换密钥就整体失效;日志会直接告诉你哪一组可用。
 *   2) 新增「查积分」抓取作为登录信封的备用来源(该接口一直是 biz 组密钥,能解出完整信封)。
 *   3) 签到不再强依赖 APP 端:同时抓 h5.bj.10086.cn/ActSignIn2023/{getSignIn|doPrize} 的 token,
 *      APP 续登不可用时自动走 H5 直签(getSignIn 查状态 → doPrize 签到),已签则跳过。
 *   4) 抓取时顺带保存会话 cookie(JSESSIONID/UID/ticketID),续登失败也能查积分。
 *
 * @Author: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Channel: Telegram 频道 https://t.me/mayihei
 * @Version: 2026-11-16.r13
 * @Updated: 2026-11-16
 *
 * ===== Loon =====
 * [MITM]
 * hostname = client.app.coc.10086.cn, clientaccess.10086.cn, h5.bj.10086.cn
 * [Script]
 * request if ${url} ~= /^https:\/\/client\.app\.coc\.10086\.cn\/biz-orange\/[LD]N\/uam(onekey|randcode)login\/autoLogin/i then script("https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js") with tag="中国移动 Cookie", img_url="https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/cmcc.png", requires_body=true
 * request if ${url} ~= /^https:\/\/clientaccess\.10086\.cn\/biz-orange\/BN\/scoreQueryService\/getScoreQuery/i then script("https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js") with tag="中国移动 Cookie", img_url="https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/cmcc.png", requires_body=true
 * request if ${url} ~= /^https:\/\/h5\.bj\.10086\.cn\/ActSignIn2023\/(getSignIn|doPrize)/i then script("https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js") with tag="中国移动 Cookie", img_url="https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/cmcc.png"
 * cron "20 8 * * *" then script("https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js") with tag="中国移动签到", img_url="https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/cmcc.png"
 *
 * ===== Surge =====
 * [MITM]
 * hostname = %APPEND% client.app.coc.10086.cn, clientaccess.10086.cn, h5.bj.10086.cn
 * [Script]
 * 中国移动 Cookie = type=http-request,pattern=^https:\/\/client\.app\.coc\.10086\.cn\/biz-orange\/[LD]N\/uam(onekey|randcode)login\/autoLogin,requires-body=true,max-size=0,script-path=https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/cmcc.png
 * 中国移动 Cookie 2 = type=http-request,pattern=^https:\/\/clientaccess\.10086\.cn\/biz-orange\/BN\/scoreQueryService\/getScoreQuery,requires-body=true,max-size=0,script-path=https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/cmcc.png
 * 中国移动 Cookie 3 = type=http-request,pattern=^https:\/\/h5\.bj\.10086\.cn\/ActSignIn2023\/(getSignIn|doPrize),requires-body=false,max-size=0,script-path=https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/cmcc.png
 * 中国移动签到 = type=cron,cronexp=20 8 * * *,timeout=60,script-path=https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/cmcc.png
 *
 * ===== Quantumult X =====
 * [MITM]
 * hostname = client.app.coc.10086.cn, clientaccess.10086.cn, h5.bj.10086.cn
 * [rewrite_local]
 * ^https:\/\/client\.app\.coc\.10086\.cn\/biz-orange\/[LD]N\/uam(onekey|randcode)login\/autoLogin url script-request-body https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js
 * ^https:\/\/clientaccess\.10086\.cn\/biz-orange\/BN\/scoreQueryService\/getScoreQuery url script-request-body https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js
 * ^https:\/\/h5\.bj\.10086\.cn\/ActSignIn2023\/(getSignIn|doPrize) url script-request-header https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js
 * [task_local]
 * 20 8 * * * https://raw.githubusercontent.com/xiaozei0707/QuantumultX/refs/heads/main/JavaScript/cmcc.js, tag=中国移动签到, img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/cmcc.png, enabled=true
 *
 * ===== Stash =====
 * cron:
 *   script:
 *     - name: 中国移动签到
 *       cron: '20 8 * * *'
 *       timeout: 60
 * http:
 *   mitm:
 *     - "client.app.coc.10086.cn"
 *     - "clientaccess.10086.cn"
 *     - "h5.bj.10086.cn"
 *   script:
 *     - match: ^https:\/\/client\.app\.coc\.10086\.cn\/biz-orange\/[LD]N\/uam(onekey|randcode)login\/autoLogin
 *       name: 中国移动 Cookie
 *       type: request
 *       require-body: true
 *     - match: ^https:\/\/clientaccess\.10086\.cn\/biz-orange\/BN\/scoreQueryService\/getScoreQuery
 *       name: 中国移动 Cookie 2
 *       type: request
 *       require-body: true
 *     - match: ^https:\/\/h5\.bj\.10086\.cn\/ActSignIn2023\/(getSignIn|doPrize)
 *       name: 中国移动 Cookie 3
 *       type: request
 *       require-body: false
 */

const $ = new Env("中国移动");

// 签到合集开启「统一通知」时不单独弹通知,结果由签到汇总统一发送
$.merge = typeof $argument === "object" && !!$argument && $argument.merge === true;
if ($.merge) $.msg = (...a) => console.log(a.filter((x) => typeof x === "string" && x).join("\n"));

// 补签入口:请求 http://1.1.1.1/checkin/cmcc 时现跑一次签到,跑完把本脚本的签到状态作为响应返回
const CHECKIN_RUN = typeof $request !== "undefined" && /^http:\/\/1\.1\.1\.1\/checkin\//.test($request.url);
if (CHECKIN_RUN) { const end = $.done.bind($); $.done = () => end({ response: { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" }, body: $.getdata("cmcc_status") || "{}" } }); }
const SCRIPT_VERSION = "2026-11-16.r13"; // 改一次 +1,确认拉到最新版
$.log(`[INFO] 脚本版本 ${SCRIPT_VERSION}`);

const K_LOGIN = "cmcc_login";    // 账号数组(JSON 数组,每元素一个账号;单一数据源)
const K_SCORE = "cmcc_score";
const K_CONSTID = "cmcc_constid";
const K_H5 = "cmcc_h5";          // H5 签到 token 池
const K_STATUS = "cmcc_status";

const HOST_LOGIN = "client.app.coc.10086.cn";
const HOST_BIZ = "clientaccess.10086.cn";
const P_AUTOLOGIN = "/biz-orange/LN/uamrandcodelogin/autoLogin";
const P_SCORE = "/biz-orange/BN/scoreQueryService/getScoreQuery";
const P_BIGNET = "/leadeon-abilityopen-biz/BN/obtainToken/getBigNetToken";
const H5_HOST = "h5.bj.10086.cn";
const P_UNITOKEN = "/ActivityUnifyLogin/uniTokenValidateH5";
const P_DOPRIZE = "/ActSignIn2023/doPrize/JT/ActSignIn2023JT";
const P_GETSIGN = "/ActSignIn2023/getSignIn/JT/ActSignIn2023JT";
const SIGN_SRCID = "026033";
const SIGN_H5URL = "https://h5.bj.10086.cn/cmcc_app/checkin/index.html#/index";
const H5_REFERER = "https://h5.bj.10086.cn/cmcc_app/checkin/index.html";
const H5_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/wkwebview leadeon/12.1.2/CMCCIT";
const SALT = "Leadeon/SecurityOrganization";
const LK = "tVkdaRWRY0ZkV1Vr", LSK = "RYV0hCV1lV25KYVJ", LIV = "VjFSQ1ZtVkQxRTlQ";
const BK = "bAIgvwAuA4tbDr9d", BSK = "GS7VelkJl5IT1uwQ", BIV = "9791027341711819";
const TK = "bAIgvwAuA4tbDr9d", TIV = "9791027341711819";

const ARG = typeof $argument === "object" && $argument ? $argument : {};
const DEBUG = ARG.debug === true || ARG.debug === "true" || $.getdata("cmcc_debug") === "true";

// 协议密钥组:APP 端(client.app)与营业厅端(clientaccess)各一套,服务端会随 APP 版本轮换。
// 想换密钥不用改脚本:BoxJS / $argument 里设 cmcc_keys = JSON 数组,例如
//   [{"name":"app-new","reqKey":"16位请求密钥","resKey":"16位响应密钥","iv":"16位偏移"}]
// 抓取和续登会自动依次试,日志会打印命中哪一组。
function buildKeysets() {
  const out = [];
  let custom = null;
  try { custom = JSON.parse($.getdata("cmcc_keys") || "null"); } catch (e) { custom = null; }
  if (typeof ARG.appKey === "string" && typeof ARG.appIv === "string") {
    custom = (Array.isArray(custom) ? custom : []).concat([{ name: "arg-app", reqKey: ARG.appKey, resKey: ARG.appResKey || ARG.appKey, iv: ARG.appIv }]);
  }
  (Array.isArray(custom) ? custom : custom ? [custom] : []).forEach((k) => {
    if (k && k.reqKey && k.iv) out.push({ name: k.name || "custom", reqKey: String(k.reqKey), resKey: String(k.resKey || k.reqKey), iv: String(k.iv) });
  });
  out.push({ name: "app", reqKey: LK, resKey: LSK, iv: LIV });
  out.push({ name: "biz", reqKey: BK, resKey: BSK, iv: BIV });
  return out;
}
const KEYSETS = buildKeysets();
const KS_BIZ = KEYSETS[KEYSETS.length - 1];
let WORK_KS = null; // 续登成功后记住能用的那组,给 getBigNetToken 用

const post = (opt) => new Promise((ok) => $.post(opt, (err, resp, data) => ok({ err, status: resp && resp.status, headers: (resp && resp.headers) || {}, data })));
const httpGet = (opt) => new Promise((ok) => $.get(opt, (err, resp, data) => ok({ err, status: resp && resp.status, headers: (resp && resp.headers) || {}, data })));
const decBiz = (data) => { for (const kv of [[BSK, BIV], [LSK, LIV]]) { try { const x = decStr(data || "", kv[0], kv[1]); if (/^\s*[{[]/.test(x)) return x; } catch (e) {} } return ""; };
const peelJson = (s) => { s = String(s || ""); if (/^\s*[{[]/.test(s)) return s; try { const p = u8s(b64dec(s)); if (/^\s*[{[]/.test(p)) return p; } catch (e) {} return s; };
const maskPhone = (p) => (p && p.length === 11 ? p.slice(0, 3) + "****" + p.slice(7) : p || "");
const saveStatus = (s, msg, asset) => checkinReport(K_STATUS, { s, msg, asset }, { name: "中国移动", author: "MaYIHEI", run: "http://1.1.1.1/checkin/cmcc", open: "https://apps.apple.com/app/id583700738" });
const toJson = (s) => { try { return JSON.parse(s); } catch (e) { return null; } };

// 用所有密钥组尝试解一段密文,返回 {ks, json} 或 null(prefer 组优先;useReq=true 用请求密钥解请求体)
function decAny(data, prefer, useReq) {
  const list = [];
  if (prefer) list.push(prefer);
  for (const ks of KEYSETS) if (!prefer || ks.name !== prefer.name) list.push(ks);
  for (const ks of list) {
    let s = "";
    try { s = decStr(data || "", useReq ? ks.reqKey : ks.resKey, ks.iv); } catch (e) { continue; }
    if (!/^\s*[{[]/.test(s || "")) continue;
    const json = toJson(s);
    if (json) { if (DEBUG) $.log(`[DEBUG] 密钥组命中: ${ks.name}`); return { ks, json }; }
  }
  return null;
}

// 从请求头里抠会话 cookie
function cookieFromHeaders(headers) {
  let raw = "";
  for (const k in headers) if (k.toLowerCase() === "cookie") raw = Array.isArray(headers[k]) ? headers[k].join("; ") : String(headers[k]);
  const pick = (name) => { const m = raw.match(new RegExp(name + "=([^;,\\s]+)")); return m ? name + "=" + m[1] : ""; };
  return ["JSESSIONID", "UID", "ticketID"].map(pick).filter(Boolean).join("; ");
}
const queryOf = (url) => { const o = {}; const q = String(url).split("?")[1] || ""; q.split("&").forEach((kv) => { const i = kv.indexOf("="); if (i > 0) { try { o[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { o[kv.slice(0, i)] = kv.slice(i + 1); } } }); return o; };

// 转发会话 cookie
function pickCookie(headers) {
  let raw = "";
  for (const k in headers) if (k.toLowerCase() === "set-cookie") raw = Array.isArray(headers[k]) ? headers[k].join("; ") : String(headers[k]);
  const pick = (name) => { const m = raw.match(new RegExp(name + "=([^;,\\s]+)")); return m ? name + "=" + m[1] : ""; };
  return ["JSESSIONID", "UID", "ticketID"].map(pick).filter(Boolean).join("; ");
}

function headersFor(host, path, J, sid, qen) {
  const t = String(Date.now()), n = nonce8();
  const o = JSON.parse(J);
  const xk = o.xk || "";
  const ua = "ChinaMobile/" + (o.cv || "12.5.6") + " (iPhone; iOS " + (o.sv || "26.1") + "; Scale/3.00)"; // 跟随抓取时的 App 版本
  const xs = md5hex("https://" + host + path + "_" + J + "_" + SALT);
  const xtoken = encB64(xk + "_" + path + "_" + t + "_" + n, TK, TIV);
  const xsign = md5hex(xtoken + "_" + t + "_" + n + "_" + sid);
  return { "Content-Type": "application/Json", "User-Agent": ua, "x-qen": qen, "x-time": t, "x-nonce": n, "xs": xs, "x-token": xtoken, "x-sign": xsign };
}

// cmcc_login 存账号数组:[{ tel, J(登录信封明文), ksName(命中密钥组), ck(会话 cookie), ckAt, h5:{token,constid,at} }]
// 兼容旧格式(数组里直接是信封字符串)
function loadAccounts() {
  const raw = $.getdata(K_LOGIN);
  if (!raw) return [];
  let p = null;
  try { p = JSON.parse(raw); } catch (e) { p = null; }
  const arr = Array.isArray(p) ? p : p ? [p] : [raw];
  const out = [];
  for (const x of arr) { const a = normAccount(x); if (a) out.push(a); }
  return out;
}
function normAccount(x) {
  if (typeof x === "string") { const tel = telOf(x); return tel ? { tel, J: x } : null; }
  if (x && typeof x === "object") {
    if (x.J) return x;
    if (x.tel) return { tel: x.tel, J: JSON.stringify(x) }; // 容错:存成了整个信封对象
  }
  return null;
}
const saveAccounts = (arr) => $.setdata(JSON.stringify(arr.filter(Boolean)), K_LOGIN);
function upsertAccount(tel, patch) {
  const arr = loadAccounts();
  let acc = arr.find((a) => a.tel === tel);
  if (!acc) { acc = { tel }; arr.push(acc); }
  if (patch) patch(acc);
  saveAccounts(arr);
  return { acc, count: arr.length };
}
const telOf = (J) => { try { return JSON.parse(J).tel || ""; } catch (e) { return ""; } };
const bizFromLogin = (J) => { const lo = JSON.parse(J); return JSON.stringify(Object.assign({}, lo, { reqBody: { cellNum: lo.tel } })); };
function h5Pool() { const p = toJson($.getdata(K_H5) || ""); return Array.isArray(p) ? p.filter(Boolean) : p ? [p] : []; }
function saveH5(rec) {
  const pool = h5Pool().filter((x) => x.token !== rec.token);
  pool.unshift(rec);
  $.setdata(JSON.stringify(pool.slice(0, 6)), K_H5);
  const arr = loadAccounts();
  if (arr.length === 1) { arr[0].h5 = rec; saveAccounts(arr); } // 单账号直接挂到账号上
}

// ---------- 抓取(http-request)----------
function capture() {
  if ($request.method === "OPTIONS") { $.done(); return; }
  try {
    const url = $request.url, body = $request.body || "", hdr = $request.headers || {};
    if (/uam(onekey|randcode)login\/autoLogin/i.test(url)) capLogin(body);
    else if (/scoreQueryService\/getScoreQuery/i.test(url)) capScore(body, hdr);
    else if (/ActSignIn2023\/(getSignIn|doPrize)/i.test(url)) capH5(url);
  } catch (e) {
    $.log("[ERROR] 抓取失败: " + (e.message || e));
    if (DEBUG) $.msg("中国移动", "⚠️ Cookie 抓取失败", String(e.message || e));
  }
  $.done();
}

// 只认真实 11 位手机号;占位号(如 99999999999)一律不收
const isRealTel = (t) => /^1[3-9]\d{9}$/.test(String(t || ""));

// 抓登录包:APP 协议密钥逐组探测,哪组能解开就用哪组
function capLogin(body) {
  const hit = decAny(body, null, true);
  if (!hit) {
    $.log("[WARN] 登录包解不开:APP 协议密钥可能已轮换(可在 cmcc_keys 里补新密钥)");
    $.msg("中国移动", "⚠️ 登录凭据解不开", "APP 协议密钥可能已更新。先进「查积分」或「签到赢好礼」再点一次,脚本会走备用抓取");
    return;
  }
  const obj = hit.json;
  if (!obj.xk) throw new Error("登录信封缺 xk");
  const tel = obj.tel || "";
  if (!isRealTel(tel)) { $.log(`[WARN] 登录包里的号码无效(${maskPhone(tel) || "空"}),不保存`); return; }
  const old = loadAccounts().find((a) => a.tel === tel);
  // 同账号凭证没变(小组件等续登请求也会命中),只刷新信封,不覆盖会话、不清签到记录、不弹通知
  if (old && old.J && (toJson(old.J) || {}).xk === obj.xk) {
    upsertAccount(tel, (a) => { a.J = JSON.stringify(obj); a.ksName = hit.ks.name; });
    $.log("[INFO] 登录凭证未变化,仅刷新信封");
    return;
  }
  const { count } = upsertAccount(tel, (a) => { a.tel = tel; a.J = JSON.stringify(obj); a.ksName = hit.ks.name; });
  $.setdata("", K_STATUS);
  $.msg("中国移动", "✅ 中国移动 Cookie 获取成功", `账号 ${maskPhone(tel)}(共 ${count} 个) · 协议密钥组 ${hit.ks.name}`);
  $.log("[INFO] 登录信封已保存(密钥组 " + hit.ks.name + "),共 " + count + " 个账号");
}

// 抓查积分包:该接口一直用 biz 组密钥,能解出完整信封(含 xk/cid/ak)+ 顺带存会话 cookie
function capScore(body, hdr) {
  const hit = decAny(body, KS_BIZ, true);
  if (!hit || !hit.json.tel) { $.log("[WARN] 积分包解不开,跳过"); return; }
  const env = hit.json, tel = env.tel;
  // 占位号/副卡号保护:不是有效手机号、或缺 xk,都不入库,避免存成错误账号
  if (!isRealTel(tel)) { $.log(`[WARN] 积分包里的号码无效(${maskPhone(tel) || "空"}),不保存`); return; }
  if (!env.xk) { $.log("[WARN] 积分包缺 xk,不保存"); return; }
  const ck = cookieFromHeaders(hdr);
  const { count } = upsertAccount(tel, (a) => {
    a.tel = tel;
    a.J = JSON.stringify(env);            // 完整信封,可作为续登备用源
    a.ksName = hit.ks.name;
    if (ck) { a.ck = ck; a.ckAt = Date.now(); } // 没拿到 Set-Cookie 时,直接复用这个会话
  });
  $.setdata("", K_STATUS);
  $.msg("中国移动", "✅ 中国移动 Cookie 获取成功", `账号 ${maskPhone(tel)}(共 ${count} 个) · 协议密钥组 ${hit.ks.name}`);
  $.log("[INFO] 信封+会话已保存(密钥组 " + hit.ks.name + "),共 " + count + " 个账号");
}

// 抓签到页:token(签到会话)+ constid(设备标识)
function capH5(url) {
  const q = queryOf(url);
  const token = q.token || "";
  const constid = q.constid || "";
  if (!token) { $.log("[WARN] 签到页请求里没有 token,跳过"); return; }
  if (constid) $.setdata(constid, K_CONSTID);
  const prev = h5Pool().find((x) => x.token === token) || {};
  const fresh = !prev.token || (constid && prev.constid !== constid);
  saveH5({ token, constid: constid || prev.constid || "", at: Date.now() });
  if (!fresh) { $.log("[INFO] 签到 token 未变化,仅刷新时间"); return; }
  const tip = (constid || prev.constid) ? "签到 token + 设备标识已就绪" : "签到 token 已就绪(再点一次「签到」抓设备标识)";
  $.msg("中国移动", "✅ 签到页 token 获取成功", tip);
  $.log("[INFO] 签到 token 已保存");
}

// ---------- 续登,返回 {cookie, ks} ----------
// 密钥组候选:上次命中的组 → 自定义组/APP 组 → biz 组
function appKeysets(prefer) {
  const list = [];
  const push = (ks) => { if (ks && !list.some((x) => x.name === ks.name)) list.push(ks); };
  push(prefer);
  for (const ks of KEYSETS) if (ks.name !== "biz") push(ks); // 自定义/APP 组优先
  push(KS_BIZ); // 营业厅组兜底
  return list;
}

// 请求体有几种可能形态(APP 改版时 cellNum 会从 RSA 密文变成明文、或干脆不再需要),
// 与密钥组自由组合依次尝试,哪个返回 000000 就用哪个。
function loginBodyVariants(lo) {
  const ts = String(Math.floor(Date.now() / 1000));
  const base = Object.assign({}, lo);
  const list = [];
  const mk = (name, reqBody) => list.push({ name, J: JSON.stringify(Object.assign({}, base, { reqBody })) });
  try { mk("rsa", Object.assign({}, lo.reqBody, { cellNum: cellNumFor(lo.tel), sysTime: ts })); } catch (e) { $.log("[WARN] RSA cellNum 生成失败: " + (e.message || e)); }
  mk("plain", Object.assign({}, lo.reqBody, { cellNum: lo.tel, sysTime: ts }));
  mk("none", Object.assign({}, lo.reqBody || {}));
  return list;
}

async function refresh(acc) {
  const lo = JSON.parse(acc.J);
  const prefer = WORK_KS || null;
  const variants = loginBodyVariants(lo);
  // 上次成功的形态优先
  variants.sort((a, b) => (b.name === acc.mode ? 1 : 0) - (a.name === acc.mode ? 1 : 0));
  let lastErr = "";
  const keysetList = appKeysets(prefer);
  for (let ki = 0; ki < keysetList.length; ki++) {
    const ks = keysetList[ki];
    const tryList = variants; // 每组密钥都把几种登录形态试完(网关直接拦下就提前结束组内循环)
    let blocked = false;
    for (const v of tryList) {
      if (blocked) break;
      // 显式带会话 cookie 并按它签名,避免客户端自动回带上次的会话导致签名不符
      const sid = [8, 4, 4, 4, 12].map((n) => Array.from({ length: n }, () => ((Math.random() * 16) | 0).toString(16)).join("")).join("-");
      const h = headersFor(HOST_LOGIN, P_AUTOLOGIN, v.J, sid, "14");
      h["Cookie"] = "JSESSIONID=" + sid;
      const r = await post({ url: "https://" + HOST_LOGIN + P_AUTOLOGIN, headers: h, body: encB64(v.J, ks.reqKey, ks.iv) });
      const hit = decAny(r.data, ks);
      if (DEBUG) $.log(`[DEBUG] autoLogin[${ks.name}/${v.name}] HTTP ${r.status} 可解:${!!hit}`);
      if (!hit) {
        if (String(r.data || "").indexOf("<html") >= 0) {
          blocked = true; // 网关直接拦下:这组密钥/这个端点不通,不用再试其他形态
          if (!lastErr) lastErr = `续登被网关拦截 [HTTP ${r.status || "?"}]`;
        } else {
          lastErr = `续登响应解不开(${ks.name} 组密钥无效) [HTTP ${r.status || "?"}]`;
        }
        continue;
      }
      const out = hit.json;
      if (out.retCode !== "000000") {
        lastErr = `续登失败 ${out.retDesc || ""} [${out.retCode || r.status}]`;
        $.log(`[WARN] 登录形态 ${v.name} 被拒(${out.retCode || r.status}),换形态再试`);
        continue; // 310000「请合理请求」/ 110001 等多半是登录形态变了,换下一种
      }
      const cookie = pickCookie(r.headers) || (out.rspBody && (out.rspBody.cookie || out.rspBody.sessionId)) || "";
      if (!cookie) throw new Error("续登未返回会话");
      WORK_KS = hit.ks;
      acc.mode = v.name;
      $.log(`[INFO] 续登成功(密钥组 ${hit.ks.name} / 登录形态 ${v.name})`);
      return { cookie, ks: hit.ks };
    }
  }
  throw new Error(lastErr || "续登失败(没有可用密钥组)");
}

// ---------- 查积分(营业厅端密钥组固定)----------
async function queryPoints(cookie, loginJ) {
  const J = bizFromLogin(loginJ);
  const sid = (cookie.match(/JSESSIONID=([^;]+)/) || [, ""])[1];
  const h = headersFor(HOST_BIZ, P_SCORE, J, sid, "2");
  h["Cookie"] = cookie;
  const r = await post({ url: "https://" + HOST_BIZ + P_SCORE, headers: h, body: encB64(J, KS_BIZ.reqKey, KS_BIZ.iv) });
  const hit = decAny(r.data, KS_BIZ);
  if (!hit) return { err: `积分响应解不开 [HTTP ${r.status || "?"}]` };
  const out = hit.json;
  if (DEBUG) $.log("[DEBUG] getScoreQuery " + (out.retCode || r.status) + " " + (out.retDesc || ""));
  if (out.retCode !== "000000") return { err: `${out.retDesc || ""} [${out.retCode || r.status}]` };
  return { point: out.rspBody && out.rspBody.pointValue };
}

// ---------- H5 签到接口(明文 JSON,失败返回 null)----------
function h5Call(path, token, extra) {
  const qs = ["token=" + encodeURIComponent(token)].concat(extra || []).concat(["transactionid=" + Date.now()]);
  return post({
    url: "https://" + H5_HOST + path + "?" + qs.join("&"),
    headers: { "User-Agent": H5_UA, "Referer": H5_REFERER, "Origin": "https://h5.bj.10086.cn", "Accept": "application/json, text/plain, */*", "Content-Type": "application/json" },
    body: ""
  }).then((r) => {
    if (DEBUG) $.log("[DEBUG] " + path + " HTTP " + (r.status || "?") + " " + String(r.data || "").slice(0, 140));
    return toJson(peelJson(r.data));
  });
}

// ---------- 签到 A:APP 路径(续登 → 换签到令牌 → H5 doPrize)----------
async function signByApp(cookie, loginJ, constid) {
  if (!constid) return { skip: true, msg: "缺 constid" };
  const ks = WORK_KS || KEYSETS[0];
  const jsid = (cookie.match(/JSESSIONID=([^;]+)/) || [, ""])[1];
  const lo = JSON.parse(loginJ);
  const gJ = JSON.stringify(Object.assign({}, lo, { reqBody: { sourceid: SIGN_SRCID, appId: "", url: SIGN_H5URL, cellNum: lo.tel } }));
  const gh = headersFor(HOST_LOGIN, P_BIGNET, gJ, jsid, "14"); gh["Cookie"] = cookie;
  const gr = await post({ url: "https://" + HOST_LOGIN + P_BIGNET, headers: gh, body: encB64(gJ, ks.reqKey, ks.iv) });
  const ghit = decAny(gr.data, ks);
  if (!ghit) return { ok: false, msg: `取令牌响应解不开 [HTTP ${gr.status || "?"}]` };
  const gout = ghit.json;
  if (DEBUG) $.log("[DEBUG] getBigNetToken " + (gout.retCode || gr.status));
  const sso = gout.rspBody && gout.rspBody.token;
  if (!sso) return { ok: false, msg: `取签到令牌失败 [${gout.retCode || gr.status}]` };
  const ur = await httpGet({ url: "https://" + H5_HOST + P_UNITOKEN + "?token=" + encodeURIComponent(sso), headers: { "User-Agent": H5_UA, "Referer": H5_REFERER } });
  const uout = toJson(peelJson(ur.data)) || {};
  const h5tok = uout.token;
  if (!h5tok) return { ok: false, msg: "H5 换令牌失败" };
  const dout = await h5Call(P_DOPRIZE, h5tok, ["type=sign", "constid=" + encodeURIComponent(constid)]);
  if (!dout) return { ok: false, msg: "签到请求异常" };
  if (dout.result === 0) {
    const p0 = (dout.prizelist && dout.prizelist[0]) || {};
    return { ok: true, prize: p0.prizeName || p0.prizeDesc || "" };
  }
  if (dout.result === -114 || /已经?签到|已签到|重复签到/.test(dout.errmsg || "")) return { ok: true, already: true };
  return { ok: false, msg: dout.errmsg || dout.resultDesc || ("result=" + dout.result) };
}

// ---------- 签到 B:H5 直签(签到页 token → getSignIn 查状态 → doPrize)----------
async function signByH5(h5) {
  if (!h5 || !h5.token) return { skip: true, msg: "没有签到页 token" };
  const st = await h5Call(P_GETSIGN, h5.token);
  if (!st) return { ok: false, msg: "签到状态查询失败(token 可能已失效)" };
  if (st.result !== 0) return { ok: false, msg: `token 失效 ${st.errmsg || ""} [${st.result}]` };
  const todayPrize = (st.signInList && st.signInList[0] && st.signInList[0].signInPrize) || "";
  if (st.isSignIn === true) return { ok: true, already: true, prize: todayPrize };
  const constid = h5.constid || $.getdata(K_CONSTID) || "";
  if (!constid) return { skip: true, msg: "缺 constid(请在签到页点一次签到)" };
  const dout = await h5Call(P_DOPRIZE, h5.token, ["type=sign", "constid=" + encodeURIComponent(constid)]);
  if (!dout) return { ok: false, msg: "签到请求异常" };
  if (dout.result === 0) {
    const p0 = (dout.prizelist && dout.prizelist[0]) || {};
    return { ok: true, prize: p0.prizeName || p0.prizeDesc || todayPrize };
  }
  if (dout.result === -114 || /已经?签到|已签到|重复签到/.test(dout.errmsg || "")) return { ok: true, already: true };
  return { ok: false, msg: dout.errmsg || dout.resultDesc || ("result=" + dout.result) };
}

// 单账号一行结果文案
function lineFor(r) {
  const who = r.tel ? maskPhone(r.tel) : "账号";
  let s;
  if (r.sg.skip) s = "签到待配置" + (r.sg.msg ? `(${r.sg.msg})` : "");
  else if (r.sg.already) s = "今日已签到";
  else if (r.sg.ok) s = r.sg.prize ? `签到成功 获得 ${r.sg.prize}` : "签到成功";
  else s = `签到失败 ${r.sg.msg || "未知"}`;
  const pt = (r.pts && !r.pts.err && r.pts.point != null) ? ` · 积分 ${r.pts.point}` : "";
  const warn = (r.err && !r.sg.ok) ? ` · 续登异常 ${r.err}` : "";
  return `${who}: ${s}${pt}${warn}`;
}

async function main() {
  if (ARG.clear === "true" || $.getdata("cmcc_clear") === "true" || $.getdata("cmcc_clear") === true) {
    $.setdata("", K_LOGIN); $.setdata("", K_SCORE); $.setdata("", K_CONSTID); $.setdata("", K_H5); $.setdata("", K_STATUS); $.setdata("false", "cmcc_clear");
    $.msg("中国移动", "", "✅ 已清除登录凭证"); return;
  }
  const accounts = loadAccounts();
  if (!accounts.length) { saveStatus("none", "缺登录凭证"); $.msg("⚠️ 中国移动", "缺少登录凭证", "划掉后台的中国移动 APP 重新打开,触发抓取后再运行"); return; }

  // 体检模式:BoxJS/argument 设 cmcc_dump=true ,只把抓到的凭证结构打到日志,方便排查"抓错了"
  if (ARG.dump === "true" || $.getdata("cmcc_dump") === "true") {
    const pool0 = h5Pool();
    const brief = (v, n) => (v ? String(v).slice(0, n) + "…(" + String(v).length + "位)" : "空");
    $.log("[DUMP] 账号数 " + accounts.length + " | H5 token 池 " + pool0.length + " | 密钥组 " + KEYSETS.map((k) => k.name).join(","));
    accounts.forEach((a, i) => {
      const env = toJson(a.J) || {};
      const ag = a.ckAt ? Math.round((Date.now() - a.ckAt) / 60000) + " 分钟前" : "未知";
      $.log(`[DUMP] #${i + 1} tel=${a.tel} 有效号码=${isRealTel(a.tel)} 密钥组=${a.ksName || "-"} 登录形态=${a.mode || "-"}`);
      $.log(`[DUMP]   信封: cv=${env.cv || "-"} sv=${env.sv || "-"} imei=${brief(env.imei, 6)} cid=${brief(env.cid, 6)} ak=${brief(env.ak, 6)} xk=${brief(env.xk, 8)} t=${brief(env.t, 6)}`);
      $.log(`[DUMP]   会话: ${a.ck ? "已存 " + String(a.ck).replace(/(JSESSIONID=[^;]{8})[^;]*/, "$1…") + " (" + ag + ")" : "未存"}`);
      $.log(`[DUMP]   签到: token=${brief(a.h5 && a.h5.token, 6)} constid=${brief((a.h5 && a.h5.constid) || $.getdata(K_CONSTID), 6)}`);
    });
    $.msg("中国移动", "🔍 凭证体检", accounts.map((a) => `${maskPhone(a.tel)} · ${a.ksName || "-"} · 会话${a.ck ? "有" : "无"} · token${(a.h5 && a.h5.token) ? "有" : "无"}`).join("\n"));
    return;
  }

  const pool = h5Pool();
  const results = [];
  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    const tel = acc.tel || telOf(acc.J || "");
    if (i > 0) await $.wait(2000); // 多账号间隔,避免频繁登录触发风控

    // 1) 续登:失败不直接判死,改用抓取时存下的会话
    let cookie = acc.ck || "";
    let refreshErr = "";
    try {
      const out = await refresh(acc);
      cookie = out.cookie;
      acc.ck = cookie; acc.ckAt = Date.now();
    } catch (e) {
      refreshErr = String(e.message || e);
      const ag = acc.ckAt ? Math.round((Date.now() - acc.ckAt) / 60000) + " 分钟前的会话" : "没有备用会话";
      $.log(`[WARN] ${tel ? maskPhone(tel) : "账号"} 续登失败(${ag}),继续尝试查积分/签到: ${refreshErr}`);
    }

    // 2) 签到:优先 APP 路径(可自续令牌),不行再走 H5 token 直签
    let sg = null;
    try {
      if (cookie) sg = await signByApp(cookie, acc.J, (acc.h5 && acc.h5.constid) || $.getdata(K_CONSTID));
    } catch (e) {
      $.log("[WARN] APP 路径签到异常: " + (e.message || e));
      sg = { ok: false, msg: String(e.message || e) };
    }
    if (!sg || sg.skip || sg.ok === false) {
      const h5 = (acc.h5 && acc.h5.token) ? acc.h5 : (accounts.length === 1 ? pool[0] : null);
      try {
        const viaH5 = await signByH5(h5);
        if (viaH5 && (!sg || sg.skip || viaH5.ok)) sg = viaH5;
        else if (!sg) sg = viaH5;
      } catch (e) {
        if (!sg) sg = { ok: false, msg: String(e.message || e) };
      }
    }
    if (!sg) sg = { skip: true };

    // 3) 查积分
    const pts = cookie ? await queryPoints(cookie, acc.J) : { err: refreshErr || "无会话" };

    results.push({ tel, sg, pts, err: refreshErr });
  }
  saveAccounts(accounts); // 会话 cookie 回写

  const lines = results.map(lineFor);
  const allOk = results.every((r) => !r.err && r.sg && r.sg.ok);
  const state = allOk ? "ok" : (results.some((r) => r.sg && !r.sg.ok && !r.sg.skip) ? "fail" : "cookie");
  const title = allOk ? "✅ 中国移动签到" : "⚠️ 中国移动签到";
  const pts = results.length === 1 && results[0].pts; // 多账号的积分不合并,只在单账号时记
  saveStatus(state, lines.join(" | "), pts && !pts.err && pts.point != null ? `积分 ${pts.point}` : undefined);
  $.msg(title, results.length > 1 ? `${results.length} 个账号` : "", lines.join("\n"));
}

// ==================== 工具函数 ====================
function u8(s){if(s instanceof Uint8Array)return s;const o=[];for(let i=0;i<s.length;i++){let c=s.charCodeAt(i);if(c>=0xd800&&c<0xdc00&&i+1<s.length){const d=s.charCodeAt(i+1);if(d>=0xdc00&&d<0xe000){c=0x10000+((c-0xd800)<<10)+(d-0xdc00);i++;}}if(c<0x80)o.push(c);else if(c<0x800)o.push(0xc0|(c>>6),0x80|(c&63));else if(c<0x10000)o.push(0xe0|(c>>12),0x80|((c>>6)&63),0x80|(c&63));else o.push(0xf0|(c>>18),0x80|((c>>12)&63),0x80|((c>>6)&63),0x80|(c&63));}return new Uint8Array(o);}
function u8s(b){let s='';for(let i=0;i<b.length;){const c=b[i++];let cp;if(c<0x80)cp=c;else if(c<0xe0)cp=((c&31)<<6)|(b[i++]&63);else if(c<0xf0)cp=((c&15)<<12)|((b[i++]&63)<<6)|(b[i++]&63);else cp=((c&7)<<18)|((b[i++]&63)<<12)|((b[i++]&63)<<6)|(b[i++]&63);if(cp>0xffff){cp-=0x10000;s+=String.fromCharCode(0xd800+(cp>>10),0xdc00+(cp&1023));}else s+=String.fromCharCode(cp);}return s;}
function toHex(b){let s='';for(let i=0;i<b.length;i++)s+=b[i].toString(16).padStart(2,'0');return s;}
const B64A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function b64(b){let s='',i=0;for(;i+2<b.length;i+=3){const n=(b[i]<<16)|(b[i+1]<<8)|b[i+2];s+=B64A[(n>>18)&63]+B64A[(n>>12)&63]+B64A[(n>>6)&63]+B64A[n&63];}if(i<b.length){const n=(b[i]<<16)|((i+1<b.length?b[i+1]:0)<<8);s+=B64A[(n>>18)&63]+B64A[(n>>12)&63]+(i+1<b.length?B64A[(n>>6)&63]:'=')+'=';}return s;}
function b64dec(s){s=String(s).replace(/[^A-Za-z0-9+/]/g,'');const out=[];let buf=0,bits=0;for(const ch of s){buf=(buf<<6)|B64A.indexOf(ch);bits+=6;if(bits>=8){bits-=8;out.push((buf>>bits)&0xff);}}return new Uint8Array(out);}
function md5(input){const msg=u8(input);const S=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];const K=[];for(let i=0;i<64;i++)K[i]=Math.floor(Math.abs(Math.sin(i+1))*4294967296)>>>0;let a0=0x67452301,b0=0xefcdab89,c0=0x98badcfe,d0=0x10325476;const ml=msg.length,withOne=ml+1,total=withOne+((56-withOne%64+64)%64)+8,m=new Uint8Array(total);m.set(msg);m[ml]=0x80;const bitLen=ml*8,dv=new DataView(m.buffer);dv.setUint32(total-8,bitLen>>>0,true);dv.setUint32(total-4,Math.floor(bitLen/4294967296)>>>0,true);for(let off=0;off<total;off+=64){const M=[];for(let i=0;i<16;i++)M[i]=dv.getUint32(off+i*4,true);let A=a0,B=b0,C=c0,D=d0;for(let i=0;i<64;i++){let F,g;if(i<16){F=(B&C)|(~B&D);g=i;}else if(i<32){F=(D&B)|(~D&C);g=(5*i+1)%16;}else if(i<48){F=B^C^D;g=(3*i+5)%16;}else{F=C^(B|~D);g=(7*i)%16;}F=(F+A+K[i]+M[g])>>>0;A=D;D=C;C=B;const rot=(F<<S[i])|(F>>>(32-S[i]));B=(B+rot)>>>0;}a0=(a0+A)>>>0;b0=(b0+B)>>>0;c0=(c0+C)>>>0;d0=(d0+D)>>>0;}const out=new Uint8Array(16),o=new DataView(out.buffer);o.setUint32(0,a0,true);o.setUint32(4,b0,true);o.setUint32(8,c0,true);o.setUint32(12,d0,true);return out;}
const md5hex=x=>toHex(md5(x));
const ASB=(()=>{const s=new Uint8Array(256);let p=1,q=1;do{p=p^(p<<1)^((p&0x80)?0x11b:0);p&=0xff;q^=q<<1;q^=q<<2;q^=q<<4;q&=0xff;if(q&0x80)q^=0x09;const x=q^((q<<1)|(q>>>7))^((q<<2)|(q>>>6))^((q<<3)|(q>>>5))^((q<<4)|(q>>>4));s[p]=(x^0x63)&0xff;}while(p!==1);s[0]=0x63;return s;})();
const AISB=(()=>{const inv=new Uint8Array(256);for(let i=0;i<256;i++)inv[ASB[i]]=i;return inv;})();
function xt(a){return ((a<<1)^((a&0x80)?0x11b:0))&0xff;}
function mul(a,b){let r=0;for(let i=0;i<8;i++){if(b&1)r^=a;const hi=a&0x80;a=(a<<1)&0xff;if(hi)a^=0x1b;b>>=1;}return r&0xff;}
function expand128(key){const Nk=4,Nr=10,w=new Uint8Array(16*(Nr+1));w.set(key);const rcon=[0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];let i=Nk;const t=new Uint8Array(4);while(i<4*(Nr+1)){for(let k=0;k<4;k++)t[k]=w[(i-1)*4+k];if(i%Nk===0){const tmp=t[0];t[0]=ASB[t[1]]^rcon[i/Nk-1];t[1]=ASB[t[2]];t[2]=ASB[t[3]];t[3]=ASB[tmp];}for(let k=0;k<4;k++)w[i*4+k]=w[(i-Nk)*4+k]^t[k];i++;}return {w,Nr};}
function encBlock(st,w,Nr){const s=st.slice();for(let k=0;k<16;k++)s[k]^=w[k];for(let r=1;r<Nr;r++){for(let k=0;k<16;k++)s[k]=ASB[s[k]];shiftRows(s);mixCols(s);for(let k=0;k<16;k++)s[k]^=w[r*16+k];}for(let k=0;k<16;k++)s[k]=ASB[s[k]];shiftRows(s);for(let k=0;k<16;k++)s[k]^=w[Nr*16+k];return s;}
function decBlock(st,w,Nr){const s=st.slice();for(let k=0;k<16;k++)s[k]^=w[Nr*16+k];for(let r=Nr-1;r>=1;r--){invShiftRows(s);for(let k=0;k<16;k++)s[k]=AISB[s[k]];for(let k=0;k<16;k++)s[k]^=w[r*16+k];invMixCols(s);}invShiftRows(s);for(let k=0;k<16;k++)s[k]=AISB[s[k]];for(let k=0;k<16;k++)s[k]^=w[k];return s;}
function shiftRows(s){const t=[s[0],s[5],s[10],s[15],s[4],s[9],s[14],s[3],s[8],s[13],s[2],s[7],s[12],s[1],s[6],s[11]];for(let i=0;i<16;i++)s[i]=t[i];}
function invShiftRows(s){const t=[s[0],s[13],s[10],s[7],s[4],s[1],s[14],s[11],s[8],s[5],s[2],s[15],s[12],s[9],s[6],s[3]];for(let i=0;i<16;i++)s[i]=t[i];}
function mixCols(s){for(let c=0;c<4;c++){const o=c*4,a0=s[o],a1=s[o+1],a2=s[o+2],a3=s[o+3];s[o]=xt(a0)^(xt(a1)^a1)^a2^a3;s[o+1]=a0^xt(a1)^(xt(a2)^a2)^a3;s[o+2]=a0^a1^xt(a2)^(xt(a3)^a3);s[o+3]=(xt(a0)^a0)^a1^a2^xt(a3);}}
function invMixCols(s){for(let c=0;c<4;c++){const o=c*4,a0=s[o],a1=s[o+1],a2=s[o+2],a3=s[o+3];s[o]=mul(a0,14)^mul(a1,11)^mul(a2,13)^mul(a3,9);s[o+1]=mul(a0,9)^mul(a1,14)^mul(a2,11)^mul(a3,13);s[o+2]=mul(a0,13)^mul(a1,9)^mul(a2,14)^mul(a3,11);s[o+3]=mul(a0,11)^mul(a1,13)^mul(a2,9)^mul(a3,14);}}
function aesCbcEnc(plainBytes,keyText,ivText){const {w,Nr}=expand128(u8(keyText)),iv=u8(ivText),pad=16-(plainBytes.length%16),buf=new Uint8Array(plainBytes.length+pad);buf.set(plainBytes);for(let i=plainBytes.length;i<buf.length;i++)buf[i]=pad;const out=new Uint8Array(buf.length);let prev=iv;for(let i=0;i<buf.length;i+=16){const blk=buf.subarray(i,i+16).slice();for(let k=0;k<16;k++)blk[k]^=prev[k];const ct=encBlock(blk,w,Nr);out.set(ct,i);prev=ct;}return out;}
function aesCbcDec(cipherBytes,keyText,ivText){const {w,Nr}=expand128(u8(keyText)),iv=u8(ivText),out=new Uint8Array(cipherBytes.length);let prev=iv;for(let i=0;i<cipherBytes.length;i+=16){const blk=cipherBytes.subarray(i,i+16),pt=decBlock(blk.slice(),w,Nr);for(let k=0;k<16;k++)pt[k]^=prev[k];out.set(pt,i);prev=blk;}const pad=out[out.length-1];return out.slice(0,out.length-(pad>0&&pad<=16?pad:0));}
const encB64=(plainStr,keyText,ivText)=>b64(aesCbcEnc(u8(plainStr),keyText,ivText));
const decStr=(b64str,keyText,ivText)=>u8s(aesCbcDec(b64dec(b64str),keyText,ivText));
const RSA_N=BigInt("0x968e9acf9e59b4e2e1bb24266ee39043788a45f788ecdc5c971f4964c3267cf20afd3b7f029b68a9a9b65d77d0306b8319df0c174f3dd82ef3894a6c38e23634f6095a81901ad7e6650911c0910f12c7de50a6fcee3ae3563cc5985c46a965db2af49e94f69b62f67ff3d5c0f79782572375e5f8b44aa43c0ca6d48e8a969beb");
function modpow(b,e,m){let r=1n;b%=m;while(e>0n){if(e&1n)r=(r*b)%m;e>>=1n;b=(b*b)%m;}return r;}
function cellNumFor(tel){const d=new Date(),p=x=>String(x).padStart(2,'0');const m=u8('leadeon'+tel+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds()));const eb=[0,2];while(eb.length<128-m.length-1)eb.push(1+Math.floor(Math.random()*255));eb.push(0,...m);const h=modpow(BigInt('0x'+toHex(eb)),65537n,RSA_N).toString(16).padStart(256,'0');const o=new Uint8Array(128);for(let i=0;i<128;i++)o[i]=parseInt(h.substr(i*2,2),16);return b64(o);}
function nonce8(){let s='';for(let i=0;i<8;i++)s+=Math.floor(Math.random()*10);return s;}

// 签到状态协议 v1:写本次结果,并把自己登记进公共索引 checkin_registry(Loon/Surge/QX/Stash 通用,不依赖 Env)
function checkinReport(key, rec, info) {
  const read = (k) => (typeof $prefs !== "undefined" ? $prefs.valueForKey(k) : $persistentStore.read(k));
  const write = (v, k) => (typeof $prefs !== "undefined" ? $prefs.setValueForKey(v, k) : $persistentStore.write(v, k));
  const registry = () => { try { return JSON.parse(read("checkin_registry") || "{}") || {}; } catch (e) { return {}; } };
  write(JSON.stringify(Object.assign({ v: 1, t: Date.now(), name: info.name, author: info.author }, rec)), key);
  const reg = registry();
  if (JSON.stringify(reg[key]) === JSON.stringify(info)) return;
  reg[key] = info;
  write(JSON.stringify(reg), "checkin_registry");
  if (!registry()[key]) console.log(`[checkin] ${key} 登记没写上,下次运行再补`);
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}getdata(t){return this.getval(t)}setdata(t,e){return this.setval(t,e)}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}

// ==================== 入口 ====================
if (typeof $request !== "undefined" && !CHECKIN_RUN && $request) {
  capture();
} else {
  main().catch((e) => {
    $.log("[ERROR] " + (e.message || e));
    if (e.message === "NO_COOKIE") { saveStatus("none", "缺登录凭证"); $.msg("⚠️ 中国移动", "缺少登录凭证", "划掉后台的中国移动 APP 重新打开,触发抓取后再运行"); }
    else { saveStatus("fail", String(e.message || e)); $.msg("⚠️ 中国移动", "续登/查询异常", String(e.message || e)); }
  }).finally(() => $.done());
}
