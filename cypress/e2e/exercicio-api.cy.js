/// <reference types="cypress" />
import contrato from '../contracts/usuario.contrato'

describe('Testes da Funcionalidade Usuários', () => {
  let token 

  beforeEach(() => {
    cy.token('fulano@qa.com', 'teste').then(tkn => {
      token = tkn // <- token armazenado para uso nos testes
    })
  })

 it('Deve validar contrato de usuários', () => {
  cy.request('usuarios').then((response) => {
    contrato.validateAsync(response.body)
  })
})

  it('Deve listar usuários cadastrados', () => {
  cy.request({
    method: 'GET',
    url: 'usuarios'
  }).should((response) => {
    expect(response.status).to.eq(200)
    expect(response.body).to.have.property('usuarios')
    expect(response.body.usuarios).to.be.an('array')

    if (response.body.usuarios.length > 0) {
      expect(response.body.usuarios[0]).to.have.all.keys(
        'nome',
        'email',
        'password',
        'administrador',
        '_id'
      )
    }
  })
})

 it('Deve cadastrar um usuário com sucesso', () => {
  const emailUnico = `usuario_${Date.now()}@teste.com`

  cy.cadastrarUsuario(token, 'Usuário Teste', emailUnico, '123456')
    .should(response => {
      expect(response.status).to.eq(201)
      expect(response.body.message).to.eq('Cadastro realizado com sucesso')
      expect(response.body).to.have.property('_id')
    })
})

it('Deve validar um usuário com email inválido', () => {
  const emailInvalido = 'usuario_invalido.com' // formato inválido

  cy.cadastrarUsuario(token, 'Usuário Inválido', emailInvalido, '123456')
    .should(response => {
      expect(response.status).to.eq(400) // ou 422, dependendo da API
      expect(response.body).to.have.property('message')
      expect(response.body.message.toLowerCase()).to.include('email')
    })
})//

it('Deve editar um usuário previamente cadastrado', () => {
  const emailInicial = `usuario_${Date.now()}@teste.com`
  const nomeEditado = 'Usuário Editado'
  const senha = '123456'

  cy.cadastrarUsuario(token, 'Usuário Original', emailInicial, senha)
    .then((responseCadastro) => {
      expect(responseCadastro.status).to.eq(201)
      const idUsuario = responseCadastro.body._id

      cy.request({
        method: 'PUT', // ou PATCH
        url: `usuarios/${idUsuario}`,
        headers: { Authorization: token },
        body: {
          nome: nomeEditado,
          email: emailInicial,
          password: senha,
          administrador: 'true'
        }
      }).then((responseEdicao) => {
        expect(responseEdicao.status).to.eq(200)
        expect(responseEdicao.body).to.have.property('message', 'Registro alterado com sucesso')
        // não precisa verificar o nome aqui
      })
    })
})

 it('Deve deletar um usuário previamente cadastrado', () => {
  const emailUnico = `usuario_${Date.now()}@teste.com`
  const nome = 'Usuário Para Deletar'
  const senha = '123456'

  // 1. Cadastrar usuário
  cy.cadastrarUsuario(token, nome, emailUnico, senha).then((responseCadastro) => {
    expect(responseCadastro.status).to.eq(201)
    const idUsuario = responseCadastro.body._id

    // 2. Deletar o usuário cadastrado
    cy.request({
      method: 'DELETE',
      url: `usuarios/${idUsuario}`,
      headers: {
        Authorization: token
      }
    }).then((responseDelete) => {
      expect(responseDelete.status).to.eq(200)
      expect(responseDelete.body.message).to.eq('Registro excluído com sucesso')
    })
  })
})

});
