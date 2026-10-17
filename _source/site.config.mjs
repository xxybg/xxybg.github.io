// 站点配置：改这里就能改站名、简介、导航、社交链接
export default {
  url: 'https://xxybg.github.io',
  title: 'xxybg',
  subtitle: '初音未来主题博客',
  description: '一个以初音未来（Hatsune Miku）为主题的博客：记录代码、声音与日常。',
  keywords: ['初音未来', 'Hatsune Miku', 'VOCALOID', '博客', '前端', 'xxybg'],
  author: 'xxybg',
  lang: 'zh-CN',
  postsPerPage: 6,
  // 顶部导航
  nav: [
    { title: '首页', url: '/' },
    { title: '归档', url: '/archives/' },
    { title: '标签', url: '/tags/' },
    { title: '关于', url: '/about/' }
  ],
  social: [
    { title: 'GitHub', url: 'https://github.com/xxybg', icon: 'github' }
  ],
  // 首页主视觉文案
  hero: {
    kicker: 'VOCALOID 01 · 初音ミク',
    title: '把声音，写成文字',
    highlight: '声音',
    typing: ['初音未来 · 39 · 电子歌姬', '听着歌，写下代码', '未来は、ここにある'],
    desc: '这里收集我写下的代码、听过的歌与没说出口的想法。整个站点都披着初音未来的青绿色。',
    primary: { title: '开始阅读', url: '#posts' },
    secondary: { title: '关于本站', url: '/about/' }
  },
  // 关于页
  about: {
    name: 'xxybg',
    role: '写代码的人 / 听歌的人',
    intro: [
      '你好，我是 xxybg。这个博客原本是灰白色的默认模板，现在换成了初音未来的配色——青绿、粉白，还有一点点电子全息的味道。',
      '我喜欢在深夜戴上耳机，让《千本桜》《甩葱歌》《World is Mine》在循环里跑来跑去，然后打开编辑器写点东西。这里就是那些东西的落脚处。',
      '站点用 Node.js 手写的静态生成器构建，没有任何第三方依赖；主题叫 Miku，主色取的是初音头发上的 #39C5BB。'
    ],
    facts: [
      { k: '本命曲', v: 'World is Mine' },
      { k: '代表色', v: '#39C5BB' },
      { k: '编号', v: '01' },
      { k: '现居', v: '声音的尽头' }
    ]
  },
  footer: {
    note: '本站为个人爱好站点，与 Crypton Future Media 无关；初音未来及相关角色版权归其所有者。'
  }
}
