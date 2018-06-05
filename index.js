const lodash = require('lodash');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const app = new Koa();
app.use(bodyParser());
const fs = require('fs');
const router = new Router();

const userDB = (() => {
  try {
    return JSON.parse(fs.readFileSync('user.json', 'utf-8'));
  } catch (e) {
    return { "data": [], "count": 0 };
  }
})();

const syncDB = () => fs.writeFileSync('user.json', JSON.stringify(userDB), 'utf-8');

router
  .get('/user/:id', (ctx, next) => {
    const u = userDB.data.filter(i => i.id === parseInt(ctx.params.id));
    if (u.length) {
      ctx.body = u.pop();
    } else {
      ctx.throw(404, 'access_denied', '{"msg":"用户不存在！"}');
    }
  })
  .post('/user', (ctx, next) => {
    console.log(userDB);
    const { name = '', mobile = '', age = 0 } = ctx.request.body;
    if (name.trim() === '') {
      ctx.throw(400, 'access_denied', '{"msg":"无效用户！"}');
      return;
    }

    if (userDB.data.find(i => i.name === name)) {
      ctx.throw(400, 'access_denied', '{"msg":"用户已存在！"}');
      return;
    }
    userDB.count += 1;
    const obj = { name, mobile, age, id: userDB.count };
    userDB.data.push(obj);
    syncDB();
    ctx.body = obj;
  })
  .put('/user/:id', (ctx, next) => {
    const idx = userDB.data.findIndex(i => i.id === parseInt(ctx.params.id));
    const { mobile, age } = ctx.request.body;
    if (idx !== -1) {
      console.log({ mobile, age });
      const o = lodash.merge(userDB.data[idx], { mobile, age });
      userDB.data[idx] = o;
      ctx.body = o;
      syncDB();
    } else {
      ctx.throw(404, 'access_denied', '{"msg":"用户不存在！"}');
    }
  })
  .patch('/user/:id', (ctx, next) => {
    const idx = userDB.data.findIndex(i => i.id === parseInt(ctx.params.id));
    const { mobile, age } = ctx.request.body;
    if (idx !== -1) {
      console.log({ mobile, age });
      const o = lodash.merge(userDB.data[idx], { mobile, age });
      userDB.data[idx] = o;
      ctx.body = o;
      syncDB();
    } else {
      ctx.throw(404, 'access_denied', '{"msg":"用户不存在！"}');
    }
  })
  .del('/user/:id', (ctx, next) => {
    const idx = userDB.data.findIndex(i => i.id === parseInt(ctx.params.id));
    if (idx !== -1) {
      const dels = userDB.data.splice(idx, 1);
      ctx.body = dels;
      syncDB();
    } else {
      ctx.throw(404, 'access_denied', '{"msg":"用户不存在！"}');
    }
  })
  .get('/users', (ctx, next) => {
    ctx.body = userDB.data;
  });

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(7000);