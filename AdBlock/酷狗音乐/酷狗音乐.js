/*
 * 酷狗音乐 · 去广告 / 精简底栏（Quantumult X 响应脚本）
 * 依据抓包：quantumult-x-2026-10-27-184808.har（酷狗 iOS 20.8.7）
 *
 * 处理内容：
 *   1. 开屏广告      gateway.kugou.com/ads.gateway/v4/mobile_splash & /v4/mobile_splash_sort
 *   2. 底栏 tab 列表 gateway.kugou.com/card/v1/pxy/listen (module: tab_list_v3)
 *      底栏气泡广告位 pxy/v1/combo/startup (module: tab_bottom_list -> bottom_ad)
 *   3. 广告/折扣推销  adservice|ads.service/v3/vip_center、ads.gateway/v2|v3/*、
 *                    adp/ad/v1/home_combine、deal/adp…、aterouter/v2/get_dialog（弹窗）
 *
 * 底栏策略：KEEP_ONLY_HOME = true 时底栏只留「首页」（「我的」是客户端内置 tab），
 *           其余（视频/直播/乐库/听书/短剧/会员…）全部从 tab 列表里删掉。
 */
(function () {
  /* ============ 可调开关 ============ */
  // true  = 底栏只留「首页」+「我的」（推荐做法，向下兼容“我的”内置不在接口里）
  // false = 只删“视频 / VIP / 会员”分类，其余 tab 保留
  const KEEP_ONLY_HOME = true;
  /* ================================= */

  const url = ($request && $request.url) || "";
  const raw = ($response && $response.body) || "";
  if (!raw) { $done({}); return; }

  let obj;
  try { obj = JSON.parse(raw); } catch (e) { $done({}); return; }

  /* ---------- 工具函数 ---------- */

  // 递归清空所有广告数组（ads / xxx_ads / xxxAds ...）
  function clearAds(node) {
    if (!node || typeof node !== "object") return node;
    if (Array.isArray(node)) { node.forEach(clearAds); return node; }
    Object.keys(node).forEach(function (k) {
      const v = node[k];
      if (Array.isArray(v)) {
        if (/^(ads|ad_list|adList)$/i.test(k) || /_ads$/i.test(k) || /Ads$/.test(k)) {
          node[k] = [];
          return;
        }
        v.forEach(clearAds);
      } else if (v && typeof v === "object") {
        clearAds(v);
      }
    });
    return node;
  }

  // 只保留「首页/推荐/我的」
  function isKeepTab(t) {
    if (!t || typeof t !== "object") return false;
    const name = String(t.name || t.tab_name || t.title || "").trim();
    const slug = String(t.slug || t.key || "").trim();
    if (/^(recommend|home|index|main|mine|my)$/i.test(slug)) return true;
    if (/^(首页|推荐|我的)$/.test(name)) return true;
    if (Number(t.is_main) === 1) return true;
    return false;
  }

  // 需要从底栏 / 分类栏里剔除的 tab（视频、VIP/会员）
  function isBlockedTab(t) {
    if (!t || typeof t !== "object") return false;
    const name = String(t.name || t.tab_name || t.title || "").trim();
    const slug = String(t.slug || t.key || "").trim();
    if (/^(video|vip|svip|member|video_feed)$/i.test(slug)) return true;
    if (/视频/.test(name)) return true;
    if (/^(VIP|SVIP|会员|会员专区|超级会员|豪华VIP|超级VIP)$/i.test(name)) return true;
    return false;
  }

  // 处理 tab 列表结构：底栏只留首页/我的，并同步 normal_ids / bottom_ad
  function pruneTabBody(text) {
    let o;
    try { o = JSON.parse(text); } catch (e) { return text; }
    const d = o.data || o;
    let removed = false;

    ["list", "tab_list", "tabs", "bottom_tab_list"].forEach(function (key) {
      if (Array.isArray(d[key])) {
        const before = d[key].length;
        d[key] = d[key].filter(function (t) {
          return KEEP_ONLY_HOME ? isKeepTab(t) : !isBlockedTab(t);
        });
        if (d[key].length !== before) removed = true;
      }
    });

    // 底栏气泡广告（tab_bottom_list.bottom_ad：会员专区、赚钱等），整块清掉
    if (Array.isArray(d.bottom_ad)) { d.bottom_ad = []; removed = true; }
    if (Array.isArray(d.live_data)) d.live_data = [];

    // tab_list_v3：normal_ids 是底栏展示用 id 串，必须同步，否则被删的 tab 可能仍出现
    if (removed && Array.isArray(d.list)) {
      if ("normal_ids" in d) {
        const ids = d.list
          .map(function (t) { return t && t.tab_name_uni_id; })
          .filter(function (x) { return x !== undefined && x !== null && x !== ""; });
        d.normal_ids = ids.join(",");
      }
      if ("auto_enter" in d) d.auto_enter = 0;
    }
    return JSON.stringify(o);
  }

  // 处理 pxy 组合接口里的子模块（body 为字符串）
  function handleComboModules(root) {
    const list = root && root.data && root.data.responses;
    if (!Array.isArray(list)) return false;
    list.forEach(function (m) {
      const name = String(m.module || "");
      if (typeof m.body !== "string" || !m.body) return;
      if (/tab_list|tab_bottom|bottom_tab/i.test(name)) {
        m.body = pruneTabBody(m.body);
        return;
      }
      if (/home_combine|kingkong|banner/i.test(name)) {
        try { const b = JSON.parse(m.body); clearAds(b); m.body = JSON.stringify(b); } catch (e) {}
      }
    });
    return true;
  }

  /* ---------- 1. 开屏广告 ---------- */
  if (/\/v4\/mobile_splash(_sort)?/i.test(url)) {
    const d = obj.data || obj;
    ["boot_ads", "front_ads", "ads", "retry_ads", "discard", "exposure_csj_ids", "least_id", "retry_id"]
      .forEach(function (k) { if (k in d) d[k] = []; });
    // 开屏上“开SVIP免广告”的引导也一起隐藏
    if (d.config && d.config.svip_guide_cfg) d.config.svip_guide_cfg.show_cfg = "0_0_0_0";
    $done({ body: JSON.stringify(obj) });
    return;
  }

  /* ---------- 2. 底栏广告位 / 分类（list、startup、user 组合接口） ---------- */
  if (handleComboModules(obj)) {
    $done({ body: JSON.stringify(obj) });
    return;
  }

  /* ---------- 3. 弹窗（营销 / 会员 / 折扣弹窗） ---------- */
  if (/aterouter\/v2\/get_dialog/i.test(url)) {
    if (obj.data) obj.data.popup_list = [];
    $done({ body: JSON.stringify(obj) });
    return;
  }

  /* ---------- 4. VIP 中心广告（折扣、联名、0元购等） ---------- */
  if (/vip_center/i.test(url)) {
    const d = obj.data || obj;
    if (Array.isArray(d.ads)) d.ads = [];
    clearAds(obj);
    $done({ body: JSON.stringify(obj) });
    return;
  }

  /* ---------- 5. 其余广告位（首页浮标 / 侧边栏 / 我的页 / 金刚区 / 任务入口） ---------- */
  clearAds(obj);
  if (obj && obj.data) {
    // mobile_link / sidebar_top_card 用 info 承载广告
    if (/mobile_link|sidebar_top_card/i.test(url) && Array.isArray(obj.data.info)) obj.data.info = [];
    if (/home_combine/i.test(url) && Array.isArray(obj.data.list)) obj.data.list = [];
  }
  $done({ body: JSON.stringify(obj) });
})();
