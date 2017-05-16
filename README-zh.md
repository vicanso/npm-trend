# npm-trend

从我开始接触`node.js`以来，最开始选择`module`都是通过别人推荐的文章或者去`github`中的`trending`中刚好发现好用的模块。对于`npmjs.org`仅能说一直只当它来查询一下模块有没有更新，它的`Most depended-upon packages`已经翻过不少次，但是一直前面的模块都是已经了解过的，一直没有想到好的方式来筛选一下`module`，自己无聊的时候不知道怎么打发，所以决定自己将`npmjs.org`的模块同步，自己做个筛选的网站。

### 排序

在`npmjs.org`中，由于一些模块的够简单，通用，一直以来都是热门模块，但是这些模块都是大家耳熟能详，`express`从我开始使用`node.js 0.8`的时候已经是大家使用较多的`web framework`，现在还是很火。诸如此类的模块，都是在一直排在前面，想自己慢慢去浏览发现新的模块还真的是很吃力。因此更多的排序，更多的筛选，则是我所希望的。

- 按下载排行（最新、7天、30天、90天）
- 按`depended`的量排行（npmjs的api没有提供每天新增的depended量）
- 按最新版本更新时间排序、筛选最近（1天、7天、30天、90天、180天、360天）更新的模块
- 按模块创建时间排序、筛选最近（1天、7天、30天、90天、180天、360天）

通过组合查询，我就可以得到一些热度的模块。

- 最近3个月内有更新，按下载排行（主要避免一些模块几年不更新，但是下载量很高）

![](screen-shoot/updated-90d-donwloads-latest.jpeg)

- 最近3个月内创建，按下载排行（查找一些较新的模块，但感觉有些模块有虚假下载量）

![](screen-shoot/created-90d-donwloads-latest.jpeg)

- 模块比较(lodash vs undersocre)

![](screen-shoot/lodash-underscore.jpeg)

- 关注模块（在该模块有更新时能及时得知）

![](screen-shoot/stars.jpeg)

后续我会继续收集各类的数据，提供更多的筛选方式给大家使用

注：每个模块的分数来自`npms.io`

## Docker

docker build -t vicanso/npm-trend .

## License

MIT
