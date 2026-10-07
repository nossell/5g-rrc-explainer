/* ============================================================
   assets/interview.js — 面试模式（2026-10-01）
   跨模块模拟面试：按学习域抽卷 + 计时 + 判分 + 错题本（本机留存）。
   题池 = 全部模块的结课测验（quiz）+ 课内决策点（decisionPoints），
   每题挂模块/域/条款锚点，错题一键跳回对应课程帧去重学。
   可访问性跟随授权：免费模块常开，付费模块题在演示解锁后入池。
   交互面参考 player.js 的 mountPlayer 模式：mount 返回 controller
   （e2e 可编程驱动：start/current/pick/next/state）。
   随机性可注入种子（mulberry32），保证测试可复现。
   ============================================================ */
(function (g) {
  'use strict';
  var R = g.RRC;

  /* ---------- 工具 ---------- */
  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function mdBold(s) { return esc(s).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>'); }
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffled(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var LS_KEY = 'rrc.interview.misses';

  /* ---------- 岗位模拟卷（卅六轮）：三套固定卷——seed 固定，同 key 每次同一套 ----------
     求职场景要的是"我下周面网优岗，给我一套固定卷"，不是每次都变的随机抽。 */
  var JOB_PAPERS = [
    { key: 'opt', name: '无线网优岗', blurb: '空闲态/接入/切换/重建/寻呼与定时器网——RRC 主战场', domains: ['RRC 十课', '空口底层'], seed: 39 },
    { key: 'core', name: '核心网岗', blurb: '注册/会话/切片/SBA/接口族台账', domains: ['NAS 与核心网', '接口与用户面'], seed: 40 },
    { key: 'test', name: '协议测试岗', blurb: '一致性测试/卡与终端/安全与跨层排障', domains: ['测试与终端', '安全与对照'], seed: 41 }
  ];
  function jobPaper(key) {
    return JOB_PAPERS.filter(function (p) { return p.key === key; })[0] || null;
  }

  /* ---------- JD 匹配（v7 块 2）：职位描述→学习域/岗位卷 ----------
     词表是工程配置（现有域名与课程主题的同义表达），不是协议内容——零新论断。
     纯函数实时匹配，JD 文本不落盘（零新 localStorage 键）。 */
  var JD_KEYWORDS = [
    { kws: ['网优', '网络优化', '覆盖', '掉话', '切换', '乒乓', 'rsrp', 'rsrq', 'sinr', '路测', 'kpi', '驻留', '重选', '寻呼', '无线侧'], domain: 'RRC 十课', paper: 'opt', w: 2 },
    { kws: ['核心网', 'amf', 'smf', 'upf', '会话', '切片', 's-nssai', '注册', '5gc', 'epc', '漫游', 'pdu'], domain: 'NAS 与核心网', paper: 'core', w: 2 },
    { kws: ['协议测试', '一致性', '仪表', '用例', '终端测试', 'usim', 'sim卡', '信令跟踪', '抓包', 'log', '日志分析'], domain: '测试与终端', paper: 'test', w: 2 },
    { kws: ['ngap', 'xnap', 'x2ap', 's1ap', 'f1ap', 'e1ap', 'gtp', 'sctp', '接口信令', '站间'], domain: '接口与用户面', paper: 'core', w: 2 },
    { kws: ['加密', '密钥', '安全', 'aka', '完整性', '算法'], domain: '安全与对照', paper: 'test', w: 1 },
    { kws: ['mac', '随机接入', 'prach', '物理层', 'qos', '5qi', '承载', 'sdap'], domain: '空口底层', paper: 'opt', w: 1 },
    { kws: ['ims', 'vonr', 'volte', '语音', '定位', 'ntn', 'redcap', '物联网', '垂直']  , domain: '业务与垂直', paper: null, w: 1 }
  ];
  function matchJD(text) {
    var s = String(text || '').toLowerCase();
    if (!s.trim()) return { topDomains: [], paper: null, hits: 0 };
    var domScore = {}, paperScore = {}, total = 0;
    JD_KEYWORDS.forEach(function (e) {
      var hits = 0;
      e.kws.forEach(function (kw) { if (s.indexOf(kw) >= 0) hits++; });
      if (!hits) return;
      total += hits;
      domScore[e.domain] = (domScore[e.domain] || 0) + hits * e.w;
      if (e.paper) paperScore[e.paper] = (paperScore[e.paper] || 0) + hits * e.w;
    });
    var topDomains = Object.keys(domScore).map(function (d) { return { domain: d, score: domScore[d] }; })
      .sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
    var bestPaper = null, bestS = 0;
    Object.keys(paperScore).forEach(function (k) { if (paperScore[k] > bestS) { bestS = paperScore[k]; bestPaper = k; } });
    return { topDomains: topDomains, paper: bestPaper, hits: total };
  }

  /* ---------- 学习产物导出（卅六轮）：纯函数生成 Markdown，Blob 下载零依赖 ----------
     buildMissMarkdown：错题本 → 面试弹药清单（题干/你的答案/正确答案/解析/条款锚/到期）
     buildProgressMarkdown：41 模块完成态/测验分/下一步建议 */
  function fmtDate(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function buildMissMarkdown(rows, poolArr) {
    var now = Date.now();
    var dueN = rows.filter(function (r) { return (r.due || 0) <= now; }).length;
    var L = ['# 错题本导出 · RRC 讲解器', '',
      '- 导出时间：' + fmtDate(now),
      '- 留存：' + rows.length + ' 题' + (dueN ? '（今日到期 ' + dueN + ' 题）' : '（今日无到期）'), ''];
    rows.forEach(function (r, i) {
      var q = (poolArr || []).filter(function (x) { return x.qid === r.qid; })[0];
      if (!q) { L.push('## ' + (i + 1) + '. [缺失] ' + r.qid, ''); return; }
      L.push('## ' + (i + 1) + '. ' + q.q.replace(/\*\*/g, ''), '',
        '- 模块：M' + q.modNum + ' ' + q.mod + '（' + q.domain + ' · ' + q.type + '）',
        '- 你的答案：' + (r.pick < 0 ? '未作答' : String.fromCharCode(65 + r.pick) + ' · ' + (q.options[r.pick] || '').replace(/\*\*/g, '')),
        '- 正确答案：' + String.fromCharCode(65 + q.correct) + ' · ' + q.options[q.correct].replace(/\*\*/g, ''),
        '- 解析：' + q.why.replace(/\*\*/g, ''),
        '- 条款锚点：§' + (q.ref || '—'),
        '- 复习：' + ((r.due || 0) <= now ? '**今日到期**' : fmtDate(r.due)) + '（间隔 iv=' + (r.iv || 0) + ' 天）', '');
    });
    L.push('---', '间隔复习规则：答对间隔翻倍（1→2→4→8 天），连对三轮自动出本。', '');
    return L.join('\n');
  }
  function buildProgressMarkdown(store) {
    var mods = R.order().map(function (id) { return R.get(id); });
    var done = mods.filter(function (m) { var p = store.progress(m.id); return p && p.done; });
    var quizOk = mods.filter(function (m) { var s = store.quizScore(m.id); return s && s.got === s.total; });
    var nextUp = null;
    for (var i = 0; i < mods.length; i++) {
      var p = store.progress(mods[i].id);
      if (!(p && p.done)) { nextUp = mods[i]; break; }
    }
    var L = ['# 学习进度导出 · RRC 讲解器', '',
      '- 导出时间：' + fmtDate(Date.now()),
      '- 授权：' + (store.license().demo ? '已解锁（演示）' : '未解锁（免费层）'),
      '- 完课：' + done.length + ' / ' + mods.length + ' · 测验满分：' + quizOk.length + ' 门', ''];
    L.push('| # | 模块 | 学完 | 测验 |');
    L.push('| --- | --- | --- | --- |');
    mods.forEach(function (m) {
      var p = store.progress(m.id), s = store.quizScore(m.id);
      L.push('| M' + m.num + ' | ' + m.title + ' | ' + (p && p.done ? '✓' : '—') + ' | ' + (s ? s.got + '/' + s.total : '未考') + ' |');
    });
    L.push('');
    if (nextUp) {
      L.push('## 下一步建议', '',
        '按学习序，你的下一课是 **M' + nextUp.num + ' ' + nextUp.title + '**（app.html#' + nextUp.id + '）。',
        nextUp.prereq && nextUp.prereq.length ? '前置：' + nextUp.prereq.map(function (id) { var m = R.get(id); return m ? 'M' + m.num + ' ' + m.title : id; }).join('、') + '。' : '', '');
    } else {
      L.push('## 下一步建议', '', '全部 ' + mods.length + ' 课学完——去面试页刷岗位模拟卷与错题复习，把知识变成 offer。', '');
    }
    return L.join('\n');
  }
  /* ---- 学习档案备份/恢复：只聚合 'rrc.v1' 与 'rrc.interview.misses' 两键 ---- */
  function buildBackupJSON(storeObj) {
    var storeData = null;
    if (storeObj && typeof storeObj.all === 'function') {
      storeData = storeObj.all();
    } else {
      try { storeData = JSON.parse(localStorage.getItem('rrc.v1') || 'null'); } catch (e0) { storeData = null; }
    }
    var missData = null;
    try { missData = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e1) { missData = null; }
    return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), store: storeData, misses: missData });
  }
  /* 结构校验失败一律不动原数据并返回 false；成功写回 'rrc.v1'（或注入 store 的后端）与错题本 */
  function restoreBackupJSON(text, storeObj) {
    var o;
    try { o = JSON.parse(text); } catch (e) { return false; }
    if (!o || typeof o !== 'object' || Array.isArray(o) || o.version !== 1) return false;
    if (!('store' in o) || !('misses' in o)) return false;
    var sd = o.store, ml = o.misses;
    if (sd !== null && (typeof sd !== 'object' || Array.isArray(sd))) return false;
    if (ml !== null && !Array.isArray(ml)) return false;
    if (sd) {
      if (sd.progress != null && (typeof sd.progress !== 'object' || Array.isArray(sd.progress))) return false;
      if (sd.quiz != null && (typeof sd.quiz !== 'object' || Array.isArray(sd.quiz))) return false;
      if (sd.license != null && (typeof sd.license !== 'object' || Array.isArray(sd.license))) return false;
    }
    if (ml) {
      for (var i = 0; i < ml.length; i++) {
        if (!ml[i] || typeof ml[i] !== 'object' || typeof ml[i].qid !== 'string') return false;
      }
    }
    if (storeObj && typeof storeObj.importAll === 'function' && sd) {
      storeObj.importAll(sd);
      if (ml) localStorage.setItem(LS_KEY, JSON.stringify(ml));
    } else {
      if (sd) localStorage.setItem('rrc.v1', JSON.stringify(sd));
      if (ml) localStorage.setItem(LS_KEY, JSON.stringify(ml));
    }
    return true;
  }

  function downloadText(name, text) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  /* ---------- 题池 ---------- */
  /* 返回当前授权可访问的全部题目：{qid, mod, modNum, type, domain, q, options, correct, why, ref} */
  function pool(store) {
    store = store || R.Store();
    var demo = store.license().demo;
    var out = [];
    R.modules().forEach(function (m) {
      if (!m.free && !demo) return;
      var domain = '其他课程';
      if (R.HUB_GROUPS) {
        R.HUB_GROUPS.forEach(function (grp) {
          if (grp.mods.indexOf(m.id) >= 0) domain = grp.short;
        });
      }
      (m.quiz || []).forEach(function (q, qi) {
        out.push({ qid: m.id + ':q' + qi, mod: m.id, modNum: m.num, type: '测验', domain: domain,
          q: q.q, options: q.o, correct: q.a, why: q.why, ref: q.ref });
      });
      (m.decisionPoints || []).forEach(function (d, di) {
        out.push({ qid: m.id + ':d' + di, mod: m.id, modNum: m.num, type: '决策点', domain: domain,
          q: d.q, options: d.options, correct: d.correct, why: d.why, ref: d.ref });
      });
    });
    return out;
  }
  /* 选项洗牌：返回 {options, correct}（correct 重映射到新位置） */
  function shuffleOptions(q, rnd) {
    var idx = shuffled(q.options.map(function (_, i) { return i; }), rnd);
    return {
      options: idx.map(function (i) { return q.options[i]; }),
      correct: idx.indexOf(q.correct)
    };
  }

  /* ---------- 错题本存取（本机 localStorage，独立于 Store 进度） ----------
     行结构 {qid, mod, pick, ts} + SM-2 轻量排期字段（v2 起可选）：
     iv=当前间隔（天，1→2→4→8，16 毕业出本）、due=下次复习时间戳。
     旧数据无 due 视为立即到期（迁移兼容）。 */
  var DAY = 86400000;
  function loadMisses() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveMisses(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 200))); } catch (e) {}
  }
  function dueRows() {
    var now = Date.now();
    return loadMisses().filter(function (r) { return (r.due || 0) <= now; });
  }

  /* ---------- 就绪度（v6 块 3）：按学习域实时聚合，零新 localStorage 键 ----------
     域内完成课占比 50% + quiz 正确率 30% + 错题本该域到期清零度 20% → 0–100 分。
     只统计当前授权可见的模块（付费未解锁不扣分）；纯读 store + 错题本。 */
  function domainOf(mid) {
    var dom = '其他课程';
    if (R.HUB_GROUPS) R.HUB_GROUPS.forEach(function (grp) {
      if (grp.mods.indexOf(mid) >= 0) dom = grp.short;
    });
    return dom;
  }
  function readinessFor(store) {
    store = store || R.Store();
    var demo = store.license().demo;
    var p = pool(store);
    var domains = [];
    if (R.HUB_GROUPS) R.HUB_GROUPS.forEach(function (grp) {
      if (p.some(function (q) { return q.domain === grp.short; }) && domains.indexOf(grp.short) < 0) domains.push(grp.short);
    });
    var misses = loadMisses(), now = Date.now();
    return domains.map(function (d) {
      var mods = R.modules().filter(function (m) { return (m.free || demo) && domainOf(m.id) === d; });
      var doneN = mods.filter(function (m) { var pr = store.progress(m.id); return pr && pr.done; }).length;
      var donePct = mods.length ? doneN / mods.length : 0;
      var qGot = 0, qTot = 0;
      mods.forEach(function (m) { var s = store.quizScore(m.id); if (s && s.total) { qGot += s.got; qTot += s.total; } });
      var quizPct = qTot ? qGot / qTot : 0;
      var rows = misses.filter(function (r) {
        var q = p.filter(function (x) { return x.qid === r.qid; })[0];
        return q && q.domain === d;
      });
      var missPct = rows.length ? 1 - rows.filter(function (r) { return (r.due || 0) <= now; }).length / rows.length : 1;
      var score = Math.round(50 * donePct + 30 * quizPct + 20 * missPct);
      score = Math.max(0, Math.min(100, score));
      return { domain: d, score: score, verdict: score < 40 ? '起步期' : score < 70 ? '强化期' : '应试期', doneN: doneN, modN: mods.length };
    });
  }
  /* ---------- 追问训练折叠块（结果页与错题本共用；数据在 assets/content/followups.js） ---------- */
  function followupBlock(qid) {
    var fu = (typeof g.RRC_FOLLOWUPS !== 'undefined' && g.RRC_FOLLOWUPS) ? g.RRC_FOLLOWUPS.get(qid) : null;
    if (!fu || !fu.levels || !fu.levels.length) return null;
    var box = el('div', 'iv-fu');
    var btn = el('button', 'iv-fu-btn', '追问训练（' + fu.levels.length + ' 层）——面试官会怎么追问');
    var list = el('div', 'iv-fu-list');
    list.innerHTML = fu.levels.map(function (lv, li) {
      return '<div class="iv-fu-lv"><div class="iv-fu-q">追问 ' + (li + 1) + '：' + mdBold(lv.q) + '</div>' +
        '<div class="iv-fu-a">' + mdBold(lv.a) + ' <span class="ref-badge">§' + esc(lv.ref) + '</span></div></div>';
    }).join('');
    btn.onclick = function () { box.classList.toggle('open'); };
    box.appendChild(btn); box.appendChild(list);
    return box;
  }

  /* ---------- 挂载 ---------- */
  function mount(root, store, opts) {
    opts = opts || {};
    store = store || R.Store();
    var rnd = Math.random;
    if (opts.seed != null) rnd = mulberry32(opts.seed);
    var timerOn = opts.timer !== false;
    var exam = null, view = 'config';

    root.innerHTML = '';
    var tabs = el('div', 'iv-tabs');
    var tabExam = el('button', 'on', '模拟面试');
    var tabMiss = el('button', '', '错题本');
    tabs.appendChild(tabExam); tabs.appendChild(tabMiss);
    var body = el('div');
    root.appendChild(tabs); root.appendChild(body);

    tabExam.onclick = function () { setTab('config'); };
    tabMiss.onclick = function () { setTab('misses'); };
    function setTab(v) {
      view = v;
      tabExam.classList.toggle('on', v !== 'misses');
      tabMiss.classList.toggle('on', v === 'misses');
      render();
    }

    /* ---- 配置视图 ---- */
    var cfg = { domain: 'all', count: 5, timer: timerOn };
    function renderConfig() {
      var p = pool(store);
      var domains = [];
      if (R.HUB_GROUPS) R.HUB_GROUPS.forEach(function (grp) {
        if (p.some(function (q) { return q.domain === grp.short; })) domains.push(grp.short);
      });
      var missN = loadMisses().length;
      var dueN = dueRows().length;
      var w = el('div', 'iv-config');
      var scope = el('select', 'iv-scope');
      scope.innerHTML = '<option value="all">全部学习域</option>' +
        domains.map(function (d) { return '<option value="' + esc(d) + '">' + esc(d) + '</option>'; }).join('');
      scope.value = cfg.domain;
      scope.onchange = function () { cfg.domain = scope.value; };
      var seg = el('div', 'iv-seg');
      [3, 5, 10, 20].forEach(function (n) {
        var b = el('button', cfg.count === n ? 'on' : '', n + ' 题');
        b.onclick = function () { cfg.count = n; renderConfig(); };
        seg.appendChild(b);
      });
      var tgl = el('label', 'plain-toggle');
      tgl.innerHTML = '<input type="checkbox"' + (cfg.timer ? ' checked' : '') + '><span class="pt-track"><span class="pt-knob"></span></span>每题 60 秒（面试节奏，到点自动交卷）';
      tgl.querySelector('input').onchange = function (e) { cfg.timer = e.target.checked; };
      var demo = store.license().demo;
      /* 就绪度卡（v6 块 3）：实时聚合，零新存储键 */
      var rd = readinessFor(store);
      if (rd.length) {
        var rcard = el('div', 'iv-readiness');
        rcard.innerHTML = '<div class="iv-rd-cap">就绪度 · 按学习域（完成课 50% + 测验正确率 30% + 错题清零 20%）</div>' +
          '<div class="iv-rd-row">' + rd.map(function (x) {
            return '<div class="iv-rd-cell"><b>' + esc(x.domain) + '</b>' +
              '<span class="iv-rd-bar"><i style="width:' + x.score + '%"></i></span>' +
              '<em>' + x.score + '</em><u>' + esc(x.verdict) + '</u>' +
              '<small>' + x.doneN + '/' + x.modN + ' 课</small></div>';
          }).join('') + '</div>';
        w.appendChild(rcard);
      }
      /* JD 匹配卡（v7 块 2）：贴职位描述→推荐学习域与岗位卷；纯前端实时，文本不上传不落盘 */
      var jd = el('div', 'iv-jd');
      jd.innerHTML = '<div class="iv-rd-cap">JD 匹配 · 把职位描述贴进来（本机实时匹配，不上传）</div>' +
        '<textarea class="iv-jd-in" rows="3" placeholder="粘贴 JD 的一段话，例如：负责 5G 无线网络优化，处理切换、掉话、覆盖类 KPI 问题……"></textarea>' +
        '<div class="iv-jd-out"></div>';
      var jdOut = jd.querySelector('.iv-jd-out');
      jd.querySelector('.iv-jd-in').addEventListener('input', function (e) {
        var r = matchJD(e.target.value);
        if (!r.topDomains.length) {
          jdOut.innerHTML = r.hits || e.target.value.trim() ? '<span class="iv-jd-none">没匹配到明确方向——先按全部学习域来一套模拟面试，或看看下方岗位快选。</span>' : '';
          return;
        }
        jdOut.innerHTML = '<div class="iv-jd-domains">' + r.topDomains.map(function (x) {
          return '<span class="badge">' + esc(x.domain) + ' · 匹配 ' + x.score + '</span>';
        }).join('') + '</div>' +
        (r.paper ? '<button class="btn sm iv-jd-go">开对应的岗位模拟卷 →</button>' : '');
        var go = jdOut.querySelector('.iv-jd-go');
        if (go) go.onclick = function () { startJobPaper(r.paper); };
      });
      w.appendChild(jd);
      var meta = el('p', 'iv-meta',
        '题库共 <b>' + pool(Object.assign({}, store, { license: function () { return { demo: true }; } })).length + '</b> 题' +
        '（当前可用 <b>' + p.length + '</b> 题' + (demo ? '' : '——演示解锁后全部开放') + '）' +
        (missN ? ' · 错题本留存 <b>' + missN + '</b> 题' + (dueN ? '（<b>' + dueN + '</b> 题今日到期）' : '（今日无到期）') : '') +
        '。随机抽题、选项洗牌，答完即出解析与条款出处；错题按间隔复习（1→2→4→8 天，连对三轮出本）。');
      var actions = el('div', 'iv-actions');
      var go = el('button', 'btn primary', '开始面试');
      go.onclick = function () { start(); };
      actions.appendChild(go);
      var daily = el('button', 'btn', '今日一题（' + fmtDate(Date.now()) + '）');
      daily.title = '同一天打开都是同一题——确定性抽题，出自当前授权可用池';
      daily.onclick = function () { startDaily(); };
      actions.appendChild(daily);
      if (dueN) {
        var rv = el('button', 'btn accent', '今日复习（' + dueN + ' 题到期）');
        rv.onclick = function () { startDue(); };
        actions.appendChild(rv);
      }
      if (!demo) {
        var ub = el('button', 'btn', '演示解锁全部');
        ub.onclick = function () { store.setLicense({ demo: true }); render(); };
        actions.appendChild(ub);
      }
      w.appendChild(el('div', 'iv-row', '<span class="iv-cap">范围</span>'));
      w.appendChild(scope);
      w.appendChild(el('div', 'iv-row', '<span class="iv-cap">题数</span>'));
      w.appendChild(seg);
      w.appendChild(el('div', 'iv-row', '<span class="iv-cap">计时</span>'));
      w.appendChild(tgl);
      w.appendChild(meta);
      /* 岗位快选：三张固定卷卡，点击直接开考（绕过域下拉）。
         免费层兜底：当前授权下候选不足 12 题的卷置灰并说明——点了不开考、不再静默。 */
      var jobRow = el('div', 'iv-job-row');
      JOB_PAPERS.forEach(function (jp) {
        var candN = p.filter(function (q) { return jp.domains.indexOf(q.domain) >= 0; }).length;
        var enough = candN >= 12;
        var card = el('button', 'iv-job-card' + (enough ? '' : ' dim'));
        card.innerHTML = '<b>' + esc(jp.name) + '</b><span>' + esc(jp.blurb) + '</span>' +
          '<i>' + (enough ? '固定 12 题卷 · 点击即开考' : '需解锁全部模块（当前可用 ' + candN + ' 题）') + '</i>';
        if (enough) card.onclick = function () { startJobPaper(jp.key); };
        else card.disabled = true;
        jobRow.appendChild(card);
      });
      w.appendChild(el('div', 'iv-row', '<span class="iv-cap">岗位快选</span>'));
      w.appendChild(jobRow);
      w.appendChild(actions);
      return w;
    }

    /* ---- 开考 ---- */
    function start(fromMisses) {
      var p = pool(store);
      if (fromMisses) {
        var missQs = loadMisses().map(function (r) {
          return p.filter(function (q) { return q.qid === r.qid; })[0];
        }).filter(Boolean);
        if (!missQs.length) { renderConfig(); return; }
        exam = buildExam(missQs.slice(0, 20));
      } else {
        var cand = cfg.domain === 'all' ? p : p.filter(function (q) { return q.domain === cfg.domain; });
        exam = buildExam(shuffled(cand, rnd).slice(0, cfg.count));
      }
      /* 到期复习共用同一开考路径：review 模式由 startDue 先改 exam 再落到这里 */
      view = 'exam';
      render();
    }
    /* 今日复习：只抽到期错题（SM-2），按 due 升序，上限 20 */
    function startDue() {
      var p = pool(store);
      var qs = dueRows().sort(function (a, b) { return (a.due || 0) - (b.due || 0); })
        .map(function (r) { return p.filter(function (q) { return q.qid === r.qid; })[0]; })
        .filter(Boolean).slice(0, 20);
      if (!qs.length) { renderConfig(); return; }
      exam = buildExam(qs);
      view = 'exam';
      render();
    }
    function buildExam(qs) {
      var list = qs.map(function (q) {
        var so = shuffleOptions(q, rnd);
        return { q: q, options: so.options, correct: so.correct, pick: null };
      });
      return { qs: list, idx: 0, score: 0, endsAt: cfg.timer ? list.length * 60 : 0, tick: null, auto: false };
    }
    /* 岗位模拟卷：按卷 seed 固定抽 12 题——同 key 每次开出同一套卷（选项顺序也一致） */
    function startJobPaper(key) {
      var jp = jobPaper(key);
      if (!jp) return;
      var cand = pool(store).filter(function (q) { return jp.domains.indexOf(q.domain) >= 0; });
      if (cand.length < 12) { renderConfig(); return; }
      exam = buildExam(shuffled(cand, mulberry32(jp.seed)).slice(0, 12));
      exam.paper = jp.name;
      view = 'exam';
      render();
    }

    /* 今日一题：seed=当天 YYYYMMDD——同日每次打开都是同一题（确定性抽 1 题出自当前授权可用池） */
    function startDaily() {
      var d = new Date();
      var seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
      exam = buildExam(shuffled(pool(store), mulberry32(seed)).slice(0, 1));
      exam.paper = '今日一题 · ' + fmtDate(Date.now());
      view = 'exam';
      render();
    }

    /* ---- 考中 ---- */
    function renderExam() {
      var cur = exam.qs[exam.idx];
      var w = el('div', 'iv-exam');
      var top = el('div', 'iv-top');
      top.innerHTML = '<span class="iv-prog">第 ' + (exam.idx + 1) + ' / ' + exam.qs.length + ' 题</span>' +
        (cfg.timer && exam.endsAt ? '<span class="iv-timer" id="iv-timer">--:--</span>' : '');
      var bar = el('div', 'progressbar');
      var done = exam.qs.filter(function (x) { return x.pick != null; }).length;
      bar.innerHTML = '<i style="width:' + (done / exam.qs.length * 100) + '%"></i>';
      w.appendChild(top); w.appendChild(bar);
      w.appendChild(el('div', 'iv-qmeta',
        '<span class="badge">' + esc(cur.q.domain) + '</span> <span class="badge">' + cur.q.type + '</span> ' +
        'M' + cur.q.modNum + ' · <a class="wb-link" href="app.html#' + esc(cur.q.mod) + '">' + esc(modTitle(cur.q.mod)) + '</a>' +
        ' <span class="ref-badge" title="条款锚点">§' + esc(cur.q.ref || '') + '</span>'));
      w.appendChild(el('div', 'iv-q', mdBold(cur.q.q)));
      var optsBox = el('div', 'iv-opts');
      cur.options.forEach(function (o, oi) {
        var b = el('button', 'iv-opt', String.fromCharCode(65 + oi) + ' · ' + esc(o));
        if (cur.pick != null) {
          b.disabled = true;
          if (oi === cur.q.correct) b.classList.add('correct');
          else if (oi === cur.pick) b.classList.add('wrong');
        } else {
          (function (i) { b.onclick = function () { pick(i); render(); }; })(oi);
        }
        optsBox.appendChild(b);
      });
      w.appendChild(optsBox);
      if (cur.pick != null) {
        var okAns = cur.pick === cur.q.correct;
        var feed = el('div', 'iv-feed' + (okAns ? ' good' : ' bad'));
        feed.innerHTML = '<b>' + (okAns ? '答对了。' : (cur.pick == null ? '未作答。' : '不对，正确是 ' + String.fromCharCode(65 + cur.q.correct) + '。')) + '</b>' +
          mdBold(cur.q.why);
        w.appendChild(feed);
        var nxt = el('div', 'iv-actions');
        var nb = el('button', 'btn primary', exam.idx + 1 < exam.qs.length ? '下一题' : '交卷');
        nb.onclick = function () { next(); };
        nxt.appendChild(nb);
        w.appendChild(nxt);
      }
      if (cfg.timer && exam.endsAt) startTick();
      return w;
    }
    function modTitle(id) {
      var m = R.get(id);
      return m ? m.title : id;
    }
    function startTick() {
      clearInterval(exam.tick);
      var tEl = document.getElementById('iv-timer');
      if (!tEl) return;
      function draw() {
        var left = Math.max(0, exam.endsAt - Math.floor(Date.now() / 1000) + exam.startedAt);
        var mm = Math.floor(left / 60), ss = left % 60;
        tEl.textContent = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
        if (left <= 0) { clearInterval(exam.tick); finish(true); }
      }
      exam.startedAt = exam.startedAt || Math.floor(Date.now() / 1000);
      draw();
      exam.tick = setInterval(draw, 1000);
    }
    function pick(i) {
      var cur = exam.qs[exam.idx];
      if (cur.pick != null) return;
      cur.pick = i;
      if (i === cur.q.correct) exam.score++;
    }
    function next() {
      clearInterval(exam.tick);
      if (exam.idx + 1 < exam.qs.length) { exam.idx++; render(); }
      else finish(false);
    }
    function finish(auto) {
      exam.auto = !!auto;
      recordMisses();
      view = 'result';
      render();
    }

    /* ---- 判分与错题落账（SM-2 轻量：答对升间隔，≥16 天毕业出本；答错回到今日） ---- */
    function recordMisses() {
      var miss = loadMisses();
      exam.qs.forEach(function (x) {
        var right = x.pick === x.q.correct;
        var i = miss.findIndex(function (r) { return r.qid === x.q.qid; });
        if (right) {
          if (i < 0) return;
          var iv = (miss[i].iv || 0) ? Math.min(miss[i].iv * 2, 32) : 1;
          if (iv >= 16) { miss.splice(i, 1); return; } /* 连对三轮，毕业 */
          miss[i].iv = iv;
          miss[i].due = Date.now() + iv * DAY;
        } else {
          var row = { qid: x.q.qid, mod: x.q.mod, pick: x.pick == null ? -1 : x.pick, ts: Date.now(), iv: 0, due: Date.now() };
          if (i >= 0) miss[i] = row; else miss.unshift(row);
        }
      });
      saveMisses(miss);
    }

    /* ---- 结果视图 ---- */
    function renderResult() {
      var n = exam.qs.length;
      var byDomain = {};
      exam.qs.forEach(function (x) {
        var d = byDomain[x.q.domain] = byDomain[x.q.domain] || [0, 0];
        d[1]++; if (x.pick === x.q.correct) d[0]++;
      });
      var wrong = exam.qs.filter(function (x) { return x.pick !== x.q.correct; });
      var w = el('div', 'iv-result');
      var verdict = exam.score === n ? '全场通过，面试官点头了。' : exam.score >= n * 0.7 ? '基本盘稳，错题补完就能上岸。' : '面试官皱眉了——回课重学错题对应的知识点。';
      w.appendChild(el('div', 'iv-score', '<b>' + exam.score + ' / ' + n + '</b><span>' + verdict + (exam.auto ? '（计时到点自动交卷，未答按错计）' : '') + '</span>'));
      var chips = el('div', 'iv-domains');
      Object.keys(byDomain).forEach(function (d) {
        chips.appendChild(el('span', 'badge', d + ' ' + byDomain[d][0] + '/' + byDomain[d][1]));
      });
      w.appendChild(chips);
      if (wrong.length) {
        w.appendChild(el('h3', 'sec', '错题解析（' + wrong.length + ' 题）'));
        wrong.forEach(function (x) {
          var row = el('div', 'iv-wrong');
          row.innerHTML = '<div class="ivw-q">' + mdBold(x.q.q) + '</div>' +
            '<div class="ivw-a">你的答案：' + (x.pick == null ? '<b class="bad">未作答</b>' : '<b class="bad">' + String.fromCharCode(65 + x.pick) + ' · ' + esc(x.options[x.pick]) + '</b>') +
            '　正确：<b class="good">' + String.fromCharCode(65 + x.q.correct) + ' · ' + esc(x.options[x.q.correct]) + '</b></div>' +
            '<div class="ivw-why">' + mdBold(x.q.why) + '</div>' +
            '<div class="ivw-foot"><a class="wb-link" href="app.html#' + esc(x.q.mod) + '">去重学：M' + x.q.modNum + ' ' + esc(modTitle(x.q.mod)) + ' →</a>' +
            ' <span class="ref-badge">§' + esc(x.q.ref || '') + '</span></div>';
          var fb = followupBlock(x.q.qid);
          if (fb) row.appendChild(fb);
          w.appendChild(row);
        });
      }
      var actions = el('div', 'iv-actions');
      var again = el('button', 'btn primary', '再来一套');
      again.onclick = function () { view = 'config'; render(); };
      actions.appendChild(again);
      if (wrong.length) {
        var rp = el('button', 'btn', '只重练本次错题（' + wrong.length + ' 题）');
        rp.onclick = function () { exam = buildExam(wrong); exam.idx = 0; exam.score = 0; view = 'exam'; render(); };
        actions.appendChild(rp);
      }
      var wb = el('button', 'btn', '错题本');
      wb.onclick = function () { setTab('misses'); };
      actions.appendChild(wb);
      w.appendChild(actions);
      return w;
    }

    /* ---- 错题本视图 ---- */
    function renderMisses() {
      var p = pool(store);
      var rows = loadMisses();
      var w = el('div', 'iv-wb');
      if (!rows.length) {
        w.appendChild(el('p', 'sec-sub', '错题本是空的——先来一套模拟面试，答错的题会自动留在这里。'));
        var go = el('button', 'btn primary', '开始面试');
        go.onclick = function () { setTab('config'); };
        w.appendChild(go);
        return w;
      }
      var dueN = dueRows().length;
      if (rows.length >= 200) w.appendChild(el('p', 'iv-meta', '⚠️ 错题本已满 200 条上限——新错题会<b>挤出最旧的记录</b>；建议先用"清空错题本"或间隔复习消化几条再继续。'));
      w.appendChild(el('p', 'iv-meta', '留存 <b>' + rows.length + '</b> 题' + (dueN ? '（<b>' + dueN + '</b> 题今日到期）' : '（今日无到期，间隔复习中）') + '。答对升间隔（1→2→4→8 天），连对三轮自动出本。'));
      rows.slice(0, 50).forEach(function (r) {
        var q = p.filter(function (x) { return x.qid === r.qid; })[0];
        var dueTag = '';
        if (r.due) {
          var dd = Math.ceil((r.due - Date.now()) / DAY);
          dueTag = dd <= 0 ? ' <span class="badge">今日到期</span>' : ' <span class="badge">' + dd + ' 天后复习</span>';
        }
        var row = el('div', 'iv-wrong');
        if (!q) {
          row.innerHTML = '<div class="ivw-q">[' + esc(r.mod) + '] 题目暂不可用（模块未加载或未解锁）</div>';
        } else {
          row.innerHTML = '<div class="ivw-q">' + mdBold(q.q) + '</div>' +
            '<div class="ivw-a">上次答：' + (r.pick < 0 ? '<b class="bad">未作答</b>' : '<b class="bad">' + String.fromCharCode(65 + r.pick) + '</b>') +
            '　正确：<b class="good">' + String.fromCharCode(65 + q.correct) + ' · ' + esc(q.options[q.correct]) + '</b>' +
            '　<span class="badge">' + esc(q.domain) + '</span> <span class="ref-badge">§' + esc(q.ref || '') + '</span>' + dueTag + '</div>' +
            '<div class="ivw-foot"><a class="wb-link" href="app.html#' + esc(q.mod) + '">去重学 →</a></div>';
          var fb = followupBlock(q.qid);
          if (fb) row.appendChild(fb);
        }
        w.appendChild(row);
      });
      var actions = el('div', 'iv-actions');
      var rp = el('button', 'btn primary', '重练错题（最多 20 题）');
      rp.onclick = function () { start(true); };
      actions.appendChild(rp);
      if (dueN) {
        var rv = el('button', 'btn accent', '今日复习（' + dueN + ' 题）');
        rv.onclick = function () { startDue(); };
        actions.appendChild(rv);
      }
      var clr = el('button', 'btn', '清空错题本');
      clr.onclick = function () { saveMisses([]); render(); };
      actions.appendChild(clr);
      var ex = el('button', 'btn', '导出 Markdown');
      ex.onclick = function () {
        downloadText('rrc-错题本-' + fmtDate(Date.now()) + '.md', buildMissMarkdown(loadMisses(), p));
      };
      actions.appendChild(ex);
      w.appendChild(actions);
      return w;
    }

    function render() {
      clearInterval(exam && exam.tick);
      body.innerHTML = '';
      if (view === 'config') body.appendChild(renderConfig());
      else if (view === 'exam' && exam) body.appendChild(renderExam());
      else if (view === 'result' && exam) body.appendChild(renderResult());
      else if (view === 'misses') body.appendChild(renderMisses());
      /* 重挂计时（renderExam 内 startTick 需要在入 DOM 后取到 #iv-timer） */
      if (view === 'exam' && exam && cfg.timer && exam.endsAt && exam.qs[exam.idx].pick == null) startTick();
    }

    render();
    return {
      start: function (c) { if (c) { if (c.count) cfg.count = c.count; if (c.domain) cfg.domain = c.domain; if (c.timer != null) cfg.timer = c.timer; } start(); },
      current: function () {
        if (view !== 'exam' || !exam) return null;
        var cur = exam.qs[exam.idx];
        return { qid: cur.q.qid, q: cur.q.q, options: cur.options, correct: cur.q.correct, pick: cur.pick, mod: cur.q.mod, domain: cur.q.domain };
      },
      pick: function (i) { pick(i); render(); },
      next: function () { next(); },
      finish: function () { finish(false); },
      startJobPaper: function (k) { startJobPaper(k); },
      jobPapers: function () { return JOB_PAPERS; },
      buildMissExport: function () { return buildMissMarkdown(loadMisses(), pool(store)); },
      buildProgressExport: function () { return buildProgressMarkdown(store); },
      buildBackupExport: function () { return buildBackupJSON(store); },
      restoreBackup: function (text) { var okRes = restoreBackupJSON(text, store); if (okRes) render(); return okRes; },
      startDaily: function () { startDaily(); },
      practiceMisses: function () { start(true); },
      startReview: function () { startDue(); },
      reviewDue: function () { return dueRows().length; },
      showWrongbook: function () { setTab('misses'); },
      misses: function () { return loadMisses(); },
      followups: function (qid) { return (typeof g.RRC_FOLLOWUPS !== 'undefined' && g.RRC_FOLLOWUPS) ? g.RRC_FOLLOWUPS.get(qid) : null; },
      matchJD: function (text) { return matchJD(text); },
      readiness: function () { return readinessFor(store); },
      state: function () {
        return { phase: view, idx: exam ? exam.idx : 0, n: exam ? exam.qs.length : 0, score: exam ? exam.score : 0 };
      },
      unmount: function () { clearInterval(exam && exam.tick); root.innerHTML = ''; }
    };
  }

  R.Interview = { mount: mount, pool: pool, buildMissMarkdown: buildMissMarkdown, buildProgressMarkdown: buildProgressMarkdown,
    buildBackupJSON: buildBackupJSON, restoreBackupJSON: restoreBackupJSON, readinessFor: readinessFor, matchJD: matchJD };
})(typeof window !== 'undefined' ? window : globalThis);
