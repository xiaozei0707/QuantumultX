/***************************************
 * 网易云音乐 MUSIC_U 抓取 → 写入 BoxJS
 * 平台：Quantumult X（script-request-header）
 * 触发：^https?:\/\/interface\d?\.music\.163\.com\/x?w?e?api\/vipauth\/app\/auth\/(soundquality\/)?query
 *       （\/x?w?e?api\/ 覆盖 api / eapi / wapi / weapi / xapi / xeapi / xweapi）
 * 说明：只抓取、只保存，不修改任何请求/响应，不影响播放与账号安全
 ***************************************/

const KEY_MUSIC_U = 'wyy_music_u';        // BoxJS 里的 MUSIC_U
const KEY_UPDATED = 'wyy_music_u_time';   // 最后更新时间
const BOXJS_URL = 'http://boxjs.com';

!(function () {
  try {
    const req = typeof $request !== 'undefined' ? $request : {};
    const headers = req.headers || {};

    const musicU = pickMusicU(headers);

    if (!musicU) {
      console.log('[MUSIC_U] 本次请求未找到 MUSIC_U，跳过');
      return finish();
    }

    const old = readBox(KEY_MUSIC_U);
    const now = timeStr();

    writeBox(KEY_MUSIC_U, musicU);
    writeBox(KEY_UPDATED, now);

    // 日志：抓取成功 + 抓到的 cookie
    console.log('[MUSIC_U] ✅ 抓取成功');
    console.log('[MUSIC_U] cookie: MUSIC_U=' + musicU);
    console.log('[MUSIC_U] 长度 ' + musicU.length + ' 位 · ' + now);

    if (old === musicU) {
      console.log('[MUSIC_U] 与 BoxJS 中已存值一致，仅刷新时间');
    } else {
      console.log('[MUSIC_U] BoxJS 已更新（旧值 ' + (old ? old.length + ' 位' : '无') + ' → 新值 ' + musicU.length + ' 位）');
      notify(
        '✅ 网易云 MUSIC_U 抓取成功',
        '长度 ' + musicU.length + ' 位 · ' + now + ' · 已写入 BoxJS',
        'cookie: MUSIC_U=' + musicU,
        'MUSIC_U=' + musicU
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

  // 取出 MUSIC_U：优先 Cookie 头，兜底扫描全部请求头
  function pickMusicU(h) {
    const cookie = getHeader(h, 'cookie');
    let v = matchMusicU(cookie);
    if (v) return v;

    for (const k in h) {
      if (!k || k.toLowerCase() === 'cookie') continue;
      v = matchMusicU(h[k]);
      if (v) return v;
    }
    return '';
  }

  // 大小写不敏感地读请求头
  function getHeader(h, name) {
    const target = name.toLowerCase();
    for (const k in h) {
      if (k && k.toLowerCase() === target) return String(h[k] == null ? '' : h[k]);
    }
    return '';
  }

  // 从一段文本里匹配 MUSIC_U=xxxx（兼容 %3D 编码与带引号）
  function matchMusicU(raw) {
    if (!raw) return '';

    let text = String(raw);
    // 部分版本会把整段 cookie 做 urlencode
    if (/%3D|%3B/i.test(text)) {
      try { text = decodeURIComponent(text); } catch (e) {}
    }

    const m = /(?:^|[;\s&,"])MUSIC_U=([^;,\s"'&]+)/i.exec(text);
    if (!m) return '';

    let val = m[1].trim().replace(/^["']|["']$/g, '');
    if (val.length < 16) return '';
    if (!/^[0-9A-Za-z+/=_.%-]+$/.test(val)) return '';
    return val;
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
