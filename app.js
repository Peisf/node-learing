const Koa = require('koa');
const Koa_logger = require('koa-logger');   //日志
const bodyParser = require('koa-bodyparser');   //解决post请求
const controller = require('./controller');
const Moment = require('moment');
const rest = require('./rest');

const app = new Koa();
const logger = Koa_logger((str) => {                // 使用日志中间件
    console.log(Moment().format('YYYY-MM-DD HH:mm:ss')+str);
});
const isProduction = process.env.NODE_ENV === 'production';

app.use(logger);
// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    var
        start = new Date().getTime(),
        execTime;
    await next();
    execTime = new Date().getTime() - start;
    ctx.response.set('X-Response-Time', `${execTime}ms`);
});

app.use(async (ctx,next) => {
    await ctx.set('Access-Control-Allow-Origin','*');    //允许通过所有的
    await next();
});
// static file support:
let staticFiles = require('./static-files');
app.use(staticFiles('/static/', __dirname + '/static'));

// parse request body:
app.use(bodyParser());

// bind .rest() for ctx:
app.use(rest.restify());

// add controllers:
app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');
