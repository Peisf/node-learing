const uuid = require('node-uuid');
const APIError = require('../rest').APIError;
const model = require('../model');
let
    Pet = model.Pet,
    User = model.User;

function nextId() {
    return uuid.v4();
}

var queryAll = async () => {
    var user = await User.findAll({});
    console.log(`find ${user} user`)
    return user
}
//条件查询删除
var queryFromSomewhere = async (animals) => {
    var pets = await User.findAll({
        where: {
            id: animals
        }
    });
    console.log(`find ${pets.length} pets`);
    return pets
}

module.exports = {
    //查询
    'GET /api/todos': async (ctx, next) => {
        var arr = [];
        var pets = await queryAll();
        for (let p of pets) {
            arr.push(JSON.parse(JSON.stringify(p)))
        }
        console.log('arr',arr)
        ctx.rest({
            code:200,
            todos: arr,
            message:'查询成功'
        });
    },
    //新增
    'POST /api/todos': async (ctx, next) => {
        var
            t = ctx.request.body,
            todo;
        if (!t.name || !t.name.trim()) {
            throw new APIError('invalid_input', 'Missing name');
        }
        if (!t.passwd || !t.passwd.trim()) {
            throw new APIError('invalid_input', 'Missing passwd');
        }
        todo = {
            id: nextId(),
            name: t.name.trim(),
            passwd: t.passwd.trim(),
            email: t.email.trim()+'-'+Date.now()+'@password',
            gender: t.gender?true:false,
            birth: t.birth,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
            version: '0',
        };
        var dog = await User.create(todo);
        console.log('created: ' + JSON.stringify(dog));
        var arr = [];
        var pets = await queryAll();
        for (let p of pets) {
            arr.push(JSON.parse(JSON.stringify(p)))
        }
        ctx.rest({
            code:200,
            todo:todo,
            message:'添加成功'
        });
    },
    //修改
    'PUT /api/todos/:id': async (ctx, next) => {
        var t = ctx.request.body;
        if (!t.name || !t.name.trim()) {
            throw new APIError('invalid_input', 'Missing name');
        }
        if (!t.email || !t.email.trim()) {
            throw new APIError('invalid_input', 'Missing description');
        }
        var pets = await queryFromSomewhere(ctx.params.id);
        for (let p of pets) {
            p.name = t.name.trim();
            p.email = t.email.trim();
            p.gender = true;
            p.updatedAt = Date.now();
            p.version++;
            await p.save();
        }
        ctx.rest({
            code: 200,
            todo: pets[0],
            message: '更新成功'
        });
        // ctx.rest();
    },

    'DELETE /api/todos/:id': async (ctx, next) => {
        var pets = await queryFromSomewhere(ctx.params.id);
        console.log(pets.length)
        if(pets.length === 0) {
            throw new APIError('notfound', 'Todo not found by id: ' + ctx.params.id);
            return;
        }
        for (let p of pets) {
            await p.destroy()
        }
        var arr = [];
        var pets = await queryAll();
        for (let p of pets) {
            arr.push(JSON.parse(JSON.stringify(p)))
        }
        ctx.rest({
            code:200,
            todo: arr,
            message: '删除成功'
        });
    }
}
