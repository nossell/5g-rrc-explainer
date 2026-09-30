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

  /* ---------- 错题本存取（本机 localStorage，独立于 Store 进度） ---------- */
  function loadMisses() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveMisses(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 200))); } catch (e) {}
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
      var meta = el('p', 'iv-meta',
        '题库共 <b>' + pool(Object.assign({}, store, { license: function () { return { demo: true }; } })).length + '</b> 题' +
        '（当前可用 <b>' + p.length + '</b> 题' + (demo ? '' : '——演示解锁后全部开放') + '）' +
        (missN ? ' · 错题本留存 <b>' + missN + '</b> 题' : '') +
        '。随机抽题、选项洗牌，答完即出解析与条款出处。');
      var actions = el('div', 'iv-actions');
      var go = el('button', 'btn primary', '开始面试');
      go.onclick = function () { start(); };
      actions.appendChild(go);
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

    /* ---- 判分与错题落账 ---- */
    function recordMisses() {
      var miss = loadMisses();
      exam.qs.forEach(function (x) {
        var right = x.pick === x.q.correct;
        if (right) {
          /* 练对旧错题 → 出本 */
          var j = miss.findIndex(function (r) { return r.qid === x.q.qid; });
          if (j >= 0) miss.splice(j, 1);
        } else {
          var i = miss.findIndex(function (r) { return r.qid === x.q.qid; });
          var row = { qid: x.q.qid, mod: x.q.mod, pick: x.pick == null ? -1 : x.pick, ts: Date.now() };
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
      w.appendChild(el('p', 'iv-meta', '留存 <b>' + rows.length + '</b> 题（重练答对自动出本）。'));
      rows.slice(0, 50).forEach(function (r) {
        var q = p.filter(function (x) { return x.qid === r.qid; })[0];
        var row = el('div', 'iv-wrong');
        if (!q) {
          row.innerHTML = '<div class="ivw-q">[' + esc(r.mod) + '] 题目暂不可用（模块未加载或未解锁）</div>';
        } else {
          row.innerHTML = '<div class="ivw-q">' + mdBold(q.q) + '</div>' +
            '<div class="ivw-a">上次答：' + (r.pick < 0 ? '<b class="bad">未作答</b>' : '<b class="bad">' + String.fromCharCode(65 + r.pick) + '</b>') +
            '　正确：<b class="good">' + String.fromCharCode(65 + q.correct) + ' · ' + esc(q.options[q.correct]) + '</b>' +
            '　<span class="badge">' + esc(q.domain) + '</span> <span class="ref-badge">§' + esc(q.ref || '') + '</span></div>' +
            '<div class="ivw-foot"><a class="wb-link" href="app.html#' + esc(q.mod) + '">去重学 →</a></div>';
        }
        w.appendChild(row);
      });
      var actions = el('div', 'iv-actions');
      var rp = el('button', 'btn primary', '重练错题（最多 20 题）');
      rp.onclick = function () { start(true); };
      actions.appendChild(rp);
      var clr = el('button', 'btn', '清空错题本');
      clr.onclick = function () { saveMisses([]); render(); };
      actions.appendChild(clr);
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
        return { qid: cur.q.qid, q: cur.q.q, options: cur.options, correct: cur.q.correct, pick: cur.pick, mod: cur.q.mod };
      },
      pick: function (i) { pick(i); render(); },
      next: function () { next(); },
      finish: function () { finish(false); },
      practiceMisses: function () { start(true); },
      showWrongbook: function () { setTab('misses'); },
      misses: function () { return loadMisses(); },
      state: function () {
        return { phase: view, idx: exam ? exam.idx : 0, n: exam ? exam.qs.length : 0, score: exam ? exam.score : 0 };
      },
      unmount: function () { clearInterval(exam && exam.tick); root.innerHTML = ''; }
    };
  }

  R.Interview = { mount: mount, pool: pool };
})(typeof window !== 'undefined' ? window : globalThis);
