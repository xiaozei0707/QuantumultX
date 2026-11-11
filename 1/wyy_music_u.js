/***************************************
 * 网易云音乐 MUSIC_U / Cookie 抓取 → 写入 BoxJS
 * 平台：Quantumult X（script-request-header）
 * 触发：^https?:\/\/interface\d?\.music\.163\.com\/x?w?e?api\/vipauth\/app\/auth\/(soundquality\/)?query
 *       （\/x?w?e?api\/ 覆盖 api / eapi / wapi / weapi / xapi / xeapi / xweapi）
 * 说明：抓「整条 Cookie」+「其中的 MUSIC_U」，只读不改包，不影响播放与账号
 *
 * 写入 BoxJS 的三个键：
 *   wyy_music_cookie  整条 Cookie 原文（MUSIC_U=...; caid=...; NMDI=... 全字段）
 *   wyy_music_u       仅 MUSIC_U 的值
 *   wyy_music_u_time  抓取时间
 ***************************************/

const KEY_COOKIE = 'wyy_music_cookie';   // 整条 cookie
const KEY_MUSIC_U = 'wyy_music_u';       // 只要 MUSIC_U
const KEY_UPDATED = 'wyy_music_u_time';  // 抓取时间
const BOXJS_URL = 'http://boxjs.com';

