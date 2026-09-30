/* ============================================================
   assets/engine 的 DOM 侧 — assets/player.js
   依赖：engine.js（RRC）、site.css。提供：
   - RRC.mountPlayer(root, moduleId, {store}) → controller
   - RRC.Gate.render(root, moduleId, store, onUnlocked)
   - RRC.Hub.render(root, store, opts)
   控制器暴露 fwd/back/play/pause/setBranch/state/unmount（e2e 用）。
   ============================================================ */
(function (g) {
  'use strict';
  var R = g.RRC;
  var WIRE = { ul: '#B45309', dl: '#2563EB', nas: '#7C3AED' };
  var DIRTEXT = {
    ul: ['上行 →', 'dir-ul'], dl: ['← 下行', 'dir-dl'], nas: ['→ 核心网/站间', 'dir-nas'],
    int: ['UE 内部动作', 'dir-int'], warn: ['失败分支', 'dir-warn']
  };
  var LOCK_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var CHECK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>';

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function txtEst(s) { // 单行文本宽度粗估（CJK≈12px，ASCII≈7px @12.5px mono）
    var w = 0;
    for (var i = 0; i < s.length; i++) w += s.charCodeAt(i) > 0x2e80 ? 12.5 : 7.4;
    return w;
  }
  /* 内容数据里的 **强调** → <strong>（内容与展示解耦：内容文件可写纯 Markdown 强调） */
  function mdBold(s) {
    return String(s).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  }
  /* ================= 信元树（v2.2）=================
     行=字段节点：点行看详情（比喻/语义/枚举值/条款），点箭头展开子字段。
     参考形态：工程侧信令解析工具的"信元树"（左树右详情的紧凑内联版）。 */
  var TOG_SVG = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5.5l7 6.5-7 6.5z"/></svg>';
  var META_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>';
  function countExtra(nodes) {
    var n = 0;
    nodes.forEach(function (ie) {
      if (ie.focus === 'extra') n++;
      if (ie.children) n += countExtra(ie.children);
    });
    return n;
  }
  function ieNodeHtml(ie, depth) {
    var kids = ie.children || [];
    var vals = ie.vals || [];
    var dictHit = ie.dict && R.IEDict ? R.IEDict.get(ie.dict) : null;
    return '<div class="ie-row d' + depth + (ie.focus === 'extra' ? ' extra' : '') + (kids.length ? ' has-kids' + (depth < 2 ? ' kids-open' : '') : '') + '">' +
      '<div class="ie-head" role="button" tabindex="0">' +
      '<span class="ie-top">' +
      (kids.length
        ? '<span class="ie-tog" data-act="ie-tog" role="button" tabindex="0" aria-label="展开/收起子字段">' + TOG_SVG + '</span>'
        : '<span class="ie-tog leaf"></span>') +
      '<span class="ie-name">' + ie.name + '</span>' +
      '<span class="ie-pres p-' + String(ie.pres).toLowerCase() + '" title="presence：M=必选 O=可选 C=条件出现">' + ie.pres + '</span>' +
      '</span>' +
      '<span class="ie-type">' + ie.type + '</span>' +
      '</div>' +
      '<div class="ie-detail">' +
      (ie.meta ? '<div class="ie-meta">' + META_SVG + '<span>' + mdBold(ie.meta) + '</span></div>' : '') +
      '<div class="ie-sem">' + mdBold(ie.sem) + '</div>' +
      (vals.length
        ? '<div class="ie-vals"><div class="ie-vals-cap">枚举值一览（共 ' + vals.length + ' 个，点开看白话）</div>' +
          vals.map(function (v) {
            return '<div class="ie-val"><code>' + v.v + '</code>' + (v.note ? '<span>' + mdBold(v.note) + '</span>' : '') + '</div>';
          }).join('') + '</div>'
        : '') +
      '<div class="ie-refrow">' +
      '<span class="ref-badge" title="条款锚点（本字段定义出处）">§' + ie.ref + '</span>' +
      (dictHit ? '<a class="ie-dict" href="dict.html#k=' + encodeURIComponent(ie.dict) + '" title="信元词典：' + dictHit.term + '">词典详解 →</a>' : '') +
      '</div>' +
      '</div>' +
      (kids.length
        ? '<div class="ie-kids">' + kids.map(function (c) { return ieNodeHtml(c, depth + 1); }).join('') + '</div>'
        : '') +
      '</div>';
  }

  /* ================= 播放器 ================= */
  function mountPlayer(root, moduleId, opts) {
    opts = opts || {};
    var store = opts.store || R.Store();
    var m = R.get(moduleId);
    if (!m) throw new Error('未知模块: ' + moduleId);
    var branch = 'success', scenario = 'success', idx = 0, playing = false, speed = 0.75, timer = null;
    var scenarios = (m.branches && m.branches.length > 1) ? m.branches : null;

    if (g.RRCPlayer) { try { g.RRCPlayer.unmount(); } catch (e0) {} }
    root.innerHTML = '';
    /* ---- 布局骨架 ---- */
    var bench = el('div', 'workbench');
    var panelL = el('aside', 'panel');
    var panelC = el('section', 'panel canvas-panel');
    var panelR = el('aside', 'panel');
    bench.appendChild(panelL); bench.appendChild(panelC); bench.appendChild(panelR);
    root.appendChild(bench);

    /* ---- 左：锚点面板 ---- */
    panelL.appendChild(el('div', 'panel-head', m.panelTitle || '状态 / 阶段'));
    var cardEls = {}, edgeEls = [];
    m.panel.cards.forEach(function (c, i) {
      var card = el('div', 'state-card' + (c.locked ? ' locked' : ''));
      card.innerHTML = '<div class="st-name">' + (c.locked ? LOCK_SVG : '<span class="dot"></span>') + c.name + '</div>' +
        '<div class="st-desc">' + c.desc + '</div>' +
        (c.id ? '<span class="failtag">' + (m.failTagText || '失败 · 见信令图') + '</span>' : '');
      cardEls[c.id] = card;
      panelL.appendChild(card);
      if (i < m.panel.edges.length) {
        var e = el('div', 'state-edge');
        e.innerHTML = '<span class="elabel">' + m.panel.edges[i].label + '</span>';
        if (m.panel.edges[i].dim) e.style.opacity = .6;
        edgeEls.push(e); panelL.appendChild(e);
      }
    });
    panelL.appendChild(el('div', 'state-note', '<b>读法：</b>' + (m.panelNote || '信令图每走一步，这里实时点亮当前所处状态/阶段。')));

    /* ---- 中：时序画布 ---- */
    panelC.appendChild(el('div', 'panel-head', '信令时序 · ' + m.title +
      '<span class="legend"><span><i style="background:var(--ul)"></i>上行</span>' +
      '<span><i style="background:var(--dl)"></i>下行</span>' +
      '<span><i style="background:var(--nas)"></i>核心网/站间</span></span>'));
    var wrap = el('div', 'canvas-wrap');
    var hint = el('div', 'canvas-hint',
      '<div>点 <b style="color:var(--accent)">▶</b> 播放，逐帧看流程怎么走</div>' +
      '<div><span class="kb">←</span><span class="kb">→</span> 步进 · <span class="kb">Space</span> 播放/暂停</div>');
    var svgRoot = buildSeq(m);
    wrap.appendChild(svgRoot); wrap.appendChild(hint);
    panelC.appendChild(wrap);

    /* 控件条 */
    var controls = el('div', 'controls');
    var btnReplay = ctlBtn('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>', '重播');
    var btnBack = ctlBtn('<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 5v14L8.5 12z"/><rect x="5" y="5" width="2.4" height="14" rx="1"/></svg>', '上一步');
    var btnPlay = ctlBtn('<svg id="ic-play-' + m.id + '" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8v14.4L19.2 12z"/></svg>' +
      '<svg id="ic-pause-' + m.id + '" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>', '播放/暂停', true);
    var dots = el('div', 'dots');
    var speedBox = el('div', 'speed');
    speedBox.title = '播放速度：0.75× 为新手默认（每步约 5.6 秒），熟练后可加快';
    [['0.5', 0.5], ['0.75', 0.75], ['1', 1], ['1.5', 1.5], ['2', 2]].forEach(function (p, i) {
      var b = el('button', p[1] === 0.75 ? 'on' : '', p[0] + '×'); b.dataset.s = p[1];
      b.onclick = function () {
        speed = p[1];
        speedBox.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      };
      speedBox.appendChild(b);
    });
    controls.appendChild(btnReplay); controls.appendChild(btnBack); controls.appendChild(btnPlay);
    controls.appendChild(dots); controls.appendChild(speedBox);
    /* 场景分支（v2.2：站内/XN/NG 等多信令图）——分段按钮，切换整套信令图 */
    var scnBox = null;
    if (scenarios) {
      scnBox = el('div', 'scn');
      scnBox.title = '切换场景：每套场景有独立信令图';
      scenarios.forEach(function (sc) {
        var b = el('button', '', sc.label);
        b.dataset.scn = sc.id;
        b.setAttribute('aria-label', '场景：' + sc.label);
        b.onclick = function () { setBranch(sc.id); };
        scnBox.appendChild(b);
      });
      controls.insertBefore(scnBox, dots);
    }
    var branchCtl = null;
    if (m.paths.fail) {
      branchCtl = el('label', 'branch');
      branchCtl.innerHTML = '<span>' + (m.failLabel || '失败分支') + '</span>' +
        '<span class="switch"><input type="checkbox"><span class="tr"></span><span class="kn"></span></span>';
      var sw = branchCtl.querySelector('input');
      sw.onchange = function () { setBranch(sw.checked ? 'fail' : scenario); };
      controls.appendChild(branchCtl);
    }
    panelC.appendChild(controls);

    /* ---- 右：讲解（含"一句话版"初学开关，本机记忆） ---- */
    var plainMode = (function () { try { return localStorage.getItem('rrc.plain') !== '0'; } catch (e0) { return true; } })();
    var headR = el('div', 'panel-head');
    headR.innerHTML = '讲解 <span style="text-transform:none;letter-spacing:0">大白话 + 类比</span>' +
      '<label class="plain-toggle" title="开：每步先给一句外行也能懂的白话；关：只看完整讲解"><input type="checkbox"' + (plainMode ? ' checked' : '') + '><span class="pt-track"><span class="pt-knob"></span></span>一句话版</label>';
    var ptInput = headR.querySelector('input');
    ptInput.onchange = function () {
      plainMode = ptInput.checked;
      try { localStorage.setItem('rrc.plain', plainMode ? '1' : '0'); } catch (e1) {}
      renderExplain();
    };
    panelR.appendChild(headR);
    var explain = el('div');
    panelR.appendChild(explain);

    /* ---- 失败分支全集卡（schema v2）——全宽区，移出工作台避免右栏过长 ---- */
    if (m.failures && m.failures.length) {
      var deck = el('section', 'fail-deck');
      deck.innerHTML = '<div class="fd-head">失败分支全集 · 规范枚举</div>' +
        '<p class="fd-sub">信令图演示的只是其中一条路。规范为本过程定义的全部失败出口如下——每条都能挂到条款。</p>' +
        '<div class="fgrid">' +
        m.failures.map(function (f) {
          return '<div class="fail-card">' +
            '<div class="fc-top"><span class="fc-id">' + f.id + '</span>' +
            (f.timer ? '<span class="fc-timer" title="相关定时器">' + f.timer + '</span>' : '') +
            '<span class="ref-badge" title="TS 38.331 Rel-19 条款 ' + f.ref + '">§' + f.ref + '</span></div>' +
            '<div class="fc-field"><b>触发</b><span>' + mdBold(f.cond) + '</span></div>' +
            '<div class="fc-field"><b>去向</b><span>' + mdBold(f.trans) + '</span></div>' +
            '<div class="fc-field"><b>影响</b><span>' + mdBold(f.kpi) + '</span></div>' +
            (f.deep ? '<div class="fc-deep">' + mdBold(f.deep) + '</div>' : '') +
            '</div>';
        }).join('') + '</div>';
      root.appendChild(deck); /* bench 之后、quiz 之前（此刻 quiz 尚未创建） */
    }

    /* ---- 测验 ---- */
    var quizSec = el('section', 'quiz');
    quizSec.appendChild(el('h2', 'sec', '自测 · 面试风格 ' + m.quiz.length + ' 题'));
    quizSec.appendChild(el('p', 'sec-sub', '答错会显示解析；全部答完自动记分（进度存本机浏览器）。'));
    var qgrid = el('div', 'qgrid');
    quizSec.appendChild(qgrid);
    root.appendChild(quizSec);
    var gotCount = 0, answered = 0;
    var scoreLine = el('div', 'quiz-score');
    m.quiz.forEach(function (q, qi) {
      var card = el('div', 'qcard');
      card.innerHTML = '<div class="qtag">Q' + (qi + 1) + '</div><div class="qtext">' + mdBold(q.q) + '</div>';
      var box = el('div', 'opts');
      var why = el('div', 'why');
      q.o.forEach(function (o, oi) {
        var b = el('button', 'opt', String.fromCharCode(65 + oi) + ' · ' + o);
        b.onclick = function () {
          box.querySelectorAll('.opt').forEach(function (x) { x.disabled = true; });
          var res = R.Checkers.quiz(q, oi);
          if (res.correct) { b.classList.add('correct'); gotCount++; why.innerHTML = '<b>答对了。</b>' + mdBold(q.why); }
          else {
            b.classList.add('wrong');
            box.querySelectorAll('.opt')[q.a].classList.add('correct');
            why.className = 'why wrong-ans';
            why.innerHTML = '<b>不对，选 ' + String.fromCharCode(65 + q.a) + '。</b>' + mdBold(q.why);
          }
          answered++;
          why.classList.add('show');
          if (!card.contains(why)) card.appendChild(why);
          if (answered === m.quiz.length) {
            scoreLine.innerHTML = '本模块得分：<b>' + gotCount + ' / ' + m.quiz.length + '</b>' +
              (gotCount === m.quiz.length ? ' · 全对，可以进入下一模块' : ' · 建议回看上面答错步骤的讲解');
            quizSec.appendChild(scoreLine);
            store.setQuizScore(m.id, gotCount, m.quiz.length);
          }
        };
        box.appendChild(b);
      });
      card.appendChild(box); qgrid.appendChild(card);
    });

    /* ---- 引擎状态机 ---- */
    function pathLen() { return m.paths[branch].length; }
    function stepFwd() { if (idx < pathLen()) { idx++; render(); return true; } return false; }
    function play() {
      if (playing) { pause(); return; }
      if (idx >= pathLen()) idx = 0;
      playing = true; icon(); loop();
    }
    function loop() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!stepFwd()) { pause(); return; }
        if (playing) loop();
      }, (idx === 0 ? 2400 : 4200) / speed);
    }
    function pause() { playing = false; clearTimeout(timer); icon(); }
    function icon() {
      var p = document.getElementById('ic-play-' + m.id), q = document.getElementById('ic-pause-' + m.id);
      if (p && q) { p.style.display = playing ? 'none' : 'block'; q.style.display = playing ? 'block' : 'none'; }
    }
    function setBranch(b) {
      if (!m.paths[b]) b = 'success';
      var curSid = idx > 0 ? m.paths[branch][idx - 1] : null;
      pause();
      /* 跨场景/失败切换：当前步若在新路径中存在则原地保留，否则截断到新路径长度 */
      var pos = curSid ? m.paths[b].indexOf(curSid) : -1;
      if (pos >= 0) idx = pos + 1;
      else idx = Math.min(idx, m.paths[b].length);
      if (b !== 'fail') scenario = b;
      branch = b;
      rebuildSeq(); render(); syncBranchCtl();
    }
    function syncBranchCtl() {
      if (scnBox) [].forEach.call(scnBox.children, function (x) {
        x.classList.toggle('on', x.dataset.scn === branch);
      });
      if (branchCtl) branchCtl.querySelector('input').checked = (branch === 'fail');
    }
    function render() {
      var p = m.paths[branch];
      svgRoot.querySelectorAll('g.msg').forEach(function (gEl) {
        var pos = p.indexOf(gEl.dataset.step);
        var inPath = pos > -1;
        gEl.classList.toggle('active', inPath && pos === idx - 1);
        gEl.classList.toggle('past', inPath && pos < idx - 1);
        gEl.classList.toggle('future', !inPath || pos >= idx);
      });
      var st = R.utils.panelStateFor(m, branch, idx);
      m.panel.cards.forEach(function (c) {
        cardEls[c.id].classList.toggle('on', st.on.indexOf(c.id) >= 0 && st.failed !== c.id);
        cardEls[c.id].classList.toggle('failed', st.failed === c.id);
      });
      edgeEls.forEach(function (e, i) { e.classList.toggle('on', st.edge === i); });
      hint.classList.toggle('off', idx > 0);
      renderExplain();
      if (idx === pathLen()) store.markDone(m.id, pathLen());
      renderDots();
    }
    /* ---- 决策点作答状态（本 mount 内保留；"你就是 UE"） ---- */
    var dpAnswered = {};
    function plainHtml(d) {
      return (plainMode && d && d.plain)
        ? '<div class="plain-box"><span class="pb-cap">一句话看懂</span><p>' + d.plain + '</p></div>'
        : '';
    }

    function renderExplain() {
      var d, dir;
      if (idx === 0) {
        d = m.intro || { title: '开场', narr: '按播放开始。' }; dir = ['场景', 'dir-int'];
        explain.innerHTML = '<div class="explain-body"><div class="step-kicker">第 0 步 / 共 ' + pathLen() + ' 步 · ' +
          '<span class="' + dir[1] + '">' + dir[0] + '</span></div>' +
          '<h3 class="step-title">' + d.title + '</h3>' + plainHtml(d) + '<p class="step-narr">' + mdBold(d.narr) + '</p></div>';
        return;
      }
      d = m.steps[m.paths[branch][idx - 1]];
      dir = DIRTEXT[d.dir];
      /* 信元：v2 结构化对象 → 消息解剖树（v2.2：children 树/vals 枚举/meta 比喻）；v1 字符串 → chips */
      var iesHtml = '';
      if (d.ies.length) {
        if (typeof d.ies[0] === 'object') {
          var nExtra = countExtra(d.ies);
          iesHtml = '<div class="ie-table">' +
            '<div class="ie-cap"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h10M4 18h7"/></svg>消息解剖 · 拆开这条消息看信元' +
            (nExtra ? '<button class="ie-more" data-act="ie-more">展开全部字段（+' + nExtra + '）</button>' : '') +
            '</div>' +
            d.ies.map(function (ie) { return ieNodeHtml(ie, 0); }).join('') + '</div>';
        } else {
          iesHtml = '<div class="chips">' + d.ies.map(function (x) { return '<span class="chip-ie">' + x + '</span>'; }).join('') + '</div>';
        }
      }
      /* 规范出处徽章（v2 refs） */
      var refsHtml = (d.refs && d.refs.length)
        ? '<div class="refs-row"><span class="refs-cap">规范出处</span>' +
          d.refs.map(function (r) { return '<span class="ref-badge" title="TS 38.331 Rel-19 条款 ' + r + '（本步论断的锚点）">§' + r + '</span>'; }).join('') +
          '</div>'
        : '';
      /* 决策点卡（at === 当前步索引，且挂在本场景上） */
      var dp = null;
      if (m.decisionPoints) {
        for (var di = 0; di < m.decisionPoints.length; di++) {
          if ((m.decisionPoints[di].branch || 'success') === branch && m.decisionPoints[di].at === idx - 1) { dp = m.decisionPoints[di]; break; }
        }
      }
      var dpHtml = '';
      if (dp) {
        var key = 'at' + dp.at, picked = dpAnswered[key];
        dpHtml = '<div class="dp-card">' +
          '<div class="dp-head"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>你就是 UE · 此刻怎么选？</div>' +
          '<div class="dp-q">' + mdBold(dp.q) + '</div>' +
          '<div class="dp-opts">' + dp.options.map(function (o, i) {
            var cls = 'dp-opt';
            if (picked != null) {
              if (i === dp.correct) cls += ' correct';
              else if (i === picked) cls += ' wrong';
            }
            return '<button class="' + cls + '" data-i="' + i + '"' + (picked != null ? ' disabled' : '') + '>' +
              String.fromCharCode(65 + i) + ' · ' + o + '</button>';
          }).join('') + '</div>' +
          (picked != null ? '<div class="dp-why show"><b>' + (picked === dp.correct ? '选对了。' : '不对，正确是 ' + String.fromCharCode(65 + dp.correct) + '。') + '</b>' + mdBold(dp.why) +
            ' <span class="ref-badge">§' + dp.ref + '</span></div>' : '') +
          '</div>';
      }
      explain.innerHTML = '<div class="explain-body">' +
        '<div class="step-kicker">第 ' + idx + ' 步 / 共 ' + pathLen() + ' 步 · <span class="' + dir[1] + '">' + dir[0] + '</span>' +
        ((d.ies && d.ies.length) ? ' · <a class="wb-link" href="../rrc-workbench/dist/index.html" target="_blank" title="在 ASN 编码实验室里亲手编码这条消息">去编码实验室 ↗</a>' : '') +
        '</div>' +
        '<h3 class="step-title">' + d.title + '</h3>' +
        plainHtml(d) +
        '<p class="step-narr">' + mdBold(d.narr) + '</p>' +
        iesHtml + dpHtml + refsHtml +
        (d.exam ? '<div class="exambox"><div class="exam-head"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16.6" r=".6" fill="currentColor"/></svg>面试考法</div><p>' + mdBold(d.exam) + '</p></div>' : '') +
        '</div>';
      /* 决策点交互绑定 */
      if (dp) {
        var optsEls = explain.querySelectorAll('.dp-opt');
        for (var oi = 0; oi < optsEls.length; oi++) {
          (function (b) {
            b.onclick = function () {
              dpAnswered['at' + dp.at] = parseInt(b.dataset.i, 10);
              renderExplain();
            };
          })(optsEls[oi]);
        }
      }
      /* 全字段展开/收起绑定：extra 显隐 + 所有子树节点 kids-open 联动（否则手动收起后按钮"看起来没反应"） */
      var moreBtn = explain.querySelector('[data-act="ie-more"]');
      if (moreBtn) {
        moreBtn.onclick = function () {
          var tbl = moreBtn.closest('.ie-table');
          var open = tbl.classList.toggle('all');
          var parents = tbl.querySelectorAll('.ie-row.has-kids');
          [].forEach.call(parents, function (r) { r.classList.toggle('kids-open', open); });
          var n = tbl.querySelectorAll('.ie-row.extra').length;
          moreBtn.textContent = open ? '收起全部字段' : '展开全部字段（+' + n + '）';
        };
      }
      /* 信元树交互：点行看详情（.open），点箭头展开子字段（.kids-open） */
      var heads = explain.querySelectorAll('.ie-head');
      for (var hi = 0; hi < heads.length; hi++) {
        (function (h) {
          h.onclick = function (ev) {
            if (ev.target.closest('[data-act="ie-tog"]')) return;
            h.parentNode.classList.toggle('open');
          };
        })(heads[hi]);
      }
      var togs = explain.querySelectorAll('[data-act="ie-tog"]:not(.leaf)');
      for (var ti = 0; ti < togs.length; ti++) {
        (function (t) {
          t.onclick = function (ev) {
            ev.stopPropagation();
            t.closest('.ie-row').classList.toggle('kids-open');
          };
        })(togs[ti]);
      }
    }
    function renderDots() {
      dots.innerHTML = '';
      for (var i = 0; i <= pathLen(); i++) {
        (function (i) {
          var b = el('button', 'pdot' + (i === idx ? ' on' : i < idx ? ' past' : ''));
          b.title = i === 0 ? '开场' : '第 ' + i + ' 步';
          b.setAttribute('aria-label', b.title);
          b.onclick = function () { pause(); idx = i; render(); };
          dots.appendChild(b);
        })(i);
      }
    }
    function rebuildSeq() {
      var ns = buildSeq(m, branch);
      wrap.removeChild(svgRoot); svgRoot = ns; wrap.insertBefore(ns, hint);
    }
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.closest('.qcard')) return;
      if (e.code === 'ArrowRight') { pause(); stepFwd(); }
      else if (e.code === 'ArrowLeft') { pause(); if (idx > 0) { idx--; render(); } }
      else if (e.code === 'Space') { e.preventDefault(); play(); }
    }
    /* 点击信令图上的任一消息 → 直接切到那一步（委托在 wrap，rebuildSeq 换图后仍有效） */
    wrap.addEventListener('click', function (e) {
      var gEl = e.target.closest ? e.target.closest('g.msg') : null;
      if (!gEl || !gEl.dataset || !gEl.dataset.step) return;
      var pos = m.paths[branch].indexOf(gEl.dataset.step);
      if (pos < 0) return;
      pause(); idx = pos + 1; render();
    });
    document.addEventListener('keydown', onKey);
    btnPlay.onclick = play;
    btnBack.onclick = function () { pause(); if (idx > 0) { idx--; render(); } };
    btnReplay.onclick = function () { pause(); idx = 0; render(); play(); };
    var fwdBtn = ctlBtn('<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5v14l9.5-7z"/><rect x="16.6" y="5" width="2.4" height="14" rx="1"/></svg>', '下一步');
    fwdBtn.onclick = function () { pause(); stepFwd(); };
    controls.insertBefore(fwdBtn, dots);

    render();
    syncBranchCtl();

    var controller = {
      fwd: function () { pause(); return stepFwd(); },
      back: function () { pause(); if (idx > 0) { idx--; render(); } },
      play: play, pause: pause, setBranch: setBranch,
      step: function () { return idx; },
      state: function () { return { idx: idx, branch: branch, pathLen: pathLen(), playing: playing }; },
      unmount: function () { pause(); document.removeEventListener('keydown', onKey); root.innerHTML = ''; }
    };
    g.RRCPlayer = controller;
    return controller;
  }

  function ctlBtn(iconHtml, title, primary) {
    var b = el('button', 'ctl' + (primary ? ' primary' : ''), iconHtml);
    b.title = title; b.setAttribute('aria-label', title);
    return b;
  }

  /* ================= SVG 时序图构建 ================= */
  function buildSeq(m, branch) {
    branch = branch || 'success';
    var path = m.paths[branch];
    var Y0 = 150, DY = 100;
    var H = Math.max(560, Y0 + (path.length - 1) * DY + 130);
    var root = svg('svg', { viewBox: '0 0 920 ' + H, preserveAspectRatio: 'xMidYMin meet', role: 'img', 'aria-label': m.title + ' 信令时序图' });
    var defs = svg('defs', {});
    [['ul', WIRE.ul], ['dl', WIRE.dl], ['nas', WIRE.nas], ['rd', '#DC2626']].forEach(function (p) {
      var mk = svg('marker', { id: 'ah-' + p[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
      mk.appendChild(svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: p[1] }));
      defs.appendChild(mk);
    });
    root.appendChild(defs);

    /* actors + 生命线 */
    m.actors.forEach(function (a, i) {
      var g = svg('g', {});
      g.appendChild(svg('rect', { class: 'actor-box', x: a.x - 62, y: 10, width: 124, height: 46, rx: 8 }));
      g.appendChild(text(a.label, { class: 'actor-t', x: a.x, y: 30 }));
      g.appendChild(text(a.sub || '', { class: 'actor-s', x: a.x, y: 47 }));
      root.appendChild(g);
      root.appendChild(svg('line', { class: 'actor-sub', x1: a.x, y1: 58, x2: a.x, y2: H - 24 }));
      a._i = i;
    });

    path.forEach(function (sid, i) {
      var s = m.steps[sid];
      var y = Y0 + i * DY;
      var gEl = svg('g', { class: 'msg future', 'data-step': sid });
      var src = m.actors[s.from];
      if (s.dir === 'ul' || s.dir === 'dl' || s.dir === 'nas') {
        var dst = m.actors[s.to];
        var x1 = src.x, x2 = dst.x > src.x ? dst.x - 10 : dst.x + 10;
        var lineAttrs = { class: 'wire' + (s.dir === 'nas' ? ' nas' : ''), pathLength: 1, x1: x1, y1: y, x2: x2, y2: y, stroke: WIRE[s.dir], 'stroke-width': 1.8, 'marker-end': 'url(#ah-' + s.dir + ')' };
        if (s.dir === 'nas') { lineAttrs['stroke-dasharray'] = '6 5'; lineAttrs['stroke-width'] = 1.6; }
        gEl.appendChild(svg('line', lineAttrs));
        var mid = (x1 + dst.x) / 2;
        gEl.appendChild(text(s.label, { class: 'mlabel', x: mid, y: y - 16 }));
        gEl.appendChild(text(s.chan, { class: 'chan', x: mid, y: y + 20 }));
        gEl.appendChild(num(dst.x > src.x ? x1 + 34 : x1 - 34, y, i + 1));
      } else if (s.dir === 'int') {
        var bw = Math.max(150, Math.min(400, txtEst(s.label) + 30));
        gEl.appendChild(svg('rect', { class: 'intbox', x: src.x - 62, y: y - 16, width: bw, height: 34, rx: 7 }));
        gEl.appendChild(text(s.label, { class: 'intt', x: src.x - 48, y: y - 3 }));
        gEl.appendChild(text(s.chan, { class: 'chan ints', x: src.x - 48, y: y + 12 }));
        gEl.appendChild(num(src.x - 62 - 22, y, i + 1));
      } else { /* warn */
        var cxx = src.x + 42;
        gEl.appendChild(svg('circle', { class: 'clockc', cx: cxx, cy: y, r: 11 }));
        gEl.appendChild(svg('path', { class: 'clockh', d: 'M' + cxx + ' ' + (y - 6) + ' L' + cxx + ' ' + y + ' L' + (cxx + 5) + ' ' + (y + 3) }));
        gEl.appendChild(text(s.label, { class: 'fx-label', x: cxx + 24, y: y - 3 }));
        gEl.appendChild(text(s.chan, { class: 'chan', x: cxx + 24, y: y + 14 }));
        gEl.appendChild(num(src.x + 12, y, i + 1));
      }
      root.appendChild(gEl);
    });
    function num(cx, cy, n) {
      var g2 = svg('g', {});
      g2.appendChild(svg('circle', { class: 'numc', cx: cx, cy: cy, r: 10 }));
      g2.appendChild(text(String(n), { class: 'numt', x: cx, y: cy }));
      return g2;
    }
    function text(s, attrs) {
      var t = svg('text', attrs); t.textContent = s; return t;
    }
    return root;
  }

  /* ================= Gate 付费墙 ================= */
  var Gate = {
    render: function (root, moduleId, store, onUnlocked) {
      var m = R.get(moduleId);
      if (!m) throw new Error('未知模块: ' + moduleId);
      store = store || R.Store();
      var gate = m.gate || {};
      var points = gate.points || [
        '逐帧播放的交互式信令图——视频给不了的"亲手走一遍"',
        '失败分支演示 + 定时器语义（T300/T304/T380 等）',
        '每步大白话讲解 + 面试考法标注 + 结课自测',
        '买一次，浏览器本地永久离线可用'
      ];
      var price = gate.price || '完整版 28 模块（M0–M27）一次性买断，本地永久离线可用<br>内测期全套 <b>¥99</b> / 单模块 <b>¥12</b>——获取方式见仓库 README';
      root.innerHTML = '';
      var w = el('div', 'gate-wrap');
      var c = el('div', 'gate');
      c.innerHTML =
        '<div class="g-kicker">付费模块 · ' + m.tech + (m.prereq.length ? ' · 建议先修：' + m.prereq.map(function (p) { return R.get(p).title; }).join('、') : '') + '</div>' +
        '<h2>' + m.title + '</h2>' +
        '<p class="g-sub">' + m.tagline + '（' + m.minutes + ' 分钟 · ' + m.paths.success.length + ' 步）</p>' +
        '<ul>' + points.map(function (p) { return '<li>' + CHECK_SVG + '<span>' + p + '</span></li>'; }).join('') + '</ul>' +
        '<div class="g-price">' + price + '</div>' +
        '<div class="g-actions">' +
        '<button class="btn primary" data-act="unlock">完整版解锁码</button>' +
        '<a class="btn" href="index.html">返回目录</a></div>' +
        '<p class="g-note">免费层（Free Edition）：本站开放 M0/M1 两课与全部工具页；M2–M27 共 26 个模块属完整版，获取方式见仓库 README。</p>';
      w.appendChild(c); root.appendChild(w);
      c.querySelector('[data-act="unlock"]').onclick = function () {
        store.setLicense({ demo: true });
        if (onUnlocked) onUnlocked();
      };
    }
  };

  /* ================= Hub 模块墙 ================= */
  /* 学习域分组（2026-09-30 重构）：按"一条消息的完整旅程"排组——
     主线 → 空口信令（RRC）→ 接口运输 → 信封外层（NAS/核心网）→ 底层地基 → 横切对照 */
  var HUB_GROUPS = [
    { key: 'main', no: '01', short: '主线', name: '主线 · 免费起点', desc: '一部电影看完全程：从开机到注册能上网的每一条信令——全站的地图，也是所有课的前置。', mods: ['ma'] },
    { key: 'rrc', no: '02', short: 'RRC 九课', name: 'RRC · 空口信令九课', desc: 'UE 与基站之间的对话全集：连接建立、系统消息、寻呼、测量、切换、承载重配、挂起、AS 安全、双连接。', mods: ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'] },
    { key: 'if', no: '03', short: '接口与用户面', name: '接口与用户面 · 信令离开基站之后', desc: 'NG/Xn 两条网络接口的柜台单据、S1/F1/E1 接口族收官、加上数据面与 GTP-U 隧道——网络侧视角与比特流视角。', mods: ['mi', 'mx', 'mp', 'mz'] },
    { key: 'nas', no: '04', short: 'NAS 与核心网', name: 'NAS 与核心网 · 信封的外层', desc: '注册与会话这一层的两代全套：5G NAS、5GC 会话流程、隧道与转发面信令（GTP-C/PFCP）、EPS 侧 EMM/ESM 专章。', mods: ['mn', 'mg', 'mb', 'me'] },
    { key: 'low', no: '05', short: '空口底层', name: '空口底层 · 信令脚下的地基', desc: '信令之前的那一秒：MAC 怎么敲门、物理层怎么把比特搬上无线帧——学完上层再下井，豁然开朗。', mods: ['mc', 'mf'] },
    { key: 'cross', no: '06', short: '安全与对照', name: '安全与两代对照 · 横切视角收官', desc: '密钥树怎么一级级长出来，以及 4G/5G 同一流程并排看——横穿所有层的两组收官课。', mods: ['ms', 'ml'] },
    { key: 'apps', no: '07', short: '业务与垂直', name: '业务与垂直 · 信令的应用现场', desc: '信令学完去哪用：IMS 语音（SIP 注册到挂断+字段级解剖）、定位（LPP/NRPPa）、五大垂直特性速览（NTN/RedCap/Sidelink/MBS/IAB）——应用现场的四门课。', mods: ['mv', 'md', 'mk', 'mw'] },
    { key: 'jobs', no: '08', short: '测试与终端', name: '测试与终端 · 岗位直通', desc: '与求职岗位最短路径的两门课：一致性测试线（怎么给手机发合格证）与卡与终端（USIM 与一条短信的旅程）——全站收官。', mods: ['mt', 'mu'] }
  ];
  var Hub = {
    render: function (root, store, opts) {
      opts = opts || {};
      store = store || R.Store();
      var href = opts.href || function (id) { return 'app.html#' + id; };
      var mods = R.modules();
      root.innerHTML = '';

      /* 学习域导览条：六组胶囊，点击展开并滚动到组 */
      var path = el('div', 'pathline gnav');
      var grpOpen = {}; HUB_GROUPS.forEach(function (g, i) { grpOpen[g.key] = (i === 0); });
      function openGroup(key, open) {
        grpOpen[key] = open !== false;
        var sec = document.getElementById('hub-g-' + key);
        if (sec) {
          sec.classList.toggle('closed', !grpOpen[key]);
          var h = sec.querySelector('.ghead');
          if (h) h.setAttribute('aria-expanded', grpOpen[key]);
        }
      }
      HUB_GROUPS.forEach(function (g, i) {
        if (i) path.appendChild(el('span', 'pathsep', '→'));
        var s = el('button', 'pathstep gstep');
        s.type = 'button';
        s.innerHTML = '<span class="n">' + g.no + '</span>' + g.short;
        s.title = g.name;
        s.onclick = function () {
          openGroup(g.key, true);
          var t = document.getElementById('hub-g-' + g.key);
          if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        path.appendChild(s);
      });
      root.appendChild(path);

      /* 工具行：过滤 + 授权 */
      var tools = el('div', 'hub-tools');
      var filter = el('div', 'filter');
      var inp = el('input'); inp.placeholder = '过滤模块（标题 / 关键词 / 制式）…';
      filter.appendChild(inp); tools.appendChild(filter);
      var lic = store.license();
      var licCard = el('div', 'license-card');
      function renderLic() {
        lic = store.license();
        licCard.innerHTML =
          '<div><div class="lc-t">付费模块授权</div><div class="lc-d">免费层开放 M0/M1 与全部工具页；完整版（M2–M27）获取方式见 README。</div></div>' +
          '<div style="display:flex;gap:8px;align-items:center">' +
          '<span class="license-state' + (lic.demo ? ' on' : '') + '">' + (lic.demo ? '完整版用户' : '免费层') + '</span>' +
          (lic.demo
            ? '<button class="btn sm" data-act="relock">重新锁定</button>'
            : '<button class="btn sm primary" data-act="unlock">了解完整版</button>') +
          '</div>';
        var u = licCard.querySelector('[data-act="unlock"]'), r = licCard.querySelector('[data-act="relock"]');
        if (u) u.onclick = function () { store.setLicense({ demo: true }); renderLic(); renderGrid(); };
        if (r) r.onclick = function () { store.setLicense({ demo: false }); renderLic(); renderGrid(); };
      }
      renderLic();
      var headRow = el('div', 'hub-headrow');
      headRow.appendChild(el('h2', 'sec', '模块目录'));
      var expandBtn = el('button', 'btn sm hub-expand');
      expandBtn.type = 'button';
      expandBtn.textContent = '全部展开';
      expandBtn.onclick = function () {
        var anyClosed = HUB_GROUPS.some(function (g) { return !grpOpen[g.key]; });
        HUB_GROUPS.forEach(function (g) { openGroup(g.key, anyClosed); });
        expandBtn.textContent = anyClosed ? '全部收起' : '全部展开';
      };
      headRow.appendChild(expandBtn);
      root.appendChild(headRow);
      root.appendChild(el('p', 'sec-sub', '两级目录：先选学习域，展开后再挑课。免费层：M0 接入全流程与 M1 连接建立 + 全部工具页；M2–M27 属完整版。'));
      root.appendChild(tools);

      /* 总进度 */
      var doneCount = mods.filter(function (m) { var p = store.progress(m.id); return p && p.done; }).length;
      var overall = el('div');
      overall.innerHTML = '<div style="display:flex;justify-content:space-between;font:500 12px var(--mono);color:var(--tx3);margin-top:22px"><span>总进度（走完最后一帧即记完成）</span><span>' + doneCount + ' / ' + mods.length + '</span></div><div class="progressbar"><i style="width:' + (doneCount / mods.length * 100) + '%"></i></div>';
      root.appendChild(overall);

      /* 模块卡网格 */
      var grid = el('div', 'mgrid');
      function cardHtml(m) {
        var p = store.progress(m.id), qs = store.quizScore(m.id);
        var pct = p ? Math.round(p.steps / m.paths.success.length * 100) : 0;
        return '<div class="mtop"><span class="mnum">M' + m.num + ' · ' + m.tech + '</span>' +
          (m.free ? '<span class="badge free">免费样品</span>'
            : (lic.demo ? '<span class="badge">已解锁</span>' : '<span class="badge paid">' + LOCK_SVG + ' 付费</span>')) + '</div>' +
          '<div class="mname">' + m.title + '</div>' +
          '<div class="mdesc">' + m.tagline + '</div>' +
          '<div class="mmeta">' + m.minutes + ' 分钟 / ' + m.paths.success.length + ' 步 / ' + m.quiz.length + ' 题</div>' +
          '<div class="mprog"><i style="width:' + pct + '%"></i></div>' +
          '<div class="mfoot"><span>' + (p && p.done ? '<span class="done">✓ 已完成</span>' : pct > 0 ? '学到第 ' + p.steps + ' 步' : '未开始') + '</span>' +
          '<span>' + (qs ? '测验 ' + qs.got + '/' + qs.total : (m.free ? '免费开始 →' : '解锁学习 →')) + '</span></div>';
      }
      function renderGrid() {
        var kw = (inp.value || '').trim().toLowerCase();
        var byId = {}; mods.forEach(function (m) { byId[m.id] = m; });
        var grouped = {}; HUB_GROUPS.forEach(function (g) { g.mods.forEach(function (id) { grouped[id] = true; }); });
        var groups = HUB_GROUPS.slice();
        var rest = mods.filter(function (m) { return !grouped[m.id]; }).map(function (m) { return m.id; });
        if (rest.length) { groups.push({ key: 'more', no: '··', name: '更多课程', desc: '新上架，尚未归组。', mods: rest }); grpOpen.more = true; }
        grid.innerHTML = '';
        groups.forEach(function (g) {
          var hits = g.mods.filter(function (id) {
            var m = byId[id]; if (!m) return false;
            return !kw || (m.title + m.tagline + m.tech + 'm' + m.num).toLowerCase().indexOf(kw) >= 0;
          });
          if (!hits.length) return;
          /* 过滤中：有命中的组自动展开；无过滤：尊重折叠态 */
          var open = kw ? true : grpOpen[g.key] !== false;
          var done = hits.filter(function (id) { var p = store.progress(id); return p && p.done; }).length;
          var sec = el('div', 'hubgroup' + (open ? '' : ' closed')); sec.id = 'hub-g-' + g.key;
          sec.innerHTML = '<div class="ghead" role="button" tabindex="0" aria-expanded="' + open + '">' +
            '<span class="gtog" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5.5l7 6.5-7 6.5z"/></svg></span>' +
            '<span class="gnum">' + g.no + '</span>' +
            '<div class="gtxt"><div class="gname">' + g.name + '</div><div class="gdesc">' + g.desc + '</div></div>' +
            '<span class="gcount">' + hits.length + ' 门' + (done ? ' · ' + done + '/' + hits.length : '') + '</span></div>';
          var ggrid = el('div', 'mgrid gbody');
          hits.forEach(function (id) {
            var a = el('a', 'mcard', cardHtml(byId[id]));
            a.href = href(id);
            ggrid.appendChild(a);
          });
          sec.appendChild(ggrid);
          var head = sec.querySelector('.ghead');
          function toggle() {
            var nowOpen = sec.classList.toggle('closed') === false;
            head.setAttribute('aria-expanded', nowOpen);
            grpOpen[g.key] = nowOpen;
          }
          head.onclick = toggle;
          head.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
          grid.appendChild(sec);
        });
        if (!grid.children.length) grid.appendChild(el('p', 'sec-sub', '没有匹配的模块。'));
      }
      inp.oninput = renderGrid;
      renderGrid();
      tools.appendChild(licCard);
      root.appendChild(grid);
    }
  };

  R.mountPlayer = mountPlayer;
  R.Gate = Gate;
  R.Hub = Hub;
  R.HUB_GROUPS = HUB_GROUPS; /* 面试模式等工具页复用六域划分 */
})(typeof window !== 'undefined' ? window : globalThis);
