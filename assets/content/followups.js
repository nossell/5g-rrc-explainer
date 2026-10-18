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
        ref: '38.331#5.3.5.13.5' }
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
    ] },
    /* ---- 系统消息域（M2 课，v8 块 2 扩容） ---- */
    'm1:q0': { levels: [
      { q: 'SIB1 是什么地位？NR 与 LTE 在这点上的关键差异是什么？',
        a: 'SIB1 属**"最小系统信息"，永远周期广播、不可关闭**（160ms 周期，DL-SCH）；可以按需请求获取的是其他 SIB——**"SIB1 必广播、其他按需"是 NR 与 LTE 的关键差异**。',
        ref: '38.331#5.2.1' },
      { q: 'MIB 和 SIB1 是什么关系？',
        a: '条款明文：MIB 包含 **acquire SIB1 所需的参数**——它是找 SIB1 的钥匙；小区重选参数不在 MIB 里，在 SIB1 里。开机先读 MIB，才有资格读 SIB1，再谈一切。',
        ref: '38.331#5.2.1' }
    ] },
    /* ---- 寻呼域（M3 课，v8 块 2 扩容） ---- */
    'm2:q0': { levels: [
      { q: '寻呼为什么必须走 PCCH + P-RNTI，而不是专用信令？',
        a: '待机 UE 的收音机平时彻底关着、也没有专属信道——寻呼只能走**公共广播信道 PCCH、公共的 P-RNTI 加扰调度**；被叫方没有"先被找到"之前，任何专用通道都无从谈起。信令、信道、标识三层对上（PCCH/P-RNTI/寻呼消息）才算过关。',
        ref: '38.331#6.2.2' },
      { q: 'UE 解到 P-RNTI 调度，但 Paging 消息里没有点名名单，说明什么？',
        a: '这条消息是**捎信不是点名**：要么系统广播要更新（systemInfoModification），要么有告警（etwsAndCmas）——**谁都不用动、不用发起连接**，重新读一遍广播即可；带名单的寻呼才轮到"喊到的自己下楼"。',
        ref: '38.331#6.2.2' }
    ] },
    /* ---- 承载域（M6 课，v8 块 2 扩容） ---- */
    'm5:q0': { levels: [
      { q: 'SRB2 与 DRB 为什么必须等安全激活之后才建立？',
        a: '它们承载的 NAS 信令与用户数据**必须加密传输**（§4.2.2），而加密的钥匙（KUPenc 等）依赖安全激活才生效——**顺序是结构不是建议**。对比：SRB1/MIB/PRACH 在安全激活前就存在，因为流程本身还得靠它们往前走。',
        ref: '38.331#4.2.2' },
      { q: 'UE 无法执行重配置时，正确行为是什么？',
        a: '**不执行、保留原配置、以重建自证**——走 §5.3.5.8.2 分支：继续用重配前的旧配置、发起连接重建（cause=reconfigurationFailure）。Uu 口没有重配失败的回程消息，说"不"的出口只有旧配置继续用+重建；配置是原子性承诺，执行一半比不执行更危险。',
        ref: '38.331#5.3.5.8.2' }
    ] },
    /* ---- 安全线域（M8 课，v8 块 2 扩容） ---- */
    'm7:q0': { levels: [
      { q: 'SecurityModeCommand 消息本身为什么只能完整性保护、不能加密？',
        a: '加密此时尚未激活，**只能用已生效的完整性保护锁住配置防篡改**（§5.3.4.3）——这是"先有鸡"问题的协议解法：用已通电的完整性，锁住还没通电的加密。完整性 immediate 生效（含 Complete 自己），加密"过程结束后"生效——两个开关精确卡在这条消息两侧。',
        ref: '38.331#5.3.4.3' },
      { q: 'SMC 校验失败时 UE 怎么办？为什么不能含糊？',
        a: '失败分支明文：**继续沿用先前的配置 + 发 SecurityModeFailure**——安全零妥协。条款把"失败即回退旧配置"写成死规矩，因为完整性校验失败的命令内容已不可信——你不知道它被改成了什么，把不可信当可信执行才是最大的漏洞。',
        ref: '38.331#5.3.4.3' }
    ] },
    /* ---- NAS 注册域（M13 课，v8 块 2 扩容） ---- */
    'mn:q0': { levels: [
      { q: 'SUCI 的隐私设计核心是什么？',
        a: '**真实身份号（SUPI）加密成一张只有归属运营商能解开的隐形名片**——5G 由此做到身份号码不再在空中明文裸奔；解密钥匙在归属网，伪基站截到了也用不了。',
        ref: '24.501#9.11.3.4' },
      { q: '注册时身份链的第一优先是什么？SUCI 什么时候才出场？',
        a: '§5.5.1.2.2 身份链：映射 GUTI（4G 互操作）之后**第一优先是"同 PLMN 发的 5G-GUTI"——旧档案号能让 AMF 直取上下文**；**SUCI 只在没有任何可用 GUTI 时出场**。先报旧档案号、实在没有才亮隐形名片。',
        ref: '24.501#5.5.1.2.2' }
    ] },
    'mn:q2': { levels: [
      { q: 'REGISTRATION ACCEPT 的"落户"信息里，哪件必带？',
        a: '必带的只有一件：**一片"随便走动无需重新报到"的管辖区域（TA list）**——条款明文 AMF 应（shall）指配并带上；**档案号更新（新 5G-GUTI）与切片批文（allowed NSSAI）都是可带（may）**——有更新才随信发。手机收好，从此是正式住户。',
        ref: '24.501#5.5.1.2.4' },
      { q: 'TA list 与注册区的关系为什么这样设计？',
        a: '管辖区域给大一点，UE 在里面走动就**不必频繁报到**——代价是寻呼范围跟着变大：TA list 越大，注册更新越省、寻呼要喊的范围越广——这是一对交换，网络在"省信令"与"喊得广"之间挑平衡点。',
        ref: '24.501#5.5.1.2.4' }
    ] },
    /* ---- 5GC 域（M14 课，v8 块 2 扩容） ---- */
    'mg:q0': { levels: [
      { q: 'N4 接口连接哪两个 NF？它跑的是什么面？',
        a: '**SMF（会话管家）↔ UPF（搬运大队）**——控制面对用户面下安装指令：转发规则、QoS、缓冲与上报全经 N4 下发。前台 AMF 管接入和移动、SMF 管业务、UPF 管数据转发——N4 就是管家指挥搬运工的专线。',
        ref: '23.501#4.2.7' },
      { q: 'PDU 会话建立请求随身带哪三件证件？',
        a: '**自己新生成的会话编号（PDU Session ID）、切片身份（S-NSSAI，点名要走哪类服务通道）、要去的网络名（DNN）**——托基站捎给核心网柜台；缺了切片或网络名，AMF 按用户档案补默认值，补完才找承办的 SMF。',
        ref: '23.502#4.3.2.2.1' }
    ] },
    /* ---- MAC 域（M12 课，v8 块 2 扩容） ---- */
    'mc:q0': { levels: [
      { q: 'RA-RNTI 由什么决定？为什么撞车纠纷源于它？',
        a: 'RA-RNTI **按 PRACH 时机的时频位置算出**——手机按"自己刚才在哪个时间频率位置喊的"算出收信钥匙，在规定窗口守着公共控制信道拿它试锁。**同一位置喊的人算出同一把钥匙**——这正是撞车纠纷的根源：撞了同一条前导的人，网络只回一封信，人人都以为喊中了自己。',
        ref: '38.321#5.1.3' },
      { q: '前导编号为什么是"真抽签"而不是轮询？',
        a: '§5.1.2 原文 "select a Random Access Preamble randomly with equal probability"——**等概率随机**。轮询会让重试的 UE 集中在同一编号上加剧碰撞；**随机抓阄把冲突概率均摊**，配合退避（BI）才能把撞车率压下去。',
        ref: '38.321#5.1.2' }
    ] },
    'mc:q1': { levels: [
      { q: 'MAC RAR 里装了哪三样关键信息？',
        a: '基站的回信是一捆：既有"人太多都缓缓"的告示（BI），也有给喊中者的正式批复——**批复里装着对表指令（TA）、发言座位（UL Grant）和一张临时工牌（TC-RNTI）**；每封按喊话编号挂牌，手机只认领号码对得上的那封。',
        ref: '38.321#6.2.3' },
      { q: '2-step RA 回退到 4-step 时，进度会清零吗？',
        a: '§5.1.4a：fallbackRAR 与 MAC RAR **字段完全同构**（TA/UL Grant/TC-RNTI），UE 转四步剧本且 **MSGA buffer 搬运不重组——快转慢不清零进度**。',
        ref: '38.321#5.1.4a' }
    ] },
    /* ---- 用户面域（M15 课，v8 块 2 扩容） ---- */
    'mp:q0': { levels: [
      { q: 'PDCP COUNT 怎么做到"永不回绕"？它喂给了谁？',
        a: '包头流水号位数有限、迟早转圈重演——**账本里把转过的圈数记在高位，与低位流水号合成一个永不回绕的大计数**；号码永不复用，**往后加密防伪全拿它当原料**（COUNT 进密码学，重放的老包一验就穿）。',
        ref: '38.323#6.3.5' },
      { q: 'PDCP 处理顺序为什么是"先完整性、后加密"？',
        a: '§5.2.1 顺序：associate COUNT→ROHC→integrity→ciphering。**完整性保护的对象是"压缩后的 PDU 头+数据"——先压后保，接收端验的章与发的才一致**；顺序反了，中间任何一次变换都会让章对不上。',
        ref: '38.323#5.2.1' }
    ] },
    /* ---- MRO 域（M43 新课，v8 块 2 扩容） ---- */
    'm43:q0': { levels: [
      { q: 'Too Early/Too Late/Wrong Cell 三分类的分界参数怎么读？',
        a: '三分法=**UE reported timer（自上次切换初始化或 CHO/LTM 执行到失败）与配置门限（如 Tstore_UE_cntxt）比大小，再叠加重建落点**：timer 缺失或大于门限=Too Late；小于门限且回源=Too Early；小于门限到第三小区=Wrong Cell——时间×落点两个维度叉乘出判词。',
        ref: '38.300#15.5.2.2.2' },
      { q: '「successful handover」在判责口径里指什么？',
        a: '条款明文：**refers to the UE state, namely the successful completion of the RA procedure**——看 UE 是否完成随机接入，不是看某条完成消息；RACH-less LTM 另看 UE 判定网络收到首个上行数据。',
        ref: '38.300#15.5.2.2.2' }
    ] },
    'm43:q1': { levels: [
      { q: 'UE 保存 RLF Report 的期限与放行条件分别是什么？',
        a: '**至多 48 小时或被网络取走——自检出连接失败起算**（最近一份、LTE/NR 各自算）；放行靠 **PLMN 门禁**：当前 RPLMN 在 EPLMN 列表内或正是失败当时 RPLMN（SNPN 用等价列表）——门禁不过，库里有货也不交。',
        ref: '38.300#15.5.2.2.1' },
      { q: 'rlf-Report 送达网络后，UE 怎么处理档案？',
        a: '**送达确认后即丢弃——一次性消费**（§5.7.10.3 的 discard 句）；网络没取到（超期、PLMN 不符、送达失败）就没有第二次机会，除非再发生一次新失败。取证要趁早，48 小时是保管上限不是送达承诺。',
        ref: '38.331#5.7.10.3' }
    ] },
    'm43:q3': { levels: [
      { q: 'Unnecessary HO report 的成立条件为什么这么苛刻？',
        a: '**测量期内收集的所有 UE 测量报告中，源系统小区全部超过指示的门限**（RSRP/RSRQ 或/和 SINR）——报告全在"够用线"上=NR 一直够用=当初白切了。三条否决句同样硬：测量期内切回 5GS 则作废、无 NR 小区可纳入不发、被向 5GS 以外系统的切换打断不发。',
        ref: '38.300#15.5.2.3' },
      { q: 'Voice Fallback 触发的切换切出又切回，算乒乓吗？',
        a: '**不算——表注明文：Inter-system mobility triggered by Voice Fallback is not considered as inter-system ping-pong**。语音回落是业务驱动的合法搬家，统计口径必须先剔除；回落自身的失败另归"跨系统语音回落移动性失败"单列（RLF Report 带 voice fallback 指示）。',
        ref: '38.300#15.5.2.4' }
    ] },
    'm43:q4': { levels: [
      { q: 'SHR（成功切换报告）的触发判据是什么思路？',
        a: '**比率判据——"赢是赢了，赢得太悬"**：T304/T310 已计时与配值之比超过 successHO-Config 的 thresholdPercentage 门限、或执行切换那一刻 T312 在跑且比率超标、或 DAPS 切换中源 PCell 在 T304 期间 RLF（sourceDAPS-FailureReporting=true）——四选一即存 VarSuccessHO-Report。',
        ref: '38.331#5.7.10.6' },
      { q: 'SHR 取到之后回到谁手里？',
        a: '**谁的配置触发的报告，回到谁手里去复盘**：触发为 T310/T312 的 NR 内 SHR 可经 Xn 的 ACCESS AND MOBILITY INDICATION（或 NG 双向 RAN 配置转移）转回报告中记为源小区的节点；取到者既非源也非目标时，转给配置了该 SHR 触发的节点。',
        ref: '38.300#15.5.2.7' }
    ] },
    'm43:d2': { levels: [
      { q: 'MRO 自动调参的"缰绳"是哪两根？缺了会怎样？',
        a: 'OAM 提供两个控制参数：**Handover Trigger 最大偏移**（相对 OAM 默认工作点允许的最大绝对偏离）与**两次 Handover Trigger 变更的最小时间间隔**（管稳定性与收敛）。缺了最短间隔，参数就在两个值之间来回摆不收敛；缺了偏移上限，自动调整可以飘出人工网优认可的圈。',
        ref: '38.300#15.5.2.5' },
      { q: '判责用的 Tstore_UE_cntxt 归谁管？',
        a: '条款明文：为支撑移动性优化的检测解法，**Tstore_UE_cntxt 应（shall）可由 OAM 系统配置**——判责的标尺刻度也在 OAM 手里。全部自动修改 + 判责门限三样（标尺、圈、节奏）都归 OAM，自优化的一切自由都是圈内的自由。',
        ref: '38.300#15.5.2.5' }
    ] },
    'm45:q0': { levels: [
      { q: '接通率掉了，第一步怎么把「拒绝」和「失败」分开？',
        a: '**看 RRCReject 与 T300 到期的占比**（分桶为工程口径，非 3GPP 条款）：收到 RRCReject 且带 waitTime→UE 起 T302 被门禁——这是网络主动限流（准入/拥塞），不是无线故障；T300 到期→无线面失败（reset MAC、记 VarConnEstFailReport；SIB1 带 connEstFailureControl 且同小区连败达 connEstFailCount 次才触发 connEstFailOffset 临时退避）。拒绝型看时段特征（忙时集中），失败型看 RACH 与覆盖。',
        ref: '38.331#5.3.15.2' }
    ] },
    'm45:q1': { levels: [
      { q: 'T300 到期后，UE 手里留下什么证据？',
        a: '**VarConnEstFailReport 一本账**：PLMN、失败小区全局标识/TAC、小区级与 SSB 级 RSRP/RSRQ、按重选排序的邻区测量（至多每频点 6 同频+3 异频+3 异 RAT）、perRAInfoList（按 §5.7.10.5 填）；支持多份的 UE 挪进 VarConnEstFailReportList 再写新条目；**48 小时可弃**，等 UEInformationRequest 的 connEstFailReportReq 来取——取证要趁早。',
        ref: '38.331#5.3.3.7' }
    ] },
    'm45:q2': { levels: [
      { q: '掉线率分解的第一刀切在哪？',
        a: '**先看 RLF 频次、再看重建成功率**（分桶为工程口径，非 3GPP 条款）：N310 连续 out-of-sync 起 T310（§5.3.10.1），T310 到期/连接态随机接入问题/RLC 达最大重传才判 RLF（§5.3.10.3）；N311 连续 in-sync 还能静默恢复——失步次数远多于 RLF 次数。重建成=连接保住（用户面短暂中断），不成回 IDLE（release cause「RRC connection failure」）才是真掉线。',
        ref: '38.331#5.3.10.3' },
      { q: '重建请求为什么带「PCI+C-RNTI+shortMAC-I」三样？',
        a: '**网络靠这三样找回并验证 UE context**：physCellId 定位源小区、c-RNTI 对号上下文、shortMAC-I（MAC-I 的低 16 位）计算比对验真；reestablishmentCause 三值（reconfigurationFailure/handoverFailure/otherFailure）。重建发到哪个小区同时决定 M43 三分类判责的归属——同一台 UE、同一场失败，落点不同责任站就不同。',
        ref: '38.331#5.3.7.4' }
    ] },
    'm45:q3': { levels: [
      { q: '「切换成功率」里的"成功"，协议上怎么判？',
        a: '**四条 KPI 链里唯一一个"成功"被条款写死的**（KPI 本身为工程口径，非 3GPP 条款）：38.300 §15.5.2.2.2 明文 the "successful handover" refers to the UE state, namely the successful completion of the RA procedure——看 **UE 是否完成目标小区随机接入**，不看网络收没收到 ReconfigurationComplete。切换失败的协议现场因此在目标侧 RA：T304 到期（reconfiguration with sync 失败，§5.3.5.8.3）就是最常见的现场。',
        ref: '38.300#15.5.2.2.2' },
      { q: 'T304 怎么起表、到期意味着什么？',
        a: '**执行 reconfiguration with sync 时、以其中的 t304 为目标 SpCell 起表**（§5.3.5.5.2 实文：start timer T304 for the corresponding SpCell with the timer value set to t304, as included in the reconfigurationWithSync）；到期=切换失败：释放 rach-ConfigDedicated 专用前导、revert 回源 PCell 配置、失败信息存 VarRLF-Report（这只 T304 不是 T311 期间小区选择起的才存）、发 §5.3.7 重建。成功切换后 T304 的 elapsed/configured 比率超门限还会触发 SHR（§5.7.10.6）——成功也要复盘。',
        ref: '38.331#5.3.5.5.2' }
    ] },
    'm45:d2': { levels: [
      { q: '面试官追问：四条 KPI 链的排障优先级怎么排？',
        a: '**果→因→证一张图**（分桶与优先级为工程口径，非 3GPP 条款）：**接通率**先分拒绝型/失败型（RRCReject 的 T302 门禁 vs T300 到期——失败型再分 RACH 段取 RA Report、T300 段取 connEstFailReport）→**掉线率**拆 RLF 频次与重建成功率（rlf-Report+mobilityHistory，48h/PLMN 门禁先过）→**切换率**按三分类分桶（HANDOVER REPORT 判责+SHR 抓"成功但险些失败"）→**干扰覆盖**两套口径并看（网元聚合 vs UE 抽样不能互代）。指标告诉你哪里疼，报告告诉你为什么疼。',
        ref: '38.331#5.7.10.3' }
    ] },
    'm45:d7': { levels: [
      { q: '话统干扰统计和 UE 测量报告，为什么不能互相替代？',
        a: '**两套口径**（工程口径，非 3GPP 条款）：话统是网元聚合统计（全网全样本、网管自带时间聚合、看统计面）；UE 测量是触发式抽样（过判据才报、L3 滤波 Fn=(1−a)Fn−1+a·Mn 之后才进判据）——**样本集、采样点、平滑方式都不同**。测量报告是前哨、话统是事后账；排查覆盖问题先看失败前有没有报丧式的测量事件，再对掉线记录，时序对上了才好下结论。',
        ref: '38.331#5.5.3.2' }
    ] },
    'm46:q0': { levels: [
      { q: 'CHO 的执行条件在配置上受哪些限制？为什么说判据机器还是 M42 那台？',
        a: '条款三连（38.300 §9.2.3.4.1）：执行条件由**一或两个触发条件**构成（CHO 事件 A3/A5）、**只支持单一 RS 类型**、单个候选小区**最多两种触发量**（如 RSRP+RSRQ、RSRP+SINR）。判据本体与测量事件同源——A3/A5 的不等式、L3 滤波、TTT 全是 M42 讲过的那台机器，CHO 只是把它挂在候选头上让 UE 自己判。',
        ref: '38.300#9.2.3.4.1' },
      { q: 'CHO 候选配置为什么不能带 DAPS？',
        a: '表注 1a 明文（38.300 §9.2.3.4.2）：候选小区配置**不得含 DAPS 切换配置**。机理上两条路线相反——DAPS 切了还保持源站并发收发（M5 讲过），CHO 从开始向目标同步起就**不再监视源小区**（§9.2.3.4.1，先断后接）；配置级互斥把口子封死。',
        ref: '38.300#9.2.3.4.2' }
    ] },
    'm46:q2': { levels: [
      { q: 'CHO 候选配置存在 UE 的哪个变量里？收到之后先干什么？',
        a: '存 **VarConditionalReconfig**（38.331 §5.3.5.13.1）——目标 SpCell 参数在 condRRCReconfig 里；收货按字段分派：带移除清单走移除程序、带增改清单走增改程序——**增改的尾句要求改完立即进入条件重配置评估**（§5.3.5.13.3；移除程序无此指令）。',
        ref: '38.331#5.3.5.13.1' },
      { q: '候选清单是「一锤子买卖」吗？网络怎么改写？',
        a: '不是。**增改清单**（§5.3.5.13.3）有同 id 则替换执行条件/候选配置、无则新增，改完立即再评估；**移除清单**（§5.3.5.13.2）按 condReconfigId 删表项——表注：带了不属于当前配置的 id 不算消息错误（宽容移除）；38.300 侧表注同样明文 CHO 配置之后源站还可再发重配置——候选增删改是常态运维。',
        ref: '38.331#5.3.5.13.3' }
    ] },
    'm46:q3': { levels: [
      { q: 'CHO 配置了却从没执行、连接失败——判什么？',
        a: '归 **Too Late**（CHO 场景判词 Too Late CHO Execution）：38.300 §15.5.2.2.2 检测原文把「配置了 CHO/LTM 但执行未发起」列进 Too Late 判据，UE reported timer 缺失或大于门限（如 Tstore_UE_cntxt）即落网；timer 在 CHO 场景量的是自 CHO 执行到失败的时长——从没执行自然量不出。',
        ref: '38.300#15.5.2.2.2' },
      { q: '执行了但失败呢？三分类怎么换名？',
        a: '换名句明文：Too Late/Too Early Handover 与 Handover to Wrong Cell 在 CHO 场景即指 **Too Late CHO Execution、Too Early CHO Execution、CHO Execution to Wrong Cell**（带候选 SCG 的 CHO 再换一套名）；Wrong Cell 检测还点名「UE 尝试 CHO 恢复的小区」。判责文书怎么流（Failure Indication/HANDOVER REPORT/NG 配置转移）M43 讲过。',
        ref: '38.300#15.5.2.2.2' }
    ] },
    'm46:d5': { levels: [
      { q: '两个候选小区同时满足执行条件，谁拍板选哪个？',
        a: 'UE 自己选（38.331 §5.3.5.13.5）：多个 triggered cell 选一个、多对 triggered PCell+PSCell 选一对；表注明文选哪个属 **UE 实现行为**，例如考虑波束与波束质量。协议不规定算法——网络事后从 Complete 的落点才知道 UE 选了谁。',
        ref: '38.331#5.3.5.13.5' },
      { q: '选定之后的执行动作是什么？CHO 的执行窗口与普通切换差在哪？',
        a: '应用选中小区存储的 condRRCReconfig 并按 5.3.5.3 动作生效（§5.3.5.13.5）——**不等网络再发任何命令**，这就是「条件满足即执行」；从开始向目标同步起 UE 不再监视源小区（§9.2.3.4.1）。普通切换（M5）是网络命令一到就切，CHO 是 UE 条件满足自己掐表出发。',
        ref: '38.300#9.2.3.4.2' }
    ] },
    'm47:q0': { levels: [
      { q: 'LTM 跟 CHO 共用「先备候选、后触发执行」的骨架，到底差在哪？',
        a: '差在**拍板信令与触发权**（M47）：CHO 条件满足后 UE 应用存储的 RRCReconfiguration——拍板权在 UE、信令载体仍是 RRC；LTM 由 gNB 发 **MAC CE 捎带的 cell switch 命令**拍板（38.300 §9.2.3.5.1 定义：gNB 收 L1/L3 测量报告后可据此改服务小区，命令指名事先 RRC 备好下发的候选配置）——拍板信令从 L3 降到 L2。候选的准备方式两者一样，都走 RRC 提前下发。',
        ref: '38.300#9.2.3.5.1' },
      { q: 'UE 侧配了执行条件，网络还能直接命令吗？两路怎么并存？',
        a: '能。表注 000 明文（38.331 §5.3.5.18.6）：对**已配执行条件的候选**，网络也可以直接发 LTM cell switch command MAC CE——UE 条件评估与网络命令**两路并存**，网络保留一锤定音权；执行程序入口三个：下层指示、T311 运行期间小区选择、执行条件满足（§5.3.5.18.6）——三个入口汇到同一套执行动作。',
        ref: '38.331#5.3.5.18.6' }
    ] },
    'm47:q2': { levels: [
      { q: 'RACH-less LTM 凭什么不跑随机接入？上行资源哪来？',
        a: '凭**有效 TA 在手**（38.300 §9.2.3.5.1）：只要有有效 TA 值，UE 收到 cell switch 命令就做 RACH-less；接入目标用 **configured grant**——候选配置里携带，UE 选命令所指波束关联的时机——或 **dynamic grant**，命令可带 SR 配置 ID（SR 配置+PUCCH 资源）；红线一条：RACH-less 完成前无有效 PUCCH 资源时不得触发随机接入。',
        ref: '38.300#9.2.3.5.1' },
      { q: '候选小区的 TA 从哪来？有效性谁保证？',
        a: '三来源（38.300 §9.2.3.5.1）：①命令直接捎带（网络可不经 early TA 直接给）；②PDCCH order 触发 CFRA——UE 向候选发前导但**不收 RAR**（少断源站数据），TA 由候选侧算好、经源站在命令里捎带；③UE-based TA 测量——RRC 配置、UE 自测、时机 UE 实现定。定时器侧：UE **不维护候选 TA 定时器**，TA 有效性靠**网络实现保证**（§9.2.3.5.2 步 4b）。',
        ref: '38.300#9.2.3.5.1' }
    ] },
    'm47:d6': { levels: [
      { q: 'RACH-less LTM 的「执行成功」怎么判？跟 RACH-based 差在哪？',
        a: '判据分两态（38.300 §9.2.3.5.2 步 8）：RACH-based=RA 成功完成；**RACH-less=UE 判定网络已成功收到其首个 UL 数据**——不看 RAR（RACH-less 根本没跑 RA）、不看 T304 停转，看首包上行落地。',
        ref: '38.300#9.2.3.5.2' },
      { q: '这个成功口径怎么接进判责？LTM 场景的判词叫什么？',
        a: '判责定义直接吸收（38.300 §15.5.2.2.2）：MCG LTM cell switch 场景的「成功切换」=RACH-based 的 RA 成功、或 RACH-less 的首个 UL 数据被网络收到——判 Too Early/Wrong Cell 都踩在这块地基上；timer 两支量法=自上次切换初始化、或自 **CHO/LTM 执行**到失败；换名句明文：**Too Late LTM cell switch、Too Early LTM cell switch、LTM cell switch to Wrong Cell**。文书链 M43 讲过。',
        ref: '38.300#15.5.2.2.2' }
    ] },
    'm48:q0': { levels: [
      { q: 'LTE 的连接建立跟 NR 差在哪？',
        a: '骨架同构（M1/M48）：都是三段式、Request 都走 CCCH、都靠随机接入送 Msg3。差异在**消息名与细节**：LTE 叫 **RRCConnectionRequest/RRCConnectionSetup/RRCConnectionSetupComplete**（NR 是 RRCSetupRequest 系，少个 Connection 前缀）；LTE 的 Request 带 **establishmentCause** 与 **ue-Identity**（上层给 S-TMSI 就用、没给就抽随机数）——IE 枚举在 36.331 §6。面试时两套名字一口气对上，就是「两代差在哪」最省力的答案。',
        ref: '36.331#5.3.3.1' },
      { q: 'T300 到期 UE 具体记什么账？',
        a: '记进 **VarConnEstFailReport**（36.331 §5.3.3.6）：失败小区全局标识、失败时刻本小区 RSRP/RSRQ、邻区测量，还专门记随机接入三件——**numberOfPreamblesSent**（前导发了几根）、**contentionDetected**（有没有撞竞争）、**maxTxPowerReached**（最后一根是否顶到最大功率）。支持临时惩罚的 UE，同一小区连续 **connEstFailCount** 次到期后按 connEstFailOffset 给该小区挂一段时期的 Qoffsettemp——抬高重选门槛缓解反复失败。重建时 Complete 带 rlf-InfoAvailable 等标志——账本信息在场即可用标志告知网络。',
        ref: '36.331#5.3.3.6' }
    ] },
    'm48:q1': { levels: [
      { q: 'LTE 安全激活为什么是「完整性先行、加密随后」？',
        a: '因为 SecurityModeCommand 自身就是第一块试金石（36.331 §5.3.4.3）：UE 按命令带的算法派生 **KRRCint** 先验**命令自身的完整性**——命令本身还是明文，验不过就说明链路上有假货。验过才派生 KRRCenc/KUPenc 并**立即启用完整性保护**（含 SecurityModeComplete 自身），**加密等过程完成后生效**——原文 except for the SecurityModeComplete message which is sent unciphered，Complete 本身不加密。',
        ref: '36.331#5.3.4.3' },
      { q: '安全激活失败连接会断吗？UE 怎么办？',
        a: '不断。36.331 §5.3.4.3：校验不过——**继续使用收到命令之前的旧配置**（既不启用完整性也不启用加密）、发 **SecurityModeFailure** 收场——SRB1 还在明文跑，连接保持。条款**未设重试**，补救靠网络重新发起安全激活（工程口径）。集中失败要查算法配置与密钥同步，偶发常见于覆盖边缘的丢包乱序。',
        ref: '36.331#5.3.4.3' }
    ] },
    'm48:q3': { levels: [
      { q: '重建请求里 UE 带什么「对账暗号」？',
        a: '三件（36.331 §5.3.7.4）：**C-RNTI**（源 PCell 用的，切换失败场景）或触发重建小区的、**physCellId**、**shortMAC-I**——原文=**MAC-I 的低 16 位**，用源 PCell 的 KRRCint 密钥与完整性算法算出。这是 UE 的对账暗号：目标站拿它与备好的上下文对账——对不上（小区没备好上下文）就回 Reject（m48f5 的场景）。',
        ref: '36.331#5.3.7.4' },
      { q: '为什么说重建成功只回到「够说话的最小态」？',
        a: '因为只救回 **SRB1**（36.331 §5.3.7.1 原句：SRB1 operation resumes while the operation of other radio bearers remains suspended）——SRB2 和全部 DRB 挂起，用户面断着。要恢复业务得等**重建后的第一条 RRCConnectionReconfiguration**（36.331 §5.3.5.3：第一条重配 resume SRB2 与挂起的 DRB）；安全侧按 nextHopChainingCount 更新 KeNB、重派生三把钥匙、算法不变（§5.3.7.5）——「最小态」+一次重配，重建的恢复闭环就这两步。',
        ref: '36.331#5.3.7.1' }
    ] },
    'm49:q0': { levels: [
      { q: 'NTN 的上行同步为什么有保质期？',
        a: '因为卫星在动，网络广播的辅助信息只在一段时间内可信。RRC_CONNECTED 的 UE 收 SIB19 就要 **start 或重启 T430**（38.331 §5.2.2.4.21）：定时值=该小区 **ntn-UlSyncValidityDuration**（s5..s900 共 16 档），起点=该小区 **epochTime** 指示的子帧。到期（§5.2.2.6）UE 告知下层 UL 同步丢失→重取 SIB19→成功后告知同步恢复——上行同步不是稳态，是一份要不断续期的账。',
        ref: '38.331#5.2.2.4.21' },
      { q: '这套机制跟地面网的上行同步差在哪？',
        a: '地面网里 TA 配好基本不变，同步是「配好就一直在」的稳态；NTN 里服务链路传播延迟随卫星运动持续变化，广播的公共 TA、星历都只在 **epochTime 之后的有效期**内可用——所以 38.331 给它配了整套账本机制：保质期（T430/ntn-UlSyncValidityDuration）+时间基准（epochTime）+重取动作（表注：UE 应在有效期结束前重取 SIB19）。切换/重配到新小区还要按**新小区**的 NTN-Config 重启 T430（§5.3.5.5.2）——账本跟着小区走。',
        ref: '38.331#5.2.2.6' }
    ] },
    'm49:q2': { levels: [
      { q: '卫星切换跟地面切换差在哪？',
        a: '最大差异：**预告式 vs 命令式**。地面切换是测量事件触发、网络下 RRC 切换命令（M5/M48）；NTN 的卫星切换（SatSwitchWithReSync，38.331 §5.7.19）由 SIB19 **广播预告**：t-Service 指示小区将停止覆盖当前区域的时刻，UE 到点**自主执行四动作**——停 T430、告知下层 UL 同步丢失、向新卫星服务的 SpCell 同步 DL、按新 NTN-Config 重启 T430。全程没有 RRC 切换消息。',
        ref: '38.331#5.7.19' },
      { q: 't-ServiceStart 到 t-Service 这段窗口是干嘛的？',
        a: '给**软切换**用的（§5.7.19 原文）：支持 soft satellite switch with resynchronization 的 UE，在 t-ServiceStart 到 t-Service 之间就开始获取新卫星 SpCell 的 DL 同步——提前把新卫星下行锁住，t-Service 一到即换。硬切换语义下这就是「先听新台、到点换台」。表注明文：卫星切换后 UE 应重取 SIB19（时机 UE 实现）——新卫星的账本要重新领。',
        ref: '38.331#5.7.19' }
    ] },
    'm49:q3': { levels: [
      { q: 'RedCap 终端接入时怎么让网络认出来？',
        a: '接入第一拍就亮身份（38.331 §5.7.10.5）：RA 由 **RedCap/SDT/Msg3 重复/Msg1 重复/eRedCap/切片**等特征触发时，UE 设 **triggeredFeatureCombination** 指示全部触发特征——网络按特征组合划分专用前导分区（feature combination-specific RACH 配置）。实际用的组合与触发组合不同时，另记 usedFeatureCombination 如实上报。',
        ref: '38.331#5.7.10.5' },
      { q: '小区不就绪时 RedCap 连驻留都进不去？',
        a: '对。SIB1 接收动作里就有一道门（38.331 §5.2.2.4.2）：RedCap UE 发现 **intraFreqReselectionRedCap 缺失**、或只支持半双工 FDD 的 UE 发现 **halfDuplexRedCapAllowed 缺失**——按 38.304 判小区禁用并同频重选（eRedCap 对应 intraFreqReselection-eRedCap 一族；旗标在位再看 cellBarredRedCap1Rx/2Rx 按 Rx 分支评估）。组合场景另有关卡：SDT 五条件里 (e)RedCap 专属的 ncd-SSB-RedCapInitialBWP-SDT（§5.3.13.1b）——轻量终端在重选、接入、小数据三处都有专属规则。',
        ref: '38.331#5.2.2.4.2' }
    ] },
    'm50:q0': { levels: [
      { q: 'PC5 侧的 RRC 重配跟 Uu 侧差在哪？',
        a: '骨架像，对等体换了：Uu 侧重配的对端是网络，PC5 侧 **RRCReconfigurationSidelink 的对端是对等 UE**（SL-SRB3 承载，PC5-S 安全建立后才发）。发起方组好消息要 **per destination 起 T400**（§5.8.9.1.2）；接收方逐列表执行增删改，**sl-DRX-ConfigUC-PC5 要 UE 接受才配下层**，无法遵从（部分）就继续用旧配置并回 RRCReconfigurationFailureSidelink（§5.8.9.1.3）。',
        ref: '38.331#5.8.9.1.3' },
      { q: '收不到响应怎么办？UE 配置从哪来？',
        a: 'T400 到期就是 SL RLF 判据之一（§5.8.9.3）——重配悬而未决按直连断链处理。配置源是**三态规则**（§5.8.9.1.1 原文）：RRC_CONNECTED 用 RRCReconfiguration 给的参数，RRC_IDLE/INACTIVE 用系统信息（SIB12），其他场景用 SidelinkPreconfigNR 预配置；**拿到新状态的配置之后才应用新配置，之前继续用旧的**——切换瞬间不空窗。',
        ref: '38.331#5.8.9.1.1' }
    ] },
    'm50:q2': { levels: [
      { q: 'Sidelink 同步为什么要有优先组？',
        a: '因为直连里「跟谁对时」的候选源天生多元：**gNB 广播、GNSS、别的 UE（SyncRef UE）**都在发同步信息——没有排序就会各跟各的钟，时序一漂 HARQ 与 DRX 全错位。38.331 的解法是两层：先按 **sl-SyncPriority** 定大方向（gnbEnb=基站优先选小区、gnss=GNSS 可靠就选它），再在候选之间按**优先组**排座次（如 gnbEnb 组：inCoverage=true 的 UE→false→GNSS→SLSSID 0→其他）（§5.8.6.2/§5.8.6.2a）。',
        ref: '38.331#5.8.6.2' },
      { q: '什么时候会换同步源？',
        a: '重选评估三条（§5.8.6.2b）：候选 PSBCH-RSRP 超最小要求之余 **sl-SyncRefMinHyst** 且属更高优先组；或同组最强候选超当前 **syncRefDiffHyst**；或 GNSS 变可靠。反向兜底：当前 SyncRef UE 低于最小要求、GNSS 变不可靠、所选小区检测不到——视为未选中，重跑全搜索；无候选时按 §5.8.5.3 从 OoC 集随机选 SLSSID（排除 336/337）当临时灯塔。',
        ref: '38.331#5.8.6.2b' }
    ] },
    'm50:q3': { levels: [
      { q: 'SL RLF 判什么？',
        a: '五判据（§5.8.9.3，全是对特定 destination）：SL RLC 实体指示**达最大重传次数**；**T400 到期**；MAC 指示 **HARQ-based SL RLF**；PDCP 指示 **SL-SRB2 或 SL-SRB3 完整性校验失败**；MAC 指示**所有 RB set 持续 LBT 失败**。命中任一即视为该 destination 的 sidelink radio link failure——注意它是**按连接（destination）判**的，不是全 UE 级。',
        ref: '38.331#5.8.9.3' },
      { q: '判完之后做什么？',
        a: '一条善后链走到底：释放该 destination 的 SL DRB→SL SRB→PC5 Relay RLC 信道→丢弃其 SL 配置→重置 sidelink specific MAC→**视为该 PC5-RRC 连接已释放**→向上层指示（PC5 unavailable）。RRC_CONNECTED 的 UE 还要经 SidelinkUEInformationNR 把 **sl-Failure=rlf** 报给网络（§5.8.3.3）——直连断了，网络要知情。',
        ref: '38.331#5.8.3.3' }
    ] },
    'm51:q0': { levels: [
      { q: '广播的配置为什么放系统信息，不走专有信令？',
        a: '因为广播是小区级群发、**没有订阅账本**——网络不知道谁在听——没有订阅账可查，桌牌（MCCH 的 MBSBroadcastConfiguration）面向全体广播；收 MCCH 所需的配置同样在系统信息里（SIB1 与 SIB20，§5.9.1.1 原文）。专有信令逐条点名是单播/多播 CONNECTED 侧的心智（对照 m51 的 mrb-ToAddModList）。',
        ref: '38.331#5.9.1.1' },
      { q: '不在服务区还白收 MCCH 吗？',
        a: '规范留了口子：表注明文（§5.9.2.2），UE 可用 USD 的 Target Service Area 或 SIB27 的 ISA 避免在 MBS 服务区外获取 MCCH——怎么做由 UE 实现定。',
        ref: '38.331#5.9.2.2' }
    ] },
    'm51:q2': { levels: [
      { q: '广播 MRB 和单播 DRB 的配置来源差在哪？',
        a: '单播 DRB 由网络专有 RRCReconfiguration 逐条配置（M6 的机器）；广播 MRB 的 PDCP/RLC 配置来自 MCCH 桌牌里的 **MRB-InfoBroadcast**（§5.9.3.3 原文），而且适用状态宽到 RRC_IDLE/INACTIVE/CONNECTED 三态（§5.9.3.1）——零专有信令，读到桌牌就自己动手建。',
        ref: '38.331#5.9.3.3' },
      { q: '已配置的广播 MRB 要改配置怎么办？',
        a: '表注明文（§5.9.3.1）：已配置 MRB 的修改怎么做**由 UE 实现定**——规范不规定统一路径。工程常见解：重读 MCCH（获取是全量覆盖、无增量），按新配置做相应调整；MCCH 变更本身有修改周期+位图通知兜底（§5.9.1.3）。',
        ref: '38.331#5.9.3.1' }
    ] },
    'm51:q4': { levels: [
      { q: '为什么多播位图的 MSB 是 reserved？',
        a: '对照着看就通：广播的 MSB=1 表示**新 MBS 业务开始**（§5.9.1.3）——广播面向全小区，新业务上线要广而告之；多播只伺候 **join 过的会话**（§5.10.1.1），加入在上层完成，RRC 侧没有「新业务开始」的通知语义，MSB 自然保留（§5.10.1.3 原文：The MSB in the 2-bit bitmap is reserved）。',
        ref: '38.331#5.10.1.3' },
      { q: '漏收变更通知会怎样？',
        a: '广播/多播同款风险，两处表注都写明由 **UE 实现定**（§5.9.2.2/§5.10.2.2）。兜底在机制本身：修改周期内 MCCH 按重复周期可多次重发（§5.9.1.3），而获取是**全量覆盖、无增量**——任何时候重读一次就拿到最新配置，不会拿到半新半旧的账。',
        ref: '38.331#5.9.1.3' }
    ] },
    'm52:q0': { levels: [
      { q: '为什么 IAB-donor 也拆成 CU 和 DU？',
        a: '因为 donor 本来就是一台 gNB——「能够服务 IAB-node 的 gNB 命名 IAB-donor」（§6.1.3 原文），gNB 的 CU/DU 分离架构原样继承（M41 的地基）：IAB-node 的 F1 终结在 donor-CU、无线侧锚在 donor-DU；CP/UP 分离部署时 donor 甚至可由 donor-CU-CP+多个 CU-UP+多个 DU 组成（§6.1.3 原文）。',
        ref: '38.401#6.1.3' },
      { q: 'IAB-node 为什么不干脆叫「小 gNB」？',
        a: '它比 gNB 少一块「自己的回程」——回程借道接入链（MT 侧），所以规范叫它 node（节点）：一节 MT 一节 DU 的双角色。而 gNB-DU/gNB-CU/UE 上下文的全部功能对 IAB-DU/IAB-donor-CU/IAB-MT「同样适用，除非另有说明」（§6.1.3 原文三连）——复用存量规范、只在例外处改笔，不重写。',
        ref: '38.401#6.1.3' }
    ] },
    'm52:q2': { levels: [
      { q: 'IAB-MT 怎么向 donor 要 IP？',
        a: '走 IAB Other Information 过程（§5.7.12.1 原文）：请求侧按协议填数量字段——iab-IPv4-AddressNumReq/iab-IPv6-AddressNumReq/iab-IPv6-AddressPrefixReq（消息字段明文）；地址按 all traffic/F1-U/F1-C/non-F1 四类用途各请求各的（§8.9.13），donor-CU 可再发起 TNL Address Allocation 从 donor-DU 取号，最后经 RRC 下发。',
        ref: '38.331#5.7.12.1' },
      { q: 'EN-DC/NR-DC 下这条消息走哪条车道？',
        a: '§5.7.12.3 原文分支：**SRB3 配了就走 SRB3**；没配则 (NG)EN-DC 嵌入 E-UTRA RRC 的 ULInformationTransferMRDC（36.331），NR-DC 朝 SN 的场景嵌入 NR RRC 的 ULInformationTransferMRDC（5.7.2a.3）；SA 场景直接递交底层——车道选错消息就出不了门（故障面 m52f6）。',
        ref: '38.331#5.7.12.3' }
    ] },
    'm52:q4': { levels: [
      { q: 'boundary 节点诞生后，F1 流量怎么跟上？',
        a: '靠流量卸载（offload）：新 CU 先把 RRC 配置发给 IAB-MT——新 TNL 地址/新拓扑的 BAP 地址/默认 BH RLC channel 与 default BAP routing ID（§8.17.4 步骤 14 原文转述），随后经 IAB Transport Migration Management 系列消息把流量逐批卸载到新路径（8.17.3.1 的 14-20 步）——F1 端点留在源 CU 不动，换的只是路。',
        ref: '38.401#8.17.4' },
      { q: '卸载过去的流量还能搬回来吗？',
        a: '能。课程 b3 的账本：卸载本身可逐批释放乃至全撤。全撤通道是反向切换——boundary IAB-MT 被切回初始 CU 后，其流量沿原路径重新路由（§8.17.4 原文）；逐批回收则经 IAB Transport Migration Management 系列按 traffic 申请释放（§8.17.3.1）。',
        ref: '38.401#8.17.4' }
    ] },
    'm53:q0': { levels: [
      { q: '中间六个域的顺序是什么？',
        a: '站内按「一条消息的完整旅程」排组（player.js HUB_GROUPS 注释原文）：主线→空口信令（RRC）→接口运输→信封外层（NAS/核心网）→底层地基→横切对照——对应编号 02 RRC · 空口信令组、03 接口与用户面、04 NAS 与核心网、05 空口底层、06 安全与两代对照、07 业务与垂直（八域纵览在 M53 毕业课 g1）。',
        ref: '38.331#5.3.3.1' },
      { q: '为什么岗位域挂在最后？',
        a: '出口定位：jobs 域 desc 原文「与求职岗位最短路径的课程……全站收官」，与主线域「全站的地图，也是所有课的前置」一头一尾——中间六域是一条消息的旅程，岗位域是旅程的归宿（M53 毕业课整门讲这个归宿：地图、路径、岗位、检验四幕）。',
        ref: '38.331#5.3.3.1' }
    ] },
    'm53:q3': { levels: [
      { q: '「六层各问一句」，每句具体问什么？',
        a: 'mau 课方法论原文：L1 问失步计数到几了（N310）、MAC 问上行资源还申请得到吗（SR/BSR）、RLC 问重传到第几次了（RETX_COUNT）、PDCP 问账本（COUNT）写到哪了、RRC 问定时器（T310/T311/T301）走到哪了、NAS 问 5GMM 状态机还剩什么（M53 毕业课 c1 的取证清单同源）。',
        ref: '38.321#5.4.4' },
      { q: 'RRC 判死只有 T310 到期一条路吗？',
        a: '不是。mau 课盘点 §5.3.10.3 的死因谱系共六条触发线：T310 到期、T312 到期、MCG MAC 上报随机接入问题、MCG RLC 上报最大重传已到、（IAB）BH RLF 指示、持续上行 LBT 失败——殊途同归 consider radio link failure to be detected；其中 RLC 那条（rlc-MaxNumRetx）可以不经过 T310 直接判死。',
        ref: '38.331#5.3.10' }
    ] },
    'm53:q4': { levels: [
      { q: '「骨架一句话」的反面教材长什么样？',
        a: '牛客系列点过的反面典型（niuke-11 原文）：把广播多播答成「就是一种群发」，或把它说成 LTE eMBMS 换个名字（两代是独立设计）——都是骨架没立住就抢细节；另一种反面是先讲细节再归纳，三步法第一步永远先给体系（M53 毕业课 c4）。',
        ref: '38.331#5.8.1' },
      { q: '「坐标系」怎么报才有效？',
        a: '报课程号与条款号：牛客原话「本站 M51 里有一张七行对照表」——答广播多播时点出「这套对照在 M51 课里」，面试官立刻知道你是系统学过不是刷帖刷来的；坐标系的本质是让知识显出编目（M53 毕业课 c4 的说法：报得出课程号与规范条款号，知识就是编了目的）。',
        ref: '38.331#5.8.1' }
    ] },
    'm54:q0': { levels: [
      { q: '这 48 小时从哪一刻起算，窗内网络怎么把账本取走？',
        a: '从 T330 到期那一刻起算（§5.5a.1.4 原文 48 hours after T330 expiry）。到期时配置 VarLogMeasConfig 已先行释放，数据 VarLogMeasReport 多活 48 小时等取回；取回通道是 UE information procedure（§5.5a.1.1 表注）——取数流程站内 m6-m8 课已讲，「allowed to」是许可不是义务，UE 可以留满 48 小时（M54 课 s3）。',
        ref: '38.331#5.5a.1.4' },
      { q: '内存满和收到新配置，对这条 48 小时窗各是什么影响？',
        a: '两条岔路：内存满=stop T330 并按 5.5a.1.4 到期同款处置（§5.5a.3.2 尾句）——保留窗照常起算，只是起点被提前；收到新配置（同 RAT 或另一 RAT）则完全不同——按 §5.5a.2.2 立即 release 两变量，旧数据直接清、没有保留窗（M54 课 s3/g5 的对照）。',
        ref: '38.331#5.5a.3.2' }
    ] },
    'm54:q4': { levels: [
      { q: '5.5c 的「停打」有几种原因，恢复条件各是什么？',
        a: '两种：事件型 eventA1/A2 的 leaving 条件满足→该配置停打，要等 entering 重新满足才再打（判定复用 5.5.4.2/5.5.4.3 的进入/离开条件，m3 课已讲）；内存满→暂停打点，不再满即恢复（§5.5c.3.2 尾句）——停打与暂停是两条语义，别与 5.5a 的「满=等效到期清配置」混谈（M54 课 n3/m54f6）。',
        ref: '38.331#5.5c.3.2' },
      { q: '怎么从 UE 账本上看出网侧打点断过档？',
        a: '看 timeGap 标记：同配置同小区两次记录的间隔超过 loggingPeriodicity（未配则按 csi-LoggedResourceConfig 的资源周期）时，UE set timeGap=true（§5.5c.3.2）——账本自己标出断档位置，排查连续性问题时先筛它（M54 课 n3）。',
        ref: '38.331#5.5c.3.2' }
    ] },
    'm55:q0': { levels: [
      { q: 'SRAP 头里认人的凭证是什么？两段链路用同一个号吗？',
        a: '**local Remote UE ID 同时出现在 PC5 SRAP 头与 Uu SRAP 头**——两段认人用同一个号。配置方向：Relay UE 由 gNB 配置该 ID；Remote UE 经 Uu RRC 消息获得（RRCSetup/RRCReconfiguration/RRCResume/RRCReestablishment）。防撞号是 gNB 的责任；换号经 RRCReconfiguration 下发，且独立于 PC5 单播链 L2 ID 更新流程——换号不必换链路地址（M55 课 a5）。',
        ref: '38.300#16.12.2.1' },
      { q: '为什么 SRB0 消息在直连 PC5 段没有 SRAP 头？',
        a: '§16.12.2.1 两条特例：转发 Remote UE 的 BCCH/PCCH 消息时 PC5 hop 无 SRAP 头；SRB0 消息在 Remote UE 与直连 Relay UE 之间的 PC5 hop 无 SRAP 头——而 Uu hop 与 Relay UE 之间的 PC5 hop 上 DL/UL 都有。深因：SRB0 走 RRCSetupRequest/RRCSetup 时 local Remote UE ID 尚未分配（建连后才配），直连段靠指定的 PC5 Relay RLC channel 认道即可——六步建连正是这么走通的（M55 课 a3/c1）。',
        ref: '38.300#16.12.2.1' }
    ] },
    'm55:q2': { levels: [
      { q: '中继选择与重选各用什么测量量？没数据在跑呢？',
        a: '两段判据：**选择**（与候选 parent 无单播 PC5 连接时）用 **SD-RSRP** 评朝候选的 PC5 链路质量；**重选**在 Relay→Remote 有 DL 数据传输时用 **SL-RSRP** 做触发评估，无数据传输时用 SL-RSRP 还是 SD-RSRP 由 UE 实现定。suitable=PC5 链路质量超（预）配置阈值+满足全部 AS 与高层判据；多 suitable 候选实现定挑一（M55 课 b3）。',
        ref: '38.300#16.12.4' },
      { q: 'Relay UE 换小区要通知谁？收通知的 UE 必须放链吗？',
        a: 'IDLE/INACTIVE 的 Relay UE 选了新小区→用 **PC5-RRC** 通知已连 Remote/child UE（切换、检测到 Uu/PC5 RLF、Uu RRC 建连或恢复失败、与父链 PC5 释放同样要通知）；RLF 触发的通知要等恢复动作成功后才发、恢复失败则发不发实现定；小区没变可省略。**收通知后放链还是保链由接收方实现定**——放链则触发 PC5 释放并可能小区/中继重选（M55 课 b4）。',
        ref: '38.300#16.12.4' }
    ] },
    'm55:q4': { levels: [
      { q: '中继场景的统一访问控制（UAC）谁做？中继会代做吗？',
        a: '§16.12.5.7 原文两句：The L2 U2N Remote UE performs unified access control——**Remote UE 自己做**统一访问控制；The L2 U2N Relay UE does not perform UAC for L2 U2N Remote UE\'s data——**Relay UE 不为 Remote UE 的数据做 UAC**。中继只是转发通道，准入判定的责任留在被中继者自己（M55 课 c3）。',
        ref: '38.300#16.12.5.7' },
      { q: 'Remote UE 挂在中继下时，移动注册更新按谁的时机走？',
        a: '按 **Relay UE 的服务小区**判：L2 U2N Remote UE 的 Mobility Registration Update/RNAU 基于 Relay UE 的服务小区；IDLE/INACTIVE 的 Remote UE 在服务小区变更（因 Relay 换小区）且**新小区在其配置 RNA/TA 之外**时才发起——中继带着走，出了注册区才重新报到（M55 课 c3）。',
        ref: '38.300#16.12.5.8' }
    ] },
    'm56:q0': { levels: [
      { q: 'MP Remote UE 的信令锚在哪条路径？为什么必须钉在那里？',
        a: '§16.21.3.1：split SRB1 与 SRB2 的 primary path **永远配置在 direct 路径**；非 split 的 SRB1/2 **只允许配在 direct**。因由=全局约束「PCell 恒在 direct」的延伸——信令锚在永远在的直连腿上，间接路全断也不影响 RRC 基本盘；间接口在信令面只是「多一条腿」而非「换主心骨」（M56 课 b2）。',
        ref: '38.300#16.21.3.1' },
      { q: '配了 split SRB1 复制时，路径添加的 Complete 为什么要双发？',
        a: '§16.21.3.1 step6：至少经 direct 发 RRCReconfigurationComplete；配了 split SRB1 with duplication 时**也经 indirect 路径再发一份**——重复信令顺带把「间接路已通」通报给 gNB：收到 indirect 版 Complete 即知中继段就绪，不必额外探活；且第 5 步可在 6a 后执行、与 6a 独立（M56 课 c1/b2）。',
        ref: '38.300#16.21.3.1' }
    ] },
    'm56:q2': { levels: [
      { q: 'N3C 间接路能像 PC5 那样反向补直连吗？一台 N3C Relay 能服务几台 Remote？',
        a: '都不能按直觉来：§16.21.3.1——**不允许**「N3C 间接路之上再加 direct 路径」（N3C 单向：只能在唯一 direct 路径上加 N3C 间接路）；且用 N3C 间接路的 MP Relay UE **被限制为只服务一台** L2 MP Remote UE——multi-Relay 形态要用多台 Relay 铺，每台 N3C Relay 各服务一台 Remote（M56 课 b1）。',
        ref: '38.300#16.21.3.1' },
      { q: 'N3C 形态的候选上报和 PC5 形态差在哪？',
        a: '差不只是字段：PC5 形态报候选 **MP Relay UE ID+小区 ID**（要建 PC5 链）；N3C 形态改经 **UEAssistanceInformation** 报 **C-RNTI+小区 ID**，且**表注限定：MP Remote 与 MP Relay 的安全连接建立后才可报**——字段反推动作，配置张冠李戴先查接口类型与安全前提（M56 课 b3）。',
        ref: '38.300#16.21.3.1' }
    ] },
    'm56:q4': { levels: [
      { q: '间接加流程里 PC5 形态的第 5 步做什么？N3C 形态为什么没有这一步？',
        a: '§16.21.3.1 step5：MP Remote UE 与目标 Relay **建立 PC5 单播链**；表注——**N3C 形态省略第 5 步**，N3C 间接路怎么建由 UE 实现定（预配/静态关系）；且第 5 步可在 6a 之后执行、与 6a 独立（M56 课 c1）。',
        ref: '38.300#16.21.3.1' },
      { q: '直接加流程的 RRCReconfiguration 为什么走间接路下发？',
        a: '§16.21.3.1 Figure -3 step4：此刻 MP Remote UE 还没有 direct 腿——gNB **经 Relay 转发**把重配（至少含 direct 路径添加配置的目标小区）发给 Remote；随后 Remote 同步目标小区下行+随机接入、**把目标小区配置为 PCell**，直连腿立起（M56 课 c3）。',
        ref: '38.300#16.21.3.1' }
    ] },
  };
  g.RRC_FOLLOWUPS = {
    get: function (qid) { return Object.prototype.hasOwnProperty.call(F, qid) ? F[qid] : null; },
    keys: function () { return Object.keys(F); },
    size: function () { return Object.keys(F).length; },
    levelTotal: function () { var n = 0; Object.keys(F).forEach(function (k) { n += F[k].levels.length; }); return n; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
