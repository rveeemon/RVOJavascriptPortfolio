const { expect, users, invalidUUID } = require('../../environments/config')
const { throwUndefinedError, isValid } = require('../../utils/helpers')

const account = users.artist
const eventId = account.eventId
var artistBrandId = '4e8a6084-5775-4994-b179-71837fbe615f'
//const worldId = 'd882ccf8-085e-4a19-9905-fa1437fdaa3a'
const domain = 's1'
const userId = account.userId


const ChallengesApi = require('../../api/challenges')
//const ArtistBrands = new ArtistBrandsApi(account)
const Challenges = new ChallengesApi(account)
const WorldsApi = require('../../api/worlds')
const { faker } = require('@faker-js/faker')
//const { expectTypes } = require('chai/lib/chai/utils')
const Worlds = new WorldsApi(account)

describe('CHALLENGES', async () => {

    let token
    let worldId

    before(async ()  => {
        token = await Worlds.getUserToken(account.email, account.password)
        const worldList = (await Worlds.get(`/worlds/backstage`, token)).body
        const worlds = worldList.worlds
        const world = worlds.find((world) => world.domain.includes(domain))
        let domains = []
        worlds.forEach((world) => {
          const domain = world.domain
          domains.push(domain)
        })
        worldId = world.id
      })

    describe('GET', async() => {


      describe('GET /challenges - Get All Challenges', async () => {

        it('Can fetch all the challenges of the all Worlds', async () => {
          const response = await Challenges.get(`/challenges`, token)
          expect(response.status).to.equal(200, "Unable to get the World Challenges.")

          expect(response.body).to.be.an('array')
           //Check if there is list
           const challengeList = response.body
           if(challengeList.length > 0){
             const challengeItems = challengeList[0]
             expect(challengeItems).to.have.property('id')
             expect(challengeItems).to.have.property('worldId')
           }

        })

        it('Cannot fetch all challenges when unauthorized', async() => {
          const response = await Challenges.get(`/challenges`)
          expect(response.status).to.not.equal(200)
          console.log(response.body)
        })

      })

      describe('GET /challenges/rewards', async () => {

        it('Can get all rewards', async () => {
          const response = await Challenges.get(`/challenges/rewards`, token)
          expect(response.status).to.equal(200, "Unable to get list of rewards")
        })

        it('Cannot fetch rewards when user is unauthenticated', async () => {
          const response = await Challenges.get(`/challenges/rewards`)
          expect(response.status).to.not.equal(200, "User is able to get list of rewards")
        })

      })
      
      describe('GET /challenges/world/{{worldId}} - Get All the Challenges of a World', async () => {

        it('Can fetch all the challenges of the World', async () =>{
          const response = await Challenges.get(`/challenges/world/${worldId}`, token)
          expect(response.status).to.equal(200, "Unable to get the World Challenges.")

          expect(response.body).to.be.an('array')
           //Check if there is list
           const challengeList = response.body
           if(challengeList.length > 0){
             const challengeItems = challengeList[0]
             expect(challengeItems).to.have.property('id')
             expect(challengeItems).to.have.property('worldId')
           }

        })

        it('Should not respond with status 200 if unauthenticated', async () => {
          const response = await Challenges.get(`/challenges/world/${worldId}`)
          expect(response.status).to.not.equal(200, 'Able to get challenges even if unauthenticated.')
        })

        it('Should not be able to fetch challenges of a world if invalid World ID', async () => {
          const response = await Challenges.get(`/challenges/world/${invalidUUID}`, token)
          expect(response.status).to.not.equal(200, 'Able to get challenges even if invalid World ID was given.')
        })

        it('Should respond 404 when worldId is missing', async () => {
          const response = await Challenges.get(`/challenges/world/`)
          expect(response.status).to.not.equal(200, "Able to get world challenges info.")
        })

      })

     
      describe('GET /challenges/rewards/artistBrand/:artistBrandId - Get all the Rewards from an Artist Brand', async() => {

        it('Can get all Reward from an artist Brand', async() => {
          const response = await Challenges.get(`/challenges/rewards/artistBrand/${artistBrandId}`, token)
          expect(response.status).to.equal(200, "Unable to get the Artist Rewards.")

          expect(response.body).to.be.an('array')
          const rewardList = response.body
          if(rewardList.length > 0){
            const rewardItems = rewardList[0]
            expect(rewardItems).to.have.property('rewardType')
            expect(rewardItems).to.have.property('misc')
            expect(rewardItems).to.have.property('artistBrandId')
          }

        })

        it('Cannot fetch reward list of an Artist if not provided an Artist Brand ID', async() => {
          artistBrandId = null
          const response = await Challenges.get(`/challenges/rewards/artistBrand/}`, token)
          expect(response.status).to.not.equal(200, "Able to get world challenges info.")
        })

        it('Cannot fetch reward list of an Artist if unauthenticated', async() => {
          const response = await Challenges.get(`/challenges/rewards/artistBrand/${artistBrandId}`)
          expect(response.status).to.not.equal(200, "Able to get world challenges info.")
        })

      })

      describe('GET /challenges/:challengeId/complete/0 - Complete Challenge', async () => {

        it('Should be able to complete Challenge', async () => {
          let challengeId = `215c3ede-146c-4ee6-84a7-50675c17520a`
          const response = await Challenges.get(`/challenges/${challengeId}/complete/0`, token)

          expect(response.status).to.equal(200, "Unable to complete the challenge.")

          const rewardsList = response.body
          if(rewardsList.length > 0){
            const challengeRewards = rewardsList[0]
            expect(challengeRewards).to.have.property('id')
            expect(challengeRewards).to.have.property('artistBrandId')
            expect(challengeRewards).to.have.property('rewardType')
            expect(challengeRewards).to.have.property('description')
          }
        })

        it('Should not be able to complete challenge if unauthenticated', async() => {
          let challengeId = `215c3ede-146c-4ee6-84a7-50675c17520a`
          const response = await Challenges.get(`/challenges/${challengeId}/complete/0`)

          expect(response.status).to.not.equal(200, "Able to complete the challenge even if unauthenticated.")

        })

      })

      describe('POST', async () => {

        describe('POST /challenges - Create new Challenge', async () => {

          it('Should be able to add a new Challenge', async () => {
            const chalTimestamp = Date.now()
            const payload = {
              name: faker.lorem.words() + ` ` + chalTimestamp,
              worldId: worldId,
              info:{ info:72 },
              isActive: false
            }
            const response = await Challenges.post(`/challenges`, payload,token)
            expect(response.status).to.equal(200, 'Unable to create new Challenge')
          })

          it('Cannot add a challenge when no challenge info provided', async () => {
            const payload = {}
            const response = await Challenges.post(`/challenges`, payload,token)
            expect(response.status).to.not.equal(200, 'Able to create new Challenge without challenge info.')
            expect(response.body.error).to.not.be.undefined
          })

          it('Cannot create a challenge when unauthenticated', async () => {
            const chalTimestamp = Date.now()
            const payload = {
              name: faker.lorem.words() + ` ` + chalTimestamp,
              worldId: worldId,
              info:{ info:72 },
              isActive: false
            }
            const response = await Challenges.post(`/challenges`, payload)
            expect(response.status).to.not.equal(200, 'Able to create new Challenge even when unauthenticated.')
          })

          it('Cannot create challenge when worldId is invalid', async() => {
            const chalTimestamp = Date.now()
            const payload = {
              name: faker.lorem.words() + ` ` + chalTimestamp,
              worldId: invalidUUID,
              info:{ info:72 },
              isActive: false
            }
            const response = await Challenges.post(`/challenges`, payload, token)
            expect(response.status).to.not.equal(200, 'Able to create new Challenge with invalid name.')
          })

        })

      })

      describe('POST /challenges/rewards - Add Rewards', async() => {

        it('Should be able to add Rewards', async() => {
          const rewTimeStamp = Date.now()
          const payload = {
            name: faker.lorem.words() + ' ' + rewTimeStamp,
            artistBrandId: artistBrandId,
            misc: "{\"url\":\"https://www.google.com/\",\"linkout\":\"\"}",
            rewardType: `digital_wearable`,
            description: faker.lorem.sentence()
          }
          const response = await Challenges.post(`/challenges/rewards`, payload,token)
          expect(response.status).to.equal(200, 'Unable to create new Rewards')
        })

        it('Cannot add a reward when unauthenticated', async() => {
          const rewTimeStamp = Date.now()
          const payload = {
            name: faker.lorem.words() + ' ' + rewTimeStamp,
            artistBrandId: artistBrandId,
            misc: "{\"url\":\"https://www.google.com/\",\"linkout\":\"\"}",
            rewardType: `digital_wearable`,
            description: faker.lorem.sentence()
          }
          const response = await Challenges.post(`/challenges/rewards`, payload)
          expect(response.status).to.not.equal(200, 'Able to create new Rewards even when unauthenticated')
        })

        it('Cannot add a reward when there is no reward info provided.', async() => {
          const payload = { }
          const response = await Challenges.post(`/challenges/rewards`, payload,token)
          expect(response.status).to.not.equal(200, 'Able to create new Rewards without any reward info.')
        })

        it('Cannot add a reward when artistBrandId is invalid', async() => {
        const rewTimeStamp = Date.now()
        const payload = {
          name: faker.lorem.words() + ' ' + rewTimeStamp,
          artistBrandId: invalidUUID,
          misc: "{\"url\":\"https://www.google.com/\",\"linkout\":\"\"}",
          rewardType: `digital_wearable`,
          description: faker.lorem.sentence()
        }
        const response = await Challenges.post(`/challenges/rewards`, payload,token)
        expect(response.status).to.not.equal(200, 'Able to create new Rewards with invalid artistBrandId')
        })

      })

      describe('POST /challenges/refresh/completedItems', async() => {
        let challengeId = `215c3ede-146c-4ee6-84a7-50675c17520a`
        
        it('Should be able to Clear Completed Items', async() => {
          const payload = {challengeId: challengeId, userId: userId}
          const response = await Challenges.post(`/challenges/refresh/completedItems`, payload,token)
          expect(response.status).to.equal(200, 'Unable to clear Completed Items')
        })

        it('Cannot clear Completed Items when unauthenticated', async() => {
          const payload = {challengeId: challengeId, userId: userId}
          const response = await Challenges.post(`/challenges/refresh/completedItems`, payload)
          expect(response.status).to.not.equal(200, 'Able to clear Completed Items even unauthenticated.')
        })       

      })

      describe('POST /challenges/refresh/challenge - Refresh Challenge', async() => {
        let challengeId = `215c3ede-146c-4ee6-84a7-50675c17520a`

        it('Should be able to Refresh Challenge', async() => {
          const payload = { challengeId: challengeId }
          const response = await Challenges.post(`/challenges/refresh/completedItems`, payload,token)
          expect(response.status).to.equal(200, 'Unable to clear Completed Items')
        })

        it('Cannot refresh challenge when unauthenticated', async() => {
          const payload = { challengeId: challengeId }
          const response = await Challenges.post(`/challenges/refresh/completedItems`, payload)
          expect(response.status).to.equal(200, 'Unable to clear Completed Items')
        })

      })

    

    
    })
    
})