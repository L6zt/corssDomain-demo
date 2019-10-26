const Koa = require('koa');
// 路由
const Router = require('koa-router');
// 
const path = require('path');
//提供静态文件服务
const koaStaticServer = require('koa-static-server');
// 打开浏览器
const opn = require('better-opn');
// 服务器 1
const wwwLocalhostComServer = new Koa();
// 服务器 2
const mLocalhostComServer = new Koa();

// 跨域路由
const wwwCorsRouter = new Router({
  prefix: '/cors'
});
// 非跨域路由
const wwwNotCorsRouter = new Router({
  prefix: '/nm'
});
// jsonp 请求
const wwwJsonpRouter = new Router({
  prefix: '/jsonp'
});
// 跨域接口

wwwCorsRouter.use('/', (ctx, next) => {
  const {request} = ctx;
  const {header: { origin }, method} = request;
  ctx.response.set('Access-Control-Allow-Origin', origin);
  next();
}).post('/setCookie', (ctx, next) => {
  const result = {
    flag: 1,
    data: {
      message: 'we set cookie in different domain',
    }
  };
  ctx.response.set('Access-Control-Allow-Credentials', 'true');
  ctx.response.set('Set-Cookie', `auth=love; Expries=${new Date(Date.now() + 60 * 60 * 24 * 10 * 1000)}; Path=/`);
  ctx.cookies.set('inject', 'love', {
    expires: new Date(Date.now() + 60 * 60 * 24 * 10 * 1000), 
  });
  ctx.response.set('Content-type', 'application/json');
  ctx.body = JSON.stringify(result);

}).post('/normalData', (ctx, next) => {
   const result = {
     flag: 1,
     data: {
       message: 'we like each other'
     }
   }
   ctx.response.set('Content-type', 'application/json');
   ctx.body = JSON.stringify(result);
});

// 非跨域接口

wwwNotCorsRouter.use('/', (ctx, next) => {
  ctx.response.set('Custom-Server-Sp', 'love');
  next();
}).post('/data', (ctx, next) => {
  const result = {
    flag: 1,
    data: {
      message: 'we are not in the same domain',
    }
  };
  ctx.response.set('Content-type', 'application/json');
  ctx.body = JSON.stringify(result);
});

//  jsonp 接口
wwwJsonpRouter.get('/data', (ctx, next) => {
  const {request} = ctx;
  const {header: { origin }, method, query} = request;
  const {callback} = query;
  if (!callback) {
    ctx.body = JSON.stringify({
      flag: 0,
      message: '参数校验失败',
    })
    return 
  } else {
    // 相当与返回 js文件
    // 文本内容 js文件
    ctx.response.set('Content-type', 'application/javascript');
    ctx.body = [
       `${callback}(`,
       JSON.stringify({flag: 0, data: {payload: {key: 'love'}}}),
       ')'
    ].join('');
  }
})
wwwLocalhostComServer.use((ctx, next) => {
  const {request} = ctx;
  const {header:{ origin , path}, method} = request;
  // 对某些特殊 cors 做处理 详情 mdn 文档
  if (method === 'OPTIONS') {
   ctx.response.set('Access-Control-Allow-Origin', origin);
   ctx.response.set('Access-Control-Request-Method' , 'POST');
   ctx.response.set('Access-Control-Allow-Headers', 'Content-Type');
   ctx.response.set('Access-Control-Allow-Credentials', true);
   ctx.body = ''
  } else {
    next();
  }
});
wwwLocalhostComServer.use(wwwCorsRouter.routes());
wwwLocalhostComServer.use(wwwNotCorsRouter.routes());
wwwLocalhostComServer.use(wwwJsonpRouter.routes());
mLocalhostComServer.use(koaStaticServer({
  rootDir: path.join(__dirname, './m.assert')
}));
wwwLocalhostComServer.use(koaStaticServer({
  rootDir: path.join(__dirname, './www.assert'),
}));
wwwLocalhostComServer.listen(7001, () => {
  console.log('*** -- ****');
  console.log('端口为 7001的接口启动了');
  console.log('*** --- ***');
});
mLocalhostComServer.listen(7002, () => {
  console.log('*** -- ****');
  console.log('端口为 7002的服务器启动了');
  console.log('*** --- ***');
  opn('http://localhost:7002');
});