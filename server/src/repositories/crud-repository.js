
class crudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const res = await this.model.create(data);
    return res;
  }

  async findByEmail(email) {
    const res = await this.model.findOne({
      where: {
        email: email
      }
    })
    return res;
  }

  async getAll(){
    // console.log("object")
    const res=await this.model.findAll({
      where:{
        role:"STORE_OWNER"
      }
    });
    console.log(res)
    return res;
  }

  async get(id){
    const res=await this.model.findOne(
      {
        where:{
          id:id
        }
      }
    )
    return res;
  }

  async destroy(id) {
    const res = await this.model.destroy({
      where: {
        id: id
      }
    })
  }

  async update(data) {
    const res=await this.model.update(data,{
      where:{
        email:data.email
      }
    });
    return res;
  }
}

module.exports = crudRepository;