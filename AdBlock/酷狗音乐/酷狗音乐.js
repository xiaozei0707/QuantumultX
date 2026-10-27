
/*
 * 酷狗音乐广告清理补充
 * Quantumult X
 * 目标：清理首页推广卡片、悬浮推广数据
 */

(function () {
  const url = $request.url;
  let obj;

  try {
    obj = JSON.parse($response.body);
  } catch (e) {
    $done({});
    return;
  }

  // 首页 VIP 推广卡片
  if (/\/ads\.gateway\/v2\/home_card(?:\?|$)/.test(url)) {
    if (obj.data && Array.isArray(obj.data.ads)) {
      obj.data.ads = [];
    }
  }

  // 首页组合广告、图标推广
  if (/\/adp\/ad\/v1\/home_combine(?:\?|$)/.test(url)) {
    if (obj.data && typeof obj.data === "object") {
      for (const key of Object.keys(obj.data)) {
        const item = obj.data[key];
        if (item && Array.isArray(item.ads)) {
          item.ads = [];
        }
      }
    }
  }

  // 多页面悬浮广告
  if (/\/adp\/ad\/v1\/multi_page_pendant(?:\?|$)/.test(url)) {
    obj.data = {};
  }

  $done({ body: JSON.stringify(obj) });
})();
