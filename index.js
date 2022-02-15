const express = require('express');
const http = require('http');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require("path");
const bodyParser = require('body-parser');

// lendo os usuários do arquivo dados.json
// usando readfilesync pra garantir q os dados estejam carregados
let rawdata = fs.readFileSync('dados.json');
let usuarios = JSON.parse(rawdata);

const users = require('./data').userDB;

const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));

app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/index.html'));
});

app.post('/cadastro', async (req, res) => {
    try{
        let foundUser = users.find((data) => req.body.email === data.email);
        if (!foundUser) {
    
            let hashPassword = await bcrypt.hash(req.body.password, 10);
    
            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
            };
            users.push(newUser)
            usuarios.push(newUser)
            
            // gravando o novo usuário no json de dados
            let usuariosJson = JSON.stringify(usuarios, null, 2)
            fs.writeFileSync('dados.json', usuariosJson)
    
            res.send("<div align ='center'><h2>Cadastro efetuado.</h2></div><br><br><div align='center'><a href='./login.html'>login</a></div><br><br><div align='center'><a href='./cadastro.html'>Cadastrar outro usuário</a></div>");
        } else {
            res.send("<div align ='center'><h2>Email já cadastrado.</h2></div><br><br><div align='center'><a href='./cadastro.html'>Cadastrar novamente.</a></div>");
        }
    } catch{
        res.send("Erro Interno do servidor");
    }
});

app.post('/login', async (req, res) => {
    try{
        let foundUser = users.find((data) => req.body.email === data.email);
        if (foundUser) {
    
            let submittedPass = req.body.password; 
            let storedPass = foundUser.password; 
    
            const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
            if (passwordMatch) {
                let usrname = foundUser.username;
                res.send(`<div align ='center'><h2>login efetuado.</h2></div><br><br><br><div align ='center'><h3>Olá ${usrname}</h3></div><br><br><div align='center'><a href='./login.html'>logout</a></div>`);
            } else {
                res.send("<div align ='center'><h2>Email ou senha inválido.</h2></div><br><br><div align ='center'><a href='./login.html'>tentar novamente</a></div>");
            }
        }
        else {
            // senha falsa que gasta tempo de processamento de propósito
            // pro usuário não saber se o erro foi no email ou senha
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);
    
            res.send("<div align ='center'><h2>Email ou senha inválido.</h2></div><br><br><div align='center'><a href='./login.html'>tentar novamente<a><div>");
        }
    } catch{
        res.send("Erro Interno do servidor");
    }
});


server.listen(3000, function(){
    console.log("servidor ouvindo na porta: 3000");
});