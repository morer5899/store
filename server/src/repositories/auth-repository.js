const {user} = require("../models");
const crudRepository = require("./crud-repository");

class AuthRepository extends crudRepository{
  constructor(){
    super(user);
  }

}

module.exports=AuthRepository;