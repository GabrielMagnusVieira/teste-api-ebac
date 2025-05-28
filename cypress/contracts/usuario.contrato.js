const Joi = require('joi')

export default Joi.object({
  quantidade: Joi.number().required(),
  usuarios: Joi.array().items(
    Joi.object({
      nome: Joi.string().required(),
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      password: Joi.string().required(),
      administrador: Joi.string().valid('true', 'false').required(),
      _id: Joi.string().required()
    })
  )
})
