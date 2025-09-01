const { faker } = require('@faker-js/faker')
const { ethers } = require('hardhat')
const fs = require('fs')

const toWei = (num) => ethers.parseEther(num.toString())
const dataCount = 3

const generateGameData = (count) => {
  const games = []
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay

  for (let i = 0; i < count; i++) {
    const game = {
      id: i + 1,
      title: `Game ${i + 1}: ${faker.lorem.words(3)}`,
      description: faker.lorem.paragraph(),
      participants: faker.number.int({ min: 2, max: 5 }),
      winners: faker.number.int({ min: 1, max: 2 }),
      stake: faker.number.float({ min: 0.01, max: 0.1, precision: 0.001 }),
      starts: now + oneDay * (i + 1), // Games start 1, 2, 3 days from now
      ends: now + oneWeek + oneDay * (i + 1), // Games end a week after they start
    }
    games.push(game)
  }

  return games
}

const generateInvitations = async (gameId) => {
  const signers = await ethers.getSigners()
  const invitations = []
  
  // Invite players 2 and 3 to each game
  for (let i = 2; i <= 3; i++) {
    if (i < signers.length) {
      invitations.push({
        gameId: gameId,
        account: signers[i].address,
      })
    }
  }

  return invitations
}

async function createGame(contract, game) {
  const tx = await contract.createGame(
    game.title,
    game.description,
    game.participants,
    game.winners,
    game.starts,
    game.ends,
    { value: toWei(game.stake) }
  )
  await tx.wait()
}

async function sendInvitation(contract, player) {
  try {
    const tx = await contract.invitePlayer(player.account, player.gameId)
    await tx.wait()
    console.log(`  ✓ Invited ${player.account.substring(0, 10)}... to game ${player.gameId}`)
  } catch (error) {
    console.log(`  ✗ Failed to invite ${player.account.substring(0, 10)}... to game ${player.gameId}:`, error.message)
  }
}

async function getGames(contract) {
  const result = await contract.getGames()
  console.log('Games:', result)
}

async function getInvitations(contract, gameId) {
  const result = await contract.getInvitations(gameId)
  console.log('Invitations:', result)
}

async function getMyInvitations(contract) {
  const result = await contract.getMyInvitations()
  console.log('Invitations:', result)
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  let playToEarnXContract

  try {
    const contractAddresses = fs.readFileSync('./contracts/contractAddress.json', 'utf8')
    const { playToEarnXContract: playToEarnXAddress } = JSON.parse(contractAddresses)

    playToEarnXContract = await ethers.getContractAt('PlayToEarnX', playToEarnXAddress)
    console.log('\n🎮 Seeding Play2EarnX Contract...')
    console.log('================================\n')

    // Process #1: Create games
    console.log('Creating games...')
    const games = generateGameData(dataCount)
    const createdGameIds = []
    
    for (const game of games) {
      await createGame(playToEarnXContract, game)
      console.log(`  ✓ Created game: "${game.title}"`)
      createdGameIds.push(game.id)
    }

    await delay(1000) // Wait for 1 second

    // Process #2: Send invitations for each game
    console.log('\nSending invitations...')
    for (const gameId of createdGameIds) {
      const invitations = await generateInvitations(gameId)
      for (const invitation of invitations) {
        await sendInvitation(playToEarnXContract, invitation)
      }
    }

    await delay(1000) // Wait for 1 second

    // Process #3: Display results
    console.log('\n📊 Fetching seeded data...')
    console.log('================================\n')
    await getGames(playToEarnXContract)
    
    if (createdGameIds.length > 0) {
      console.log('\nInvitations for Game 1:')
      await getInvitations(playToEarnXContract, 1)
    }
    
    console.log('\n✅ Seeding completed successfully!')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message)
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exitCode = 1
})
