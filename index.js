const express = require('express');
const http = require('http');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require("path");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

// lendo os usuários do arquivo dados.json
// usando readfilesync pra garantir q os dados estejam carregados
let rawdata = fs.readFileSync('dados.json');
let usuarios = JSON.parse(rawdata);

const app = express();
const server = http.createServer(app);

const umDia = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: "aminhachavesecretaehessaksdjfljkghl778",
    saveUninitialized:true,
    cookie: { maxAge: umDia },
    resave: false
}));

app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

var session;


app.get('/', function (req,res) {
    session=req.session
    if(session.userid) {
        res.sendFile(path.join(__dirname,'./public/usuario.html'));
    }
    else {
        res.sendFile(path.join(__dirname,'./public/index.html'));
    }
    app.use(express.static(path.join(__dirname,'./public')));
});

app.get('/logout',(req,res) => {
    console.log(req.session)
    req.session.destroy();
    res.redirect('/');
});

app.post('/cadastro', async (req, res) => {

    try{
        let foundUser = usuarios.find((data) => req.body.email === data.email);
        if (!foundUser) {
    
            let hashPassword = await bcrypt.hash(req.body.password, 10);
    
            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                cep: req.body.cep,
                endereco: req.body.endereco,
                numero: req.body.numero,
                complemento: req.body.complemento,
                uf: req.body.uf,
                cidade: req.body.cidade,
                telefone: req.body.telefone,
                password: hashPassword,
            };
            usuarios.push(newUser)
            
            // gravando o novo usuário no json de dados
            let usuariosJson = JSON.stringify(usuarios, null, 2)
            fs.writeFileSync('dados.json', usuariosJson)
    
            res.send("<div align ='center'><h2>Cadastro efetuado.</h2></div><br><br><div align='center'><a href='./'>Entrar</a></div><br><br><div align='center'><a href='./cadastro.html'>Cadastrar outro usuário</a></div>");
        } else {
            res.send("<div align ='center'><h2>Email já cadastrado.</h2></div><br><br><div align='center'><a href='./cadastro.html'>Cadastrar novamente.</a></div>");
        }
    } catch{
        res.send("Erro Interno do servidor");
    }
});

app.post('/usuario', async (req, res) => {
    try{
        let foundUser = usuarios.find((data) => req.body.email === data.email);
        if (foundUser) {
    
            let submittedPass = req.body.password; 
            let storedPass = foundUser.password; 
    
            const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
            if (passwordMatch) {
                session=req.session;
                let usrname = foundUser.username;
                session.userid = foundUser.username;
                console.log(req.session)
                res.send(`<div align ='center'><h2><a href='./'>login efetuado.</a></h2></div><br><br><div align ='center'><h3>Olá ${usrname}</h3></div>`);
            } else {
                res.send("<div align ='center'><h2>Email ou senha inválido.</h2></div><br><br><div align ='center'><a href='./'>tentar novamente</a></div>");
            }
        }
        else {
            // senha falsa que gasta tempo de processamento de propósito
            // pro usuário não saber se o erro foi no email ou senha
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);
    
            res.send("<div align ='center'><h2>Email ou senha inválido.</h2></div><br><br><div align='center'><a href='./'>tentar novamente<a><div>");
        }
    } catch{
        res.send("Erro Interno do servidor");
    }
});


server.listen(3000, function(){
    console.log("servidor ouvindo na porta: 3000");
});