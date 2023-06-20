const { faker } = require('@faker-js/faker')
const { expect, users, invalidUUID } = require('../../environments/config')

const account = users.artist
const userId = account.userId
const artistBrandId = account.artistBrandId
const gameId = '99a9f8cd-bbd4-4bb8-ae65-6e2bde1a9e3b'

const GamesApi = require('../../api/games')
const Games = new GamesApi(account)




describe('GAMES', async () => {

  let token


  before(async ()  => {
    token = await Games.getUserToken(account.email, account.password)
  })



  describe('GET', async () => {

    describe('GET /games - Fetch Games', async () => {

      it('Can fetch games', async () => {
        const response = await Games.get(`/games`)
        expect(response.status).to.equal(200, `Unable to fetch games`)

        const games = response.body
        expect(games).to.be.an('array')
        const game = games[0]
        if (game) {
          expect(game.id).to.be.a('string')
          expect(game.name).to.be.a('string')
          expect(game.description).to.be.a('string')
          expect(game).to.have.property('artistBrandId')
          expect(game.gameType).to.be.a('string')
          expect(game).to.have.property('misc')
          expect(game.isActive).to.be.a('boolean')
        }
      })

    })



    describe('GET /games/{{artistBrandId}} - Fetch Games By Creator Brand ID', async () => {

      it('Can fetch games, given a valid creator brand ID', async () => {
        const response = await Games.get(`/games/${artistBrandId}`)
        expect(response.status).to.equal(200, `Unable to fetch games`)

        const games = response.body
        expect(games).to.be.an('array')
        const game = games[0]
        if (game) {
          expect(game.id).to.be.a('string')
          expect(game.name).to.be.a('string')
          expect(game.description).to.be.a('string')
          expect(game.artistBrandId).to.be.a('string')
          expect(game.gameType).to.be.a('string')
          expect(game.isActive).to.be.a('boolean')
        }
      })

      it('Should not respond with status 200 for an invalid creator brand ID', async () => {
        const response = await Games.get(`/games/${invalidUUID}`)
        expect(response.status).to.not.equal(200)
        expect(response.body.error).to.not.be.undefined
      })

    })



    describe('GET /games/{{gameId}}/leaderboard?frequency={{frequency}} - Fetch Game Leaderboard', async () => {

      it('Can fetch game leaderboard, given a valid game ID', async () => {
        const response = await Games.get(`/games/${gameId}/leaderboard?frequency=1`)
        expect(response.status).to.equal(200, `Unable to fetch game leaderboard`)

        const games = response.body
        expect(games).to.be.an('array')
      })

      it('Cannot fetch game leaderboard if frequency is not provided', async () => {
        const response = await Games.get(`/games/${gameId}/leaderboard`)
        expect(response.status).to.not.equal(200)
        expect(response.body.error).to.not.be.undefined
      })

    })

  })





  describe('POST', async () => {

    describe('POST /games - Create Game', async () => {

      it('Can create a game, given a valid creator brand ID', async () => {
        const payload = {
          artistBrandId,
          name: faker.lorem.words(),
          description: faker.lorem.sentence(),
          gameType: faker.lorem.word(),
          isActive: false
        }
        const response = await Games.post(`/games`, payload)
        expect(response.status).to.equal(200, `Unable to create a game`)

        const game = response.body
        expect(game.id).to.be.a('string')
        expect(game.name).to.equal(payload.name)
        expect(game.description).to.equal(payload.description)
        expect(game.artistBrandId).to.equal(artistBrandId)
        expect(game.gameType).to.equal(payload.gameType)
        expect(game.isActive).to.equal(payload.isActive)
        expect(game.misc.duration).to.be.undefined
      })

      it('Cannot create a game, if no game information provided', async () => {
        const payload = {}
        const response = await Games.post(`/games`, payload)
        expect(response.status).to.not.equal(200)
        expect(response.body.error).to.not.be.undefined
      })

      it('Cannot create a game for an invalid creator brand ID', async () => {
        const payload = { invalidUUID }
        const response = await Games.post(`/games`, payload)
        expect(response.status).to.not.equal(200)
        expect(response.body.error).to.not.be.undefined
      })

      it('Cannot create a game for an invalid isActive value', async () => {
        const payload = {
          artistBrandId,
          name: faker.lorem.words(),
          description: faker.lorem.sentence(),
          gameType: faker.lorem.word(),
          isActive: 'hello'
        }
        const response = await Games.post(`/games`, payload)
        expect(response.status).to.not.equal(200)
        expect(response.body.error).to.not.be.undefined
      })

    })



    describe('POST /games/{{gameId}}/gamescore - Set Game Score', async () => {

      it('Can set game score, given valid game ID', async () => {
        const payload = {
          score: faker.datatype.number({ min: 0, max: 99 }),
          userId: userId,
          username: faker.name.firstName()
        }
        const response = await Games.post(`/games/${gameId}/gamescore`, payload)
        expect(response.status).to.equal(200, `Unable to set game score`)
      })

    })



    describe('POST /games/refresh/{{gameId}}/leaderboard - Refresh Game Leaderboard', async () => {

      it('Can refresh game leaderboard, given valid game ID', async () => {
        const payload = {}
        const response = await Games.post(`/games/refresh/${gameId}/leaderboard`, payload)
        expect(response.status).to.equal(200, `Unable to refresh game leaderboard`)
      })

    })

  })





  describe('PATCH', async () => {

    describe('PATCH /games/{{gameId}} - Update Game', async () => {

      it('Can update game, given a valid game ID', async () => {
        const payload = {
          artistBrandId,
          name: faker.lorem.words(),
          description: faker.lorem.sentence(),
          gameType: faker.lorem.word(),
          misc: { duration: faker.datatype.number({ min: 1, max: 3 }) },
          isActive: false
        }
        const response = await Games.patch(`/games/${gameId}`, payload)
        expect(response.status).to.equal(200, `Unable to update game`)

        const game = response.body
        expect(game.message).to.equal('Game Updated')
      })

      it('Cannot update game, if no game information provided', async () => {
        const payload = {}
        const response = await Games.patch(`/games/${gameId}`, payload)
        expect(response.status).to.not.equal(200)
        expect(response.body.error).to.not.be.undefined
      })

      it('Cannot update game for an invalid creator brand ID', async () => {
        const payload = { artistBrandId: invalidUUID }
        const response = await Games.patch(`/games/${gameId}`, payload)
        expect(response.status).to.not.equal(200)
        expect(response.body.error).to.not.be.undefined
      })

      it('Cannot update game for an invalid isActive value', async () => {
        const payload = {
          artistBrandId,
          name: faker.lorem.words(),
          description: faker.lorem.sentence(),
          gameType: faker.lorem.word(),
          misc: { duration: faker.datatype.number({ min: 1, max: 3 }) },
          isActive: 'hello'
        }
        const response = await Games.patch(`/games/${gameId}`, payload)
        expect(response.status).to.not.equal(200)
        expect(response.body.error).to.not.be.undefined
      })

    })

  })





  describe('DELETE', async () => {

    describe('DELETE /games/{{gameId}} - Delete Game', async () => {

      it('Can delete game, given a valid game ID', async () => {
        // Create Game
        const payload = {
          artistBrandId,
          name: faker.lorem.words(),
          description: faker.lorem.sentence(),
          gameType: faker.lorem.word(),
          isActive: false
        }
        const gameId = (await Games.post(`/games`, payload)).body.id
        expect(gameId).to.be.a('string')

        // Delete Game
        const response = await Games.delete(`/games/${gameId}`)
        expect(response.status).to.equal(200, `Unable to delete game`)
      })

    })

  })


})
