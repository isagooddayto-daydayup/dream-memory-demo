/** Dream v8.35 world helpers (魂系气质: fog/camera/cold light): physical entrances (doors / storefronts / cave mouths / station mine carts), char cards. No paid APIs. */
export const VERSION = 'v8.81';

/**
 * Hub door definitions (local offsets relative to scene A spawn).
 * Main travel path = walk into glowing frames. Digit keys remain debug/fast travel.
 */
export const DOORS = [
  // v8.5: no floating glow frames. Every door is a physical entrance model; exits are physical too.
  // hubLocal: splat 'from' scene → relative to its spawn; mesh 'from' scene → scene-local.
  { id: 'hub_classroom', label: '教室', from: 'A', to: 'F', hubLocal: [0.8, -7.2], destLocal: [2.0, 6.5], destYaw: Math.PI, exitLocal: [2.0, 9.4], color: 0xffd28a, facade: 'classroom', exitFacade: 'exitdoor' },
  { id: 'hub_nursery', label: '育儿所', from: 'A', to: 'K', hubLocal: [-1.8, -7.5], destLocal: [0, 2.8], destYaw: Math.PI, exitLocal: [0, 4.6], color: 0xffe0a8, facade: 'classroom', exitFacade: 'exitdoor' },
  { id: 'classroom_nursery', label: '隔壁育儿所', from: 'F', to: 'K', hubLocal: [-6.5, 2.0], destLocal: [2.5, 2.0], destYaw: Math.PI/2, exitLocal: [4.2, 2.0], color: 0xffe0a8, facade: 'room', exitFacade: 'exitdoor' },
  { id: 'hub_room', label: '小房间', from: 'A', to: 'D', hubLocal: [-3.8, 3.2], destLocal: [-3.2, 1.5], destYaw: Math.PI, exitLocal: [-3.6, 0.2], color: 0xa8c8ff, facade: 'room', exitFacade: 'exitdoor' },
  { id: 'hub_campus', label: '山洞 · 矿区校园', from: 'A', to: 'B', hubLocal: [1.5, 8.5], destLocal: [0, 0], destYaw: 0, exitLocal: [0, -2.6], color: 0x9dffc2, facade: 'cave', exitFacade: 'cave' },
  { id: 'hub_forest', label: '矿洞 · 林间小路', from: 'A', to: 'G', hubLocal: [7.2, -2.0], destLocal: [0, 7.5], destYaw: Math.PI, exitLocal: [0, 10.4], color: 0x6dff9a, facade: 'mine', exitFacade: 'mine' },
  // v8.35 林中木屋: 森林 G 溪谷旁实体木门（scene-local）
  { id: 'forest_cabin', label: '林中木屋', from: 'G', to: 'N', hubLocal: [-9.0, -1.5], destLocal: [0, 1.4], destYaw: Math.PI, exitLocal: [0, 4.3], color: 0xffc890, facade: 'home', exitFacade: 'exitdoor' },
  // v8.35 教室内部: 校园 F 草地上的绿色木门 → 教室里（雨夜自习）
  { id: 'class_inside', label: '教室里', from: 'F', to: 'O', hubLocal: [-3.5, 2.5], destLocal: [0, 1.6], destYaw: Math.PI, exitLocal: [0, 4.3], color: 0xcfe0ff, facade: 'classroom', exitFacade: 'exitdoor' },
  // v8.35 矿工宿舍: 枢纽 A 东南砖房实体门 → 宿舍内部（雨夜）
  // v8.35 山洞 → 山间湖泊花海（雾林 G 东侧岩石洞门，scene-local）
  { id: 'forest_lake', label: '山洞 · 湖泊花海', from: 'G', to: 'Q', hubLocal: [9.5, 0.5], destLocal: [0, 2.2], destYaw: 0, exitLocal: [0, 9.0], color: 0x9ad8ff, facade: 'cave', exitFacade: 'cave' },
  // v8.35 湖边小屋: 湖泊 Q 西岸实体木门（scene-local）
  { id: 'lake_hut', label: '湖边小屋', from: 'Q', to: 'R', hubLocal: [-6.5, 1.5], destLocal: [0, 1.4], destYaw: Math.PI, exitLocal: [0, 4.3], color: 0xbfe0ff, facade: 'home', exitFacade: 'exitdoor' },
  // v8.35 雨夜街角面馆: 枢纽 A 西北角实体门洞（scene-local）
  // v8.35 矿区后山竹林小径: 枢纽 A 西侧岩石山洞口（scene-local；无光柱）
  { id: 'hub_bamboo', label: '后山 · 竹林小径', from: 'A', to: 'T', hubLocal: [-6.8, 4.8], destLocal: [0, 2.2], destYaw: 0, exitLocal: [0, 6.0], color: 0xa8e0a0, facade: 'cave', exitFacade: 'cave' },
  // v8.35 矿区老影院: 枢纽 A 北侧实体门洞（scene-local；无光柱）
  // v8.35 竹林尽头岩石洞门 → 山崖观景台·云海（scene-local；无光柱）
  { id: 'bamboo_cliff', label: '石门 · 山崖云海', from: 'T', to: 'V', hubLocal: [0, -37.5], destLocal: [0, 0.4], destYaw: 0, exitLocal: [0, 6.4], color: 0xffe0b0, facade: 'cave', exitFacade: 'cave' },
  // v8.35 矿区老理发店: 枢纽 A 西侧实体店门（scene-local；无光柱）
  { id: 'hub_barber', label: '老理发店', from: 'A', to: 'W', hubLocal: [-9.5, 1.6], destLocal: [0, 0.2], destYaw: 0, exitLocal: [0, 4.3], color: 0xff9090, facade: 'shop', exitFacade: 'exitdoor', weathered: true },
  // v8.35 矿区小学图书室: 枢纽 A 东北实体门（scene-local；无光柱）
  // v8.37 雨夜车站候车室: 矿车站 I 东侧实体门（scene-local；无光柱）
  { id: 'station_waiting', label: '候车室', from: 'I', to: 'Y', hubLocal: [7.0, 4.0], destLocal: [0, 3.0], destYaw: 0, exitLocal: [0, 4.8], color: 0xffd080, facade: 'station', exitFacade: 'exitdoor', weathered: true },
  // v8.38 林中萤火虫河滩: 雾林 G 西南实体山洞口（scene-local；无光柱）
  { id: 'forest_firefly', label: '山洞 · 萤火虫河滩', from: 'G', to: 'Z', hubLocal: [-5.0, -7.0], destLocal: [0, 2.4], destYaw: 0, exitLocal: [0, 6.2], color: 0xd0ff90, facade: 'cave', exitFacade: 'cave' },
  // v8.39 矿区水塔: 枢纽东南实体铁门进塔院，经实体斜铁梯爬上塔顶平台（scene-local；无光柱）
  { id: 'hub_watertower', label: '矿区水塔', from: 'A', to: 'AA', hubLocal: [8.6, -6.4], destLocal: [0, 4.6], destYaw: 0, exitLocal: [0, 7.6], color: 0xc8d0d8, facade: 'station', exitFacade: 'exitdoor', weathered: true },
  // v8.40 矿区远处花田风车山坡: 水塔院西侧实体石拱山洞口（scene-local；无光柱）
  { id: 'tower_windmill', label: '山洞 · 花田风车坡', from: 'AA', to: 'AB', hubLocal: [-8.0, 6.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 8.0], color: 0xffd890, facade: 'cave', exitFacade: 'cave' },
  // v8.41 花田风车坡 → 风车磨坊内部: 坡道左侧磨坊小屋实体木门（scene-local；无光柱）
  { id: 'windmill_mill', label: '风车磨坊', from: 'AB', to: 'AC', hubLocal: [-5.5, -1.5], destLocal: [0, 0.2], destYaw: 0, exitLocal: [0, 4.3], color: 0xffc890, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.42 花田风车坡 → 林间水车溪谷: 坡道右侧实体山洞口（scene-local；无光柱）
  { id: 'windmill_creek', label: '水车溪谷', from: 'AB', to: 'AD', hubLocal: [5.5, -1.5], destLocal: [0, 3.0], destYaw: 0, exitLocal: [0, 6.0], color: 0xa8d8a0, facade: 'cave', exitFacade: 'cave', weathered: true },
  // v8.43 水车溪谷 → 枫林温泉: 近岸左侧实体木门小屋（scene-local；无光柱）
  { id: 'creek_maple', label: '枫林温泉', from: 'AD', to: 'AE', hubLocal: [-6.0, 1.5], destLocal: [0, 3.0], destYaw: 0, exitLocal: [0, 6.0], color: 0xe89060, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.44 枫林温泉 → 银杏石庭: 温泉右侧实体木门（scene-local；无光柱）
  { id: 'maple_ginkgo', label: '银杏石庭', from: 'AE', to: 'AF', hubLocal: [5.5, -3.5], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xf0d060, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.45 银杏石庭 → 荷塘月色: 庭院远端实体木门（scene-local；无光柱）
  { id: 'ginkgo_lotus', label: '荷塘月色', from: 'AF', to: 'AG', hubLocal: [5.5, -14.5], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0x88c0b0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.46 荷塘月色 → 樱花夜径: 荷塘远端右侧实体木门（scene-local；无光柱）
  { id: 'lotus_sakura', label: '樱花夜径', from: 'AG', to: 'AH', hubLocal: [9.5, -19.5], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xffb0c8, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.47 樱花夜径 → 紫藤花廊: 樱花远端右侧实体木门（scene-local；无光柱）
  { id: 'sakura_wisteria', label: '紫藤花廊', from: 'AH', to: 'AI', hubLocal: [7.0, -31.5], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xc080e0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.48 紫藤花廊 → 蓝铃木林: 紫藤远端右侧实体木门（scene-local；无光柱）
  { id: 'wisteria_bluebell', label: '蓝铃木林', from: 'AI', to: 'AJ', hubLocal: [5.5, -28.5], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0x7090d0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.49 蓝铃木林 → 薰衣草丘: 蓝铃远端左侧实体木门（scene-local；无光柱）
  { id: 'bluebell_lavender', label: '薰衣草丘', from: 'AJ', to: 'AK', hubLocal: [-5.5, -28.5], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xb090d0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.50 薰衣草丘 → 向日葵海: 薰衣草远端右侧实体木门（scene-local；无光柱）
  { id: 'lavender_sunflower', label: '向日葵海', from: 'AK', to: 'AL', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xe8c060, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.51 向日葵海 → 晨雾茶园: 向日葵远端右侧实体木门（scene-local；无光柱）
  { id: 'sunflower_tea', label: '晨雾茶园', from: 'AL', to: 'AM', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xa8c890, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.52 晨雾茶园 → 绣球花径: 茶园远端右侧实体木门（scene-local；无光柱）
  { id: 'tea_hydrangea', label: '绣球花径', from: 'AM', to: 'AN', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xa0b8d0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.53 绣球花径 → 苔藓蕨谷: 绣球远端右侧实体木门（scene-local；无光柱）
  { id: 'hydrangea_moss', label: '苔藓蕨谷', from: 'AN', to: 'AO', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0x78a888, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.54 苔藓蕨谷 → 芒草夕照: 苔藓远端右侧实体木门（scene-local；无光柱）
  { id: 'moss_miscanthus', label: '芒草夕照', from: 'AO', to: 'AP', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xd0a060, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.55 芒草夕照 → 油菜花田: 芒草远端右侧实体木门（scene-local；无光柱）
  { id: 'miscanthus_canola', label: '油菜花田', from: 'AP', to: 'AQ', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xd0c050, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.56 油菜花田 → 稻田晨光: 油菜远端右侧实体木门（scene-local；无光柱）
  { id: 'canola_rice', label: '稻田晨光', from: 'AQ', to: 'AR', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0x88a860, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.57 稻田晨光 → 麦浪金田: 稻田远端右侧实体木门（scene-local；无光柱）
  { id: 'rice_wheat', label: '麦浪金田', from: 'AR', to: 'AS', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xc8a040, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.58 麦浪金田 → 葡萄园晚霞: 麦田远端右侧实体木门（scene-local；无光柱）
  { id: 'wheat_vineyard', label: '葡萄园晚霞', from: 'AS', to: 'AT', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0x6a4070, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.59 葡萄园晚霞 → 桃花谷: 葡萄园远端右侧实体木门（scene-local；无光柱）
  { id: 'vineyard_peach', label: '桃花谷', from: 'AT', to: 'AU', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xd080a0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.60 桃花谷 → 梅园雪径: 桃花谷远端右侧实体木门（scene-local；无光柱）
  { id: 'peach_plum', label: '梅园雪径', from: 'AU', to: 'AV', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xb07090, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.61 梅园雪径 → 山茶花庭: 梅园远端右侧实体木门（scene-local；无光柱）
  { id: 'plum_camellia', label: '山茶花庭', from: 'AV', to: 'AW', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xc05060, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.62 山茶花庭 → 杜鹃花坡: 山茶花庭远端右侧实体木门（scene-local；无光柱）
  { id: 'camellia_azalea', label: '杜鹃花坡', from: 'AW', to: 'AX', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xd05090, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.63 杜鹃花坡 → 桂花庭: 杜鹃花坡远端右侧实体木门（scene-local；无光柱）
  { id: 'azalea_osmanthus', label: '桂花庭', from: 'AX', to: 'AY', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xd0a040, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.64 桂花庭 → 菊花庭: 桂花庭远端右侧实体木门（scene-local；无光柱）
  { id: 'osmanthus_chrys', label: '菊花庭', from: 'AY', to: 'AZ', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xd08040, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.65 菊花庭 → 玉兰庭: 菊花庭远端右侧实体木门（scene-local；无光柱）
  { id: 'chrys_magnolia', label: '玉兰庭', from: 'AZ', to: 'BA', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xe8c0d0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.66 玉兰庭 → 牡丹庭: 玉兰庭远端右侧实体木门（scene-local；无光柱）
  { id: 'magnolia_peony', label: '牡丹庭', from: 'BA', to: 'BB', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xd04070, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.67 牡丹庭 → 玫瑰园: 牡丹庭远端右侧实体木门（scene-local；无光柱）
  { id: 'peony_rose', label: '玫瑰园', from: 'BB', to: 'BC', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xc02840, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.68 玫瑰园 → 百合园: 玫瑰园远端右侧实体木门（scene-local；无光柱）
  { id: 'rose_lily', label: '百合园', from: 'BC', to: 'BD', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xf0e8d0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.69 百合园 → 鸢尾庭: 百合园远端右侧实体木门（scene-local；无光柱）
  { id: 'lily_iris', label: '鸢尾庭', from: 'BD', to: 'BE', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xb8a0d8, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.70 鸢尾庭 → 兰花庭: 鸢尾庭远端右侧实体木门（scene-local；无光柱）
  { id: 'iris_orchid', label: '兰花庭', from: 'BE', to: 'BF', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xe8b8c8, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.71 兰花庭 → 茉莉庭: 兰花庭远端右侧实体木门（scene-local；无光柱）
  { id: 'orchid_jasmine', label: '茉莉庭', from: 'BF', to: 'BG', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xf0e8d0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.72 茉莉庭 → 海棠庭: 茉莉庭远端右侧实体木门（scene-local；无光柱）
  { id: 'jasmine_haitang', label: '海棠庭', from: 'BG', to: 'BH', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xf0c0c8, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.73 海棠庭 → 丁香庭: 海棠庭远端右侧实体木门（scene-local；无光柱）
  { id: 'haitang_lilac', label: '丁香庭', from: 'BH', to: 'BI', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xc0a0d8, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.74 丁香庭 → 栀子花庭: 丁香庭远端右侧实体木门（scene-local；无光柱）
  { id: 'lilac_gardenia', label: '栀子花庭', from: 'BI', to: 'BJ', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xe8e0c8, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.75 栀子花庭 → 木槿庭: 栀子花庭远端右侧实体木门（scene-local；无光柱）
  { id: 'gardenia_hibiscus', label: '木槿庭', from: 'BJ', to: 'BK', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xe8a0b8, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.76 木槿庭 → 紫薇庭: 木槿庭远端右侧实体木门（scene-local；无光柱）
  { id: 'hibiscus_crape', label: '紫薇庭', from: 'BK', to: 'BL', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xc090c8, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.77 紫薇庭 → 三角梅庭: 紫薇庭远端右侧实体木门（scene-local；无光柱）
  { id: 'crape_bougainvillea', label: '三角梅庭', from: 'BL', to: 'BM', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xe05090, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.78 三角梅庭 → 蓝花楹庭: 三角梅庭远端右侧实体木门（scene-local；无光柱）
  { id: 'bougainvillea_jacaranda', label: '蓝花楹庭', from: 'BM', to: 'BN', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0x7860c0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.79 蓝花楹庭 → 鸡蛋花庭: 蓝花楹庭远端右侧实体木门（scene-local；无光柱）
  { id: 'jacaranda_frangipani', label: '鸡蛋花庭', from: 'BN', to: 'BO', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xe8c878, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.80 鸡蛋花庭 → 合欢花庭: 鸡蛋花庭远端右侧实体木门（scene-local；无光柱）
  { id: 'frangipani_albizia', label: '合欢花庭', from: 'BO', to: 'BP', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xf0a0c0, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  // v8.81 合欢花庭 → 凤凰木庭: 合欢花庭远端右侧实体木门（scene-local；无光柱）
  { id: 'albizia_flame', label: '凤凰木庭', from: 'BP', to: 'BQ', hubLocal: [5.5, -32.0], destLocal: [0, 4.0], destYaw: 0, exitLocal: [0, 7.0], color: 0xe05030, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  { id: 'hub_library', label: '小学图书室', from: 'A', to: 'X', hubLocal: [4.4, 7.8], destLocal: [0, 2.6], destYaw: 0, exitLocal: [0, 4.3], color: 0xffd890, facade: 'classroom', exitFacade: 'exitdoor' },
  { id: 'hub_cinema', label: '老影院', from: 'A', to: 'U', hubLocal: [-2.2, 7.0], destLocal: [0, 2.4], destYaw: 0, exitLocal: [0, 4.3], color: 0xff9a7a, facade: 'shop', exitFacade: 'exitdoor' },
  { id: 'hub_noodle', label: '街角面馆', from: 'A', to: 'S', hubLocal: [-7.6, -3.2], destLocal: [0, 1.6], destYaw: Math.PI, exitLocal: [0, 4.3], color: 0xffc070, facade: 'shop', exitFacade: 'exitdoor', weathered: true },
  { id: 'hub_dorm', label: '矿工宿舍', from: 'A', to: 'P', hubLocal: [4.6, -6.0], destLocal: [0, 1.6], destYaw: Math.PI, exitLocal: [0, 3.8], color: 0xffb070, facade: 'home', exitFacade: 'exitdoor', weathered: true },
  { id: 'hub_home', label: '家', from: 'A', to: 'H', hubLocal: [2.6, 1.2], destLocal: [0, 2.2], destYaw: Math.PI, exitLocal: [0, 3.9], color: 0xffe08a, facade: 'home', exitFacade: 'exitdoor' },
  { id: 'hub_station', label: '矿车站', from: 'A', to: 'I', hubLocal: [-3.8, -5.0], destLocal: [0, 3.5], destYaw: 0, exitLocal: [0, 7.2], color: 0xffb07a, facade: 'station', exitFacade: 'exitdoor', weathered: true },
  { id: 'hub_shop', label: '小卖部', from: 'A', to: 'J', hubLocal: [-5.8, 0.8], destLocal: [0, 2.0], destYaw: Math.PI, exitLocal: [0, 3.9], color: 0xa8e0ff, facade: 'shop', exitFacade: 'exitdoor' },
  // v8.8 飞船/机场连通：枢纽实体机库门 → ARES 火星基地
  { id: 'hub_ares', label: '飞船口 · ARES', from: 'A', to: 'E', hubLocal: [8.5, 4.5], destLocal: [7, 16], destYaw: Math.PI, exitLocal: [7, 22], color: 0xc8b0ff, facade: 'hangar', exitFacade: 'hangar' },
  // 矿车站也可发车去 ARES（短乘车过场）
  { id: 'cart_ares', label: 'ARES 基地', from: 'I', to: 'E', hubLocal: [0.0, -0.9], hubYaw: 0, destLocal: [5.0, 18], destYaw: 0, exitLocal: [9.0, 18], color: 0xc8b0ff, facade: 'cart', exitFacade: 'cartstop', ride: true },
  // 矿车站里的矿车：走进矿车 = 上车 → 短过场 → 远处场景；那边的矿车停靠点坐回来
  { id: 'cart_mars', label: '火星边疆', from: 'I', to: 'C', hubLocal: [3.2, -0.9], hubYaw: 0, destLocal: [1.5, 0], destYaw: Math.PI, exitLocal: [4.6, 0], color: 0xff8a6a, facade: 'cart', exitFacade: 'cartstop', ride: true },
  { id: 'cart_campus', label: '矿区校园', from: 'I', to: 'B', hubLocal: [-3.6, -0.9], hubYaw: 0, destLocal: [2.4, 1.0], destYaw: 0, exitLocal: [4.4, 2.6], color: 0x9dffc2, facade: 'cart', exitFacade: 'cartstop', ride: true },
  // v8.17 机场候车 L / 火星地表庇护所 M（白盒；勿覆盖 cart_mars→C）
  { id: 'hub_airport', label: '机场候车', from: 'A', to: 'L', hubLocal: [6.8, 5.2], destLocal: [0, 4.2], destYaw: Math.PI, exitLocal: [0, 6.6], color: 0xa8c8ff, facade: 'hangar', exitFacade: 'exitdoor' },
  { id: 'airport_ares', label: '登机口 · ARES', from: 'L', to: 'E', hubLocal: [0.0, -5.2], hubYaw: 0, destLocal: [7, 16], destYaw: Math.PI, exitLocal: [7, 22], color: 0xc8b0ff, facade: 'hangar', exitFacade: 'hangar' },
  { id: 'airport_mars_shelter', label: '火星地表舱', from: 'L', to: 'M', hubLocal: [5.5, -4.0], destLocal: [0, 2.0], destYaw: Math.PI, exitLocal: [-3.0, 3.7], color: 0xff8a6a, facade: 'hangar', exitFacade: 'exitdoor' },
  { id: 'station_airport', label: '联运通道', from: 'I', to: 'L', hubLocal: [-6.5, 2.0], destLocal: [-5.0, 0.0], destYaw: Math.PI/2, exitLocal: [-6.8, 0.0], color: 0xffb07a, facade: 'station', exitFacade: 'exitdoor', weathered: true },
  { id: 'hub_mars_shelter', label: '火星地表舱', from: 'A', to: 'M', hubLocal: [9.2, 3.2], destLocal: [0, 2.0], destYaw: Math.PI, exitLocal: [0, 3.8], color: 0xff8a6a, facade: 'hangar', exitFacade: 'exitdoor' },
  { id: 'cart_mars_shelter', label: '火星地表舱', from: 'I', to: 'M', hubLocal: [4.8, -0.9], hubYaw: 0, destLocal: [3.3, 0.2], destYaw: Math.PI, exitLocal: [3.3, 2.1], compactStop: true, color: 0xff8a6a, facade: 'cart', exitFacade: 'cartstop', ride: true },
];

/** @deprecated v8.3: community hubs are real doors now; kept empty for old callers. */
export const COMMUNITY = [];

export function doorWorldPos(SC, door, which) {
  const key = which === 'hub' ? door.from : door.to;
  const S = SC[key];
  if (!S) return null;
  const loc = which === 'hub' ? door.hubLocal : which === 'dest' ? door.destLocal : door.exitLocal;
  const mesh = S.kind === 'mesh';
  const x = S.off.x + (mesh ? loc[0] : S.spawn[0] + loc[0]);
  const z = S.off.z + (mesh ? loc[1] : S.spawn[1] + loc[1]);
  let yaw = 0;
  if (which === 'hub') yaw = door.hubYaw !== undefined ? door.hubYaw : Math.atan2(-loc[0], -loc[1]); // facade opening faces the hub spawn
  else if (which === 'dest') yaw = door.destYaw;
  else { const d = door.destLocal; yaw = Math.atan2(d[0] - loc[0], d[1] - loc[1]); } // exit opening faces the arrival point
  return { key, x, z, yaw };
}

export function communityWorldPos(SC, hub) {
  const S = SC.A;
  if (!S) return null;
  return {
    x: S.off.x + S.spawn[0] + hub.hubLocal[0],
    z: S.off.z + S.spawn[1] + hub.hubLocal[1],
  };
}

export function nearDoor(px, pz, dx, dz, r = 1.35) {
  return Math.hypot(px - dx, pz - dz) < r;
}

const CARD_KEY = 'dream_v8_charcards';

export function loadCharCards() {
  try {
    return JSON.parse(localStorage.getItem(CARD_KEY) || '{}') || {};
  } catch (_) {
    return {};
  }
}

export function saveCharCards(all) {
  try {
    localStorage.setItem(CARD_KEY, JSON.stringify(all));
  } catch (_) {}
}

/** Ensure placeholder growth fields for a playable name. */
export function ensureCharCard(name) {
  const all = loadCharCards();
  if (!all[name]) {
    all[name] = {
      name,
      经历: ['初入矿山小镇'],
      技能: { 探索: 1, 交谈: 1 },
    };
    saveCharCards(all);
  }
  return all[name];
}

export function bumpCharSkill(name, skill, delta = 1) {
  const all = loadCharCards();
  const c = all[name] || ensureCharCard(name);
  if (!c.技能) c.技能 = {};
  c.技能[skill] = (c.技能[skill] || 0) + delta;
  all[name] = c;
  saveCharCards(all);
  return c;
}

export function appendCharStory(name, line) {
  const all = loadCharCards();
  const c = all[name] || ensureCharCard(name);
  if (!c.经历) c.经历 = [];
  if (c.经历[c.经历.length - 1] !== line) {
    c.经历.push(line);
    if (c.经历.length > 12) c.经历 = c.经历.slice(-12);
  }
  all[name] = c;
  saveCharCards(all);
  return c;
}

/** Public-safe playable roster (Rocketbox MIT / already in public npc/real). */
export const ROSTER_PUBLIC = [
  // v8.5 公开版：只用 Microsoft Rocketbox (MIT) 写实模型；每个都有 Idle / Walk / Jog（Quaternius UAL CC0 重定向）
  { f: 'npc/real/c04_fa11_npc.glb', name: '晓雨' },
  { f: 'npc/real/d01_fa12_npc.glb', name: '小晴' },
  { f: 'npc/real/c05_fa03_npc.glb', name: '小雯' },
  { f: 'npc/real/d02_fa15_npc.glb', name: '小悦' },
  { f: 'npc/real/d03_fp01_npc.glb', name: '阿澄·可玩' },
  { f: 'npc/real/d04_fp02_npc.glb', name: 'Vivi' },
];

/** Public stub: LOCAL==PUBLIC (no YY paths in public tree). Real ROSTER_LOCAL restored only on dream_v8_local via sync --restore-roster. */
export const ROSTER_LOCAL = ROSTER_PUBLIC;
export const NPC_LOCAL = [];

export function pickRoster(isLocal) {
  return isLocal ? ROSTER_LOCAL : ROSTER_PUBLIC;
}
