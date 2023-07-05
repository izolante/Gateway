require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
const http = require('http');
const express = require('express');
//const { Headers } = require('node-fetch');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', verificacao, (req, res, next) => {
    res.json({ message: "Pagina inicial do gateway" });
})

app.get('/teste', verificacao, (req, res, next) => {
    console.log("retorna");
    res.json([{ id: 1, nome: 'testando' }]);
})

app.post('/login', (req, res, next) => {
    console.log(JSON.stringify(req.body))
    if (req.body.usuario === 'admin' && req.body.senha === '123123') {
        ///passou na auth
        const id = 1;
        const token = jwt.sign({ id }, process.env.SECRET, {
            //expiresIn: 1800 ///30 min
            expiresIn: 36000 ///10 hrs
        });
        return res.json({ auth: true, token: token });
    }

    res.status(500).json({ message: 'login inválido' });
})

app.get('/logout', function (req, res) {
    res.json({ auth: false, token: null });
})

///lista todos os livros
app.get('/livros', verificacao, (req, res, next) => {

    console.log(JSON.stringify(req.body))
    //console.log(res.json({requestBody: req.body}))
    fetch('http://localhost:8080/api/livros', {
        method: "GET",
        //body: JSON.stringify(req.body),
        headers: {
            "token": "tokenGateway"
        }
    }).then(response => response.json())
        .then(json => res.json(json))
})

///lista todos os livros emprestados
app.get('/livros/emprestados', verificacao, (req, res, next) => {

    console.log(JSON.stringify(req.body))
    //console.log(res.json({requestBody: req.body}))
    fetch('http://localhost:8080/api/livros/emprestado', {
        method: "GET",
        //body: JSON.stringify(req.body),
        headers: {
            "token": "tokenGateway"
        }
    }).then(response => response.json())
        .then(json => res.json(json))
})

///pega livro pela id
app.get('/livros/:id', verificacao, (req, res, next) => {
    //const id = req.body
    //res.send('id: ' + req.params.id);
    console.log(JSON.stringify(req.body))
    //console.log(res.json({requestBody: req.body}))
    fetch('http://localhost:8080/api/livros/' + req.params.id, {
        method: "GET",
        //body: JSON.stringify(req.body),
        headers: {
            "token": "tokenGateway"
        }
    }).then(response => response.json())
        .then(json => res.json(json))
})

///adiciona um novo livro
app.post('/livros/', verificacao, (req, res, next) => {

    console.log(JSON.stringify(req.body))
    fetch('http://localhost:8080/api/livros/', {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: {
            "token": "tokenGateway",
            "Content-Type": "application/json"
        },
    }).then(response => response.json())
        .then(json => res.json(json))
})

///atualiza um livro pela id
app.put('/livros/:id', verificacao, (req, res, next) => {

    console.log(JSON.stringify(req.body))
    fetch('http://localhost:8080/api/livros/' + req.params.id, {
        method: "PUT",
        body: JSON.stringify(req.body),
        headers: {
            "token": "tokenGateway",
            "Content-Type": "application/json"
        },
    }).then(response => response.json())
        .then(json => res.json(json))
})

///deleta um livro pela id
app.delete('/livros/:id', verificacao, (req, res, next) => {

    console.log(JSON.stringify(req.body))
    fetch('http://localhost:8080/api/livros/' + req.params.id, {
        method: "DELETE",
        //body: JSON.stringify(req.body),
        headers: { "token": "tokenGateway" },
    }).then(response => response.json())
        .then(json => res.json(json))
})

///deleta todos os livros
app.delete('/livros/', verificacao, (req, res, next) => {

    console.log(JSON.stringify(req.body))
    fetch('http://localhost:8080/api/livros/', {
        method: "DELETE",
        //body: JSON.stringify(req.body),
        headers: { "token": "tokenGateway" },
    }).then(response => response.json())
        .then(json => res.json(json))
})

///pega os livros - graphQL
app.post('/testegraph', (req, res, next) => {
    fetch('http://localhost:4000/graphql', {
        method: 'POST',

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            query: `{
      livros {
        titulo
        autor
        descricao
      }
    }`
        })
    }).then(response => response.json())
        .then(json => res.json(json))
})


app.post('/testegraph2', (req, res, next) => {
    fetch('http://localhost:4000/graphql', {
        method: 'POST',

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            query: req.body.query})
    }).then(response => response.json())
        .then(json => res.json(json))
})
///pega os livros - graphQL
app.post('/testegraph/titulo', (req, res, next) => {
    fetch('http://localhost:4000/graphql', {
        method: 'POST',

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            query: `{
      livros {
        titulo
      }
    }`
        })
    }).then(response => response.json())
        .then(json => res.json(json))
})

///pega os livros - graphQL
app.post('/testegraph/autor', (req, res, next) => {
    fetch('http://localhost:4000/graphql', {
        method: 'POST',

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            query: `{
      livros {
        autor
      }
    }`
        })
    }).then(response => response.json())
        .then(json => res.json(json))
})

app.post('/rick', (req, res, next) => {
    fetch('https://rickandmortyapi.com/graphql', {
        method: 'POST',

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            query: `{
      characters {
        results {
          name
        }
      }
    }`
        })
    }).then(response => response.json())
        .then(json => res.json(json))
})


function verificacao(req, res, next) {
    const token = req.headers['x-access-token'];
    ///nao encontrou x-access-token no header ///401 Unauthorized
    if (!token) return res.status(401).json({ auth: false, message: "Nenhum token foi enviado" });
                                            ///500 Internal Server Error
    jwt.verify(token, process.env.SECRET, function (err, decoded) { ///verificou com a SECRET, mas falhou
        if (err) return res.status(500).json({ auth: false, message: 'Falha ao autenticar o token' });

        req.userId = decoded.id;
        next();
    });
}

const server = http.createServer(app);
server.listen(3000);
console.log("Servidor rodando na porta 3000...")