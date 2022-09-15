const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require('../../models/User')

// Private Routes

  //list registers
  router.get('/user/', checkToken, async (req, res)=> {
    try{
      const users = await User.find({});
      res.json({error: false, users });
    }catch(err){
      res.json({error: true, message: err.message });
    }
  });

  // atualizar usuario
  router.put('/user/:id', checkToken, async (req,res)=> {
    try{
      const id = req.params.id;
      const UserUpdate = req.body;

      const users = await User.findByIdAndUpdate(id, UserUpdate);
    res.json({error: false, users })

    }catch(err){
      res.json({mensagem: 'atualizar usuário'});
    }
  });

  //deletar usuario
  router.delete('/user/:id', checkToken, async (req,res)=>{
    try{
      const id = req.params.id;
      await User.findByIdAndDelete(id);
      res.json({error: false})

    }catch(err){
      res.json({error: true, message: err.message });
    }
  })

  // informações do user
  router.get("/user/:id", checkToken, async (req, res) => {
    const id = req.params.id;

    // check if user exists
    const user = await User.findById(id, "-password");

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    res.status(200).json({ user });
  });

  function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "Acesso negado!" });

    try {
      const secret = process.env.SECRET;

      jwt.verify(token, secret);

      next();
    } catch (err) {
      res.status(400).json({ msg: "O Token é inválido!" });
    }
  }

module.exports = router;