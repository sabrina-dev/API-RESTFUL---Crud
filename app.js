require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const routes = require('./src/routes/main.routes');

const app = express();

// models
const User = require("./models/User");

// Config JSON response
app.use(express.json());
app.use('/', routes);

// Open Route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a API!" });
});

app.post("/auth/register", async (req, res) => {
  const { user_type, name, age, email, password, confirmpassword } = req.body;

  // validations
  if (!name) {
    return res.status(422).json({ msg: "O oiii é obrigatório!" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  if (password != confirmpassword) {
    return res.status(422).json({ msg: "As senhas não confere!" });
  }
  if (!age) {
    return res.status(422).json({ msg: "Idade é obrigatória!" });
  }

  const perfis = ["ADMIN", "CLIENTE"];
  const userTypeUp = user_type.toUpperCase();

  if (!perfis.includes(userTypeUp)) {
    return res.status(422).json({ msg: "Informe seu tipo de usuário: admin ou cliente " });
  }

  // check if user exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
  }

  // create password
  const salt = await bcrypt.genSalt(12);
  let myUser = new Object();
  myUser.user_type = user_type;
  myUser.name = name;
  myUser.email = email;
  myUser.password = await bcrypt.hash(password, salt);
  myUser.age = age;

  const user = new User(myUser);

  try {
    // create user
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // validations
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  // check if user exists
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  // check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida" });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign({
      id: user._id
    }, secret);

    res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose.connect(`mongodb+srv://${ dbUser }:${ dbPassword }@cluster0.benwqbe.mongodb.net/?retryWrites=true&w=majority`).then(() => {
  console.log("Conectou ao banco!");
  app.listen(3000);
}).catch(err => console.log(err));