!(function () {
  try {
    const req = typeof $request !== 'undefined' ? $request : {};
    const headers = req.headers || {};

    // 1) 找到含 MUSIC_U= 的那段文本（优先 Cookie 头，兜底扫全 headers / body）
    const rawCookie = findCookieText(headers, req);
    if (!rawCookie) {
      console.log('[MUSIC_U] 本次请求未找到 MUSIC_U，跳过');
      return finish();
    }

    // 2) 整条 cookie：压掉分隔符周围的多余空白，保持原字段顺序
    const cookie = tidyCookie(rawCookie);

    // 3) 从整条 cookie 里取 MUSIC_U（多个匹配时取最长的那个，避免抓到残段）
    const musicU = extractMusicU(cookie);
    if (!musicU) {
      console.log('[MUSIC_U] 找到 cookie 但解析不出 MUSIC_U，跳过');
      return finish();
    }

    const oldMusicU = readBox(KEY_MUSIC_U);
    const oldCookie = readBox(KEY_COOKIE);
    const now = timeStr();

    writeBox(KEY_COOKIE, cookie);
    writeBox(KEY_MUSIC_U, musicU);
    writeBox(KEY_UPDATED, now);

    // ===== 日志：抓取成功 + 抓到的内容 =====
    console.log('[MUSIC_U] ✅ 抓取成功 (' + now + ')');
    console.log('[MUSIC_U] 整条 cookie 长度: ' + cookie.length + ' 位，字段数: ' + countFields(cookie));
    console.log('[MUSIC_U] MUSIC_U 长度: ' + musicU.length + ' 位');
    console.log('[MUSIC_U] cookie 原文: ' + cookie);

    const changed = oldMusicU !== musicU || oldCookie !== cookie;
    if (!changed) {
      console.log('[MUSIC_U] 与 BoxJS 中已存内容一致，仅刷新时间');
    } else {
      console.log(
        '[MUSIC_U] BoxJS 已更新（MUSIC_U ' + (oldMusicU ? oldMusicU.length : 0) + ' → ' + musicU.length +
        ' 位；cookie ' + (oldCookie ? oldCookie.length : 0) + ' → ' + cookie.length + ' 位）'
      );
      notify(
        '✅ 网易云 Cookie 抓取成功',
        'cookie ' + cookie.length + ' 位 · MUSIC_U ' + musicU.length + ' 位 · ' + now,
        'MUSIC_U=' + musicU,
        cookie
      );
    }
  } catch (e) {
    console.log('[MUSIC_U] 脚本异常：' + (e && e.message ? e.message : e));
  }
  finish();

  /* ============ 以下是工具函数 ============ */

  function finish() {
    // 请求头脚本必须回调，否则请求会卡住
    if (typeof $done === 'function') $done({});
  }

  // 找出含 MUSIC_U= 的 cookie 文本：Cookie 头 > 其他头 > 请求体
  function findCookieText(h, req) {
    const fromCookieHeader = matchCookie(getHeader(h, 'cookie'));
    if (fromCookieHeader) return fromCookieHeader;

    // 有些版本把 cookie 塞进自定义头
    let best = '';
    for (const k in h) {
      if (!k || k.toLowerCase() === 'cookie') continue;
      const t = matchCookie(String(h[k] == null ? '' : h[k]));
      if (t && t.length > best.length) best = t;
    }
    if (best) return best;

    // 兜底：请求体（eapi 的 header 字段里也可能带 cookie）
    const body = req.body;
    if (body) {
      const t = matchCookie(typeof body === 'string' ? body : safeString(body));
      if (t) return t;
    }
    return '';
  }

  // 从一段文本里切出「含 MUSIC_U= 的整条 cookie」
  function matchCookie(raw) {
    if (!raw) return '';
    let text = String(raw);

    // 原始形态最常见
    let hit = sliceFromMusicU(text);
    if (hit) return hit;

    // 整段被 urlencode 的情况
    const decoded = decodeOnce(text);
    if (decoded !== text) {
      hit = sliceFromMusicU(decoded);
      if (hit) return hit;
    }
    return '';
  }

  // 取从第一个 MUSIC_U= 起、到该字段结束（含后续所有 ; 字段）的整串
  function sliceFromMusicU(text) {
    const i = text.search(/MUSIC_U\s*=/i);
    if (i < 0) return '';
    let s = text.slice(i);
    // 去掉 JSON / 转义外壳（不动 cookie 自身的 caid={...}）
    s = s.replace(/\\u003b/gi, ';').replace(/\\"/g, '"').replace(/\\n|\\r|\r?\n/g, '');
    s = s.replace(/^[^=]*=\s*/, 'MUSIC_U=');
    // 只在“末尾”剪掉 JSON 包裹符，绝不能从此处的 caid={" 处开剪
    s = s.replace(/["'\\]+[\s}\]]*$/, '');
    s = s.trim().replace(/[;,]+$/, '');
    return /MUSIC_U=./i.test(s) ? s : '';
  }

  function extractMusicU(cookie) {
    if (!cookie) return '';
    const re = /MUSIC_U\s*=\s*([^;]+)/gi;
    let m, best = '';
    while ((m = re.exec(cookie))) {
      const v = m[1].trim().replace(/^["']|["']$/g, '');
      if (v.length > best.length) best = v;
    }
    if (best.length < 16) return '';
    if (!/^[0-9A-Za-z+/=_.%-]+$/.test(best)) return '';
    return best;
  }

  // 压掉 `;` 前后多余空白，输出形如 `MUSIC_U=...; caid=...; NMDI=...`
  function tidyCookie(s) {
    return String(s)
      .trim()
      .replace(/\s*;\s*/g, '; ')
      .replace(/;\s*$/, '');
  }

  function countFields(cookie) {
    return String(cookie).split(';').filter((x) => x.trim()).length;
  }

  function decodeOnce(t) {
    if (!/%3D|%3B|%25/i.test(t)) return t;
    try { return decodeURIComponent(t); } catch (e) { return t; }
  }

  function safeString(v) {
    try { return typeof v === 'object' ? JSON.stringify(v) : String(v); } catch (e) { return ''; }
  }

  // 大小写不敏感地读请求头
  function getHeader(h, name) {
    const target = name.toLowerCase();
    for (const k in h) {
      if (k && k.toLowerCase() === target) return String(h[k] == null ? '' : h[k]);
    }
    return '';
  }

  // ===== BoxJS / QX 持久化（BoxJS 与客户端共用同一份键值存储） =====
  function writeBox(key, val) {
    try {
      if (typeof $prefs !== 'undefined' && $prefs.setValueForKey) {
        $prefs.setValueForKey(val, key);           // Quantumult X
        return true;
      }
      if (typeof $persistentStore !== 'undefined' && $persistentStore.write) {
        $persistentStore.write(val, key);          // Surge / Loon / Stash / Shadowrocket
        return true;
      }
      if (typeof $task !== 'undefined' && $task.write) {
        $task.write(val, key);
        return true;
      }
    } catch (e) {
      console.log('[MUSIC_U] 写入失败：' + e);
    }
    return false;
  }

  function readBox(key) {
    try {
      if (typeof $prefs !== 'undefined' && $prefs.valueForKey) return $prefs.valueForKey(key) || '';
      if (typeof $persistentStore !== 'undefined' && $persistentStore.read) return $persistentStore.read(key) || '';
      if (typeof $task !== 'undefined' && $task.read) return $task.read(key) || '';
    } catch (e) {}
    return '';
  }

  // 通知：第 4 个参数会同时写入剪贴板（QX 支持 update-pasteboard）
  function notify(title, subtitle, body, clipboard) {
    const opts = { 'open-url': BOXJS_URL };
    if (clipboard) opts['update-pasteboard'] = clipboard;
    try {
      if (typeof $notify === 'function') {
        $notify(title, subtitle, body, opts);
      } else if (typeof $notification !== 'undefined' && $notification.post) {
        $notification.post(title, subtitle, body, opts);
      }
    } catch (e) {
      try {
        if (typeof $notify === 'function') $notify(title, subtitle, body);
        else if (typeof $notification !== 'undefined' && $notification.post) $notification.post(title, subtitle, body);
      } catch (e2) {}
    }
  }

  function timeStr() {
    const d = new Date();
    const p = (n) => (n < 10 ? '0' + n : '' + n);
    return (
      d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
    );
  }
})();
