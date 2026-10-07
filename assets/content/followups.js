/* ============================================================
   assets/content/followups.js — 面试追问链（v6 块 3）
   按 qid 挂 {levels:[{q, a, ref}]}；q.id 规则与 interview.js 题池一致
   （m.id + ':q' + 序号 / ':d' + 序号）。
   红线：每层参考答案只用对应课程已审计文本（narr/failures.deep/quiz.why）
   的压缩改写，ref 沿用原题条款锚或同模块已审计条款——不写任何新论断；
   某题找不到已审计支撑层就宁缺毋滥，不凑数。
   ============================================================ */
(function (g) {
  'use strict';
  var F = {
    /* ---- 测量域（M3/M42） ---- */
    'm3:q0': { levels: [
      { q: '把 A3 进入条件逐项拆开：Mn/Ofn/Ocn/Hys/Mp/Ofp/Ocp/Off 各是什么户口？',
        a: '进入 A3-1：**Mn + Ofn + Ocn − Hys > Mp + Ofp + Ocp + Off**。Ofn/Ocn 是邻区侧测量对象级与小区级偏移（cellIndividualOffset 没配就置零），Ofp/Ocp 是 SpCell 侧同款，且 Mp、Ofp、Ocp 固定取 SpCell；Off 是事件级 a3-Offset。量纲：Mn/Mp 随量走（RSRP dBm、RSRQ/SINR dB），六个 offset 恒 dB。',
        ref: '38.331#5.5.4.4' },
      { q: 'A3 的定义和 CHO（条件切换）是什么关系？',
        a: '条款 NOTE 2 明文：**A3 的定义同样适用于 CondEvent A3**——CHO 执行条件用的就是这组不等式；配置侧一个 measId 恰好连一个触发配置，执行条件最多挂 2 个 measId。触发后的执行戏（T304、随机接入、失败回退）是切换的来回，见 M5。',
        ref: '38.331#5.5.4.4' }
    ] },
    'm3:q1': { levels: [
      { q: '写出滤波递推式；k=0 意味着什么？',
        a: '**Fn = (1−a)·Fn−1 + a·Mn**——新采样只拿 a 那一小份，方向不许背反；a = 1/2^(k/4)；首样 F0 = M1。**k=0 时 a=1——滤波输出恒等于最新采样，等效不滤波**（NOTE 1 明文）。k 越大 → a 越小 → 曲线越钝 → 触发越保守。',
        ref: '38.331#5.5.3.2' },
      { q: '滤波在哪个域做？k 的刻度假设了什么采样节奏？',
        a: 'NOTE 2：**滤波在与判据评估相同的域做——对数量域滤波对数量**，别在 mW 域平均再换回 dBm。采样率适配条款：k 的刻度假设采样周期等于 X ms——X 是 38.133 定义的一个同频 L1 测量周期（非 DRX），随频段范围不同；输入速率变了要调整滤波器保持时间特性不变。',
        ref: '38.331#5.5.3.2' }
    ] },
    'm3:d1': { levels: [
      { q: '进入条件撑满 TTT 后，首触发 UE 具体做什么？',
        a: 'TTT 满了而账本里还没有该 measId 的条目——**建 VarMeasReportList 条目、numberOfReportsSent 清零、小区写进 cellsTriggeredList、立即启动上报流程（§5.5.5）**；配了 useT312 且 T310 在跑的话顺手点火 T312（快速失败通道）。',
        ref: '38.331#5.5.4.1' },
      { q: '离开侧怎么处理？reportOnLeave 有什么防抖限制？',
        a: '离开条件对名单内某小区满足并撑过 TTT——把它移出 cellsTriggeredList；**reportOnLeave 配了就补发一条离开报告**，但 numberOfTriggeringCells 场景下只有真给该小区发过报告才许补报；名单空了就删报告条目、停周期定时器。',
        ref: '38.331#5.5.4.1' }
    ] },
    'm42:d7': { levels: [
      { q: '缩放因子的取值域被谁钉死？“放大延迟”存在吗？',
        a: '被 §6.3.2 SpeedStateScaleFactors 枚举钉死：**只有 oDot25/oDot5/oDot75/lDot0 = 0.25/0.5/0.75/1.0**——缩放只会把 TTT 缩短或保持原值，**“放大延迟”在规范里不存在**；条款只规定“乘”这个动作，取哪一档才是网络的责任。没配 speedStatePars 则整条机制不存在，TTT 原值跑。',
        ref: '38.331#5.5.7.1' },
      { q: '38.133 那边的“高速”钩子是什么？',
        a: '38.133 各时序表里另有 highSpeedMeasFlag-r16 类高速标志——按 SMTC 周期是否 ≤40ms 把表中系数 M2 在 1.5 与 1 之间切换，相当于给采样要求也挂了速度档。两头合起来才是完整的高速故事：**38.331 缩 TTT、38.133 缩采样系数，时序表本身不随速度整体折半**。',
        ref: '38.331#5.5.7.1' }
    ] },
    /* ---- 切换域（M4） ---- */
    'm4:q0': { levels: [
      { q: 'T304 超时的后果是什么？',
        a: 'T304 只管“搬家执行”这一段：收到含 reconfigurationWithSync 的重配（HO 命令）时启动，新小区随机接入成功（竞争解决完成）时停止。**超时即切换失败——回滚：发起重建或回 IDLE 重选**。',
        ref: '38.331#5.3.5.5.2' },
      { q: 'CHO 执行时 T304 何时起跑？它和 T316 是什么关系？',
        a: 'CHO：**执行条件满足时才起跑同一枚 T304**——候选配置下发时不起跑。T316 是 MR-DC 里 MCG 失败的快速救援沙漏，**与 CHO 无关——CHO 的执行限时就是 T304**；elapsedTimeT316 进失败报告（VarRLF-Report）取证。',
        ref: '38.331#5.3.7.2' }
    ] },
    'm4:d6': { levels: [
      { q: 'CHO 的执行条件用哪组判据？配置挂在哪？',
        a: '执行条件就是 A3/A5 这组事件不等式（**A3 的定义同样适用于 CondEvent A3**——条款 NOTE 2）。配置经 RRCReconfiguration 的 conditionalReconfiguration-r16 下发：一个 measId 恰好连一个触发配置、执行条件最多挂 2 个 measId。网络只负责“备好钥匙+定好锁”，UE 盯着锁眼——先开哪把锁 UE 说了算。',
        ref: '38.331#5.5.1' },
      { q: 'CHO 省掉的时延具体是哪一段？',
        a: '传统切换是“上报-等命令”的往返：测量报告 → 源站决策 → 站间准备 → 命令下发；CHO 把决策前置到执行条件——**条件满足即刻执行，省掉的是上报到命令之间的往返时延**（候选配置已提前备在 UE 手里）。',
        ref: '38.331#5.5.1' }
    ] },
    'm4:d7': { levels: [
      { q: '普通切换 T304 超时与 CHO T304 超时，UE 的退路有何不同？',
        a: '普通切换超时即失败：判 RLF 走重建或回 IDLE。**CHO 的容错设计：多套候选就是多条退路——重建的选小区阶段还能按 §5.3.7.3 复用候选配置**；这也是“一次备几套”的成本换收益。',
        ref: '38.331#5.3.7.3' },
      { q: '重建请求里 UE 怎么自证身份？失败过程记在哪？',
        a: '重建请求带 **shortMAC-I 防伪章**（源站链路完整性缩略）供目标站验证身份；失败详情记进 **VarRLF-Report** 供网络取证——这就是“求救也带防伪章”的设计。',
        ref: '38.331#5.3.7.3' }
    ] },
    /* ---- 接入域（M6/接入课） ---- */
    'ma:d5': { levels: [
      { q: '安全激活后，哪些被压着的事“批量放行”？',
        a: '安全一激活（consider AS security to be activated），被卡着的事批量放行：**SRB2、DRB 从此可以建立；测量报告的评估与发送也从此合法；切换执行同样以安全激活为铁闸**。协议把安全设计成分水岭——之前明文最小集，之后才铺开干正事。',
        ref: '38.331#5.3.5.6' },
      { q: '为什么安全命令本身只做完整性、不加密？',
        a: 'SMC 到达时加密还没生效——**用已通电的完整性，锁住还没通电的加密配置**。SecurityModeComplete 因此明文（unciphered）发送但带完整性保护：完整性立即生效（含 Complete 自己），加密“过程结束后”生效——两个生效时刻的时序差是本流程最精妙的细节。',
        ref: '38.331#5.3.4.3' }
    ] },
    /* ---- INACTIVE 域（M6/INACTIVE 课） ---- */
    'm6:q0': { levels: [
      { q: '“档案保留”具体保留在哪、保留了什么？',
        a: '基站留档案（UE 上下文存锚点）、核心网 NG 连接不拆；UE 侧持有 I-RNTI 与 suspendConfig，在 RNA 内监听 RAN 寻呼。**将来唤醒只需几条信令，不必重走鉴权+安全+建承载的全家桶**——这是 5G 为“突发小包”业务省信令的核心设计。',
        ref: '38.331#4.2.1' },
      { q: 'INACTIVE 的固有软肋是什么？',
        a: '省信令的代价是状态可能失联：RAN 寻呼复用 PCCH/P-RNTI 机制，“尽力而为”——UE 错过 PO 就听不到；而**上下文保留时长是硬约束**（内存不是保险箱），一直叫不醒你，锚点迟早清档案，INACTIVE 退化成 IDLE。',
        ref: '38.331#5.3.2' }
    ] },
    'm6:d3': { levels: [
      { q: '挂起 SRB1、丢密钥、记标志——三个动作各自的道理？',
        a: 'Reject 的 resume 分支**不回 IDLE 而是留在 INACTIVE**：挂起 SRB1（还能再恢复）；丢弃当前密钥组（安全上必须——密钥可能已暴露/过期，下次恢复用 suspendConfig 链重新推）；纯 RNA 更新触发的设 pendingRNA-Update=true（位置没报成，下次一定补）。状态留不留、密钥丢不丢、标志记不记——三个细节全是面试盲区。',
        ref: '38.331#5.3.15.2' },
      { q: 'Reject 带 waitTime 时 UE 额外受限什么？',
        a: '可带 waitTime——**T302 期间接入受限**：恢复延迟，等冷静期到点再试；与接入课被拒后的冷静期是同一枚表。',
        ref: '38.331#5.3.15.2' }
    ] },
    /* ---- 双连接域（M8/EN-DC 课） ---- */
    'm8:q2': { levels: [
      { q: 'SCG 失败后 UE 的具体动作链？',
        a: '**挂起 SCG 全部承载传输、复位 SCG MAC、停 SCG 的 T304**——然后经锚上报 SCG 失败信息，主站决定删腿或换腿（删腿=复位 SCG MAC、逐 RLC 承载释放）。故障隔离：辅腿失败不拖累主腿，用户感知只是速度回落。',
        ref: '38.331#5.7.3.2' },
      { q: '哪些事由算 SCG 失败？上报走哪条腿？',
        a: 'SCG 无线链路失败、同步重配失败、SRB3 完整性校验失败等（§5.7.3.1 上报事由族）；SCG failure information **全程走 LTE 锚的 SRB1**——NSA 控制面永远是“单笔账”，这就是“锚”字的含义。',
        ref: '38.331#5.7.3.1' }
    ] },
    /* ---- 安全域（M/安全课） ---- */
    'ms:q0': { levels: [
      { q: '背一遍全树一行版；每段派生用什么保证一致？',
        a: '**K → CK/IK → KAUSF（归属锚）→ KSEAF（拜访锚）→ KAMF（当家）→ 分两支：NAS 支 KNASint/KNASenc + AS 支 KgNB → KRRCint/KRRCenc/KUPint/KUPenc**。每段有专属 KDF（Annex A 系列），输入参数顺序钉死、改一位全链作废；中间不许跳级、不许换序——口诀“根钥 K、归属 A、拜访 S、当家 A、站上 g”。',
        ref: '33.501#6.2.1' },
      { q: 'KgNB 之后怎么“换手”？',
        a: 'KgNB 不是终身制：切换时**有未用 {NH,NCC} 就纵向，否则源站从当前 KgNB 横向推衍**（Xn 切换两可，初建后第一切必横向）；N2 切换纵向（AMF 发新 {NH,NCC}）；重建立凭 NCC 换新。不把一把钥匙用到底，是为前向隔离。',
        ref: '33.501#6.9.2.3.2' }
    ] },
    'ms:d4': { levels: [
      { q: '为什么“初建后第一切必横向”？',
        a: 'AMF 初建连接时不把 NH 发给 gNB——手头没有未用的 {NH,NCC}，所以第一次切换源站只能从当前 KgNB **水平推衍**；此后 AMF 逐次下发 NH 链，Xn 切换源站有未用 {NH,NCC} 就 **shall 走纵向**（§6.9.2.3.2 原文）。',
        ref: '33.501#6.9.2.1.1' },
      { q: 'N2 切换为什么天然纵向？',
        a: 'N2 切换经 AMF 中转，**AMF 随路径下发新 {NH,NCC}**——NCC 翻页，目标站直接拿到纵向衍生的材料；Xn 则两可（有未用 NH 就纵向，否则横向）。NH 链的意义：**破一个站不回溯历史**。',
        ref: '33.501#6.9.2.3.2' }
    ] },
    /* ---- 空闲态域（M/空闲态课） ---- */
    'my:d4': { levels: [
      { q: '向低优先级重选为什么是“双条件”？',
        a: '**旧家先烂、新家再好，双锁防手痒**：服务小区 Squal < ThreshServing,LowQ 且目标 Squal > ThreshX,LowQ（无 threshServingLowQ 用 Srxlev 版），并持续 TreselectionRAT。向高优先级则只看候选人自己够不够格（ThreshX,HighQ/HighP + 1 秒驻留锁）——高优先级永远压过低优先级。',
        ref: '38.304#5.2.4.5' },
      { q: '移动状态怎么改写这些判据？',
        a: '判为高速 → **Qhyst 加上 sf-High、Treselection 乘以 sf-High**（中速 sf-Medium 同款），缩放后向上取整到最近秒——跑得越快搬家越谨慎；**折返（重选回刚离开的小区）不计入**移动状态计数。',
        ref: '38.304#5.2.4.3.1' }
    ] },
    'my:d2': { levels: [
      { q: '专用优先级的四个删除时机？',
        a: '**进入不同的 RRC 状态；T320 到期；收到 cellReselectionPriorities 缺席的 RRCRelease；应 NAS 请求执行 PLMN/SNPN 选择**。另外跨 RAT 移动时专用优先级连同 T320 剩余有效期一起继承。',
        ref: '38.304#5.2.4.1' },
      { q: '跨 RAT 之间有“等优先级”这回事吗？',
        a: 'NOTE 2 明文：**跨 RAT 之间不支持等优先级**——等优先级只在 NR 频率间成立（等优先级的 NR 异频按同频排名规则处理）。',
        ref: '38.304#5.2.4.1' }
    ] }
  };
  g.RRC_FOLLOWUPS = {
    get: function (qid) { return Object.prototype.hasOwnProperty.call(F, qid) ? F[qid] : null; },
    size: function () { return Object.keys(F).length; },
    levelTotal: function () { var n = 0; Object.keys(F).forEach(function (k) { n += F[k].levels.length; }); return n; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
