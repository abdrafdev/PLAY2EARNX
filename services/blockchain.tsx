import { ethers } from 'ethers'
import address from '@/contracts/contractAddress.json'
import p2eAbi from '@/artifacts/contracts/Play2EarnX.sol/PlayToEarnX.json'
import { GameParams, GameStruct, InvitationStruct, ScoreStruct } from '@/utils/type.dt'
import { globalActions } from '@/store/globalSlices'
import { store } from '@/store'
import { isContractDeployed, validateContractDeployment } from '@/utils/contractHelper'

const toWei = (num: number) => ethers.parseEther(num.toString())
const fromWei = (num: any) => {
  // Handle BigInt values from ethers v6
  try {
    if (typeof num === 'bigint') {
      return ethers.formatEther(num)
    }
    return ethers.formatEther(num.toString())
  } catch (error) {
    console.error('Error converting from wei:', error)
    return '0'
  }
}
const { setInvitations, setGames, setScores } = globalActions

let ethereum: any
let tx: any

if (typeof window !== 'undefined') ethereum = (window as any).ethereum

const getEthereumContracts = async (needSigner = false) => {
  let provider: ethers.Provider | ethers.Signer
  
  // Check if we have ethereum available and accounts connected
  if (ethereum) {
    try {
      // For write operations, we need to ensure wallet is connected
      if (needSigner) {
        // Request accounts if not already connected
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts && accounts.length > 0) {
          const browserProvider = new ethers.BrowserProvider(ethereum)
          provider = await browserProvider.getSigner()
          
          // Validate contract deployment
          const validation = await validateContractDeployment(
            address.playToEarnXContract,
            browserProvider
          )
          if (!validation.isDeployed) {
            console.warn('Contract validation:', validation.message)
          }
          
          const contracts = new ethers.Contract(address.playToEarnXContract, p2eAbi.abi, provider)
          return contracts
        }
      } else {
        // For read operations, check if accounts are already connected
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          const browserProvider = new ethers.BrowserProvider(ethereum)
          provider = await browserProvider.getSigner()
          const contracts = new ethers.Contract(address.playToEarnXContract, p2eAbi.abi, provider)
          return contracts
        }
      }
    } catch (error) {
      console.log('Error getting ethereum accounts:', error)
      if (needSigner) {
        throw new Error('Wallet connection required for this operation')
      }
    }
  }
  
  // Fallback to read-only provider (only for read operations)
  if (needSigner) {
    throw new Error('Wallet connection required for this operation')
  }
  
  // Use the configured RPC URL, ensuring it's a valid URL
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'
  
  try {
    // Create provider with explicit configuration to avoid default provider issues
    // The staticNetwork option prevents unnecessary network detection calls
    provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: true,
      batchMaxCount: 1 // Disable batching to avoid potential issues
    })
    
    // Validate contract deployment for read-only provider
    const validation = await validateContractDeployment(
      address.playToEarnXContract,
      provider as ethers.Provider
    )
    if (!validation.isDeployed) {
      console.warn('Contract validation:', validation.message)
    }
    
    const contracts = new ethers.Contract(address.playToEarnXContract, p2eAbi.abi, provider)
    return contracts
  } catch (error) {
    console.error('Error creating JsonRpcProvider:', error)
    // Fallback to a basic provider without network detection
    provider = new ethers.JsonRpcProvider(rpcUrl)
    const contracts = new ethers.Contract(address.playToEarnXContract, p2eAbi.abi, provider)
    return contracts
  }
}

const getOwner = async (): Promise<string> => {
  try {
    const contract = await getEthereumContracts()
    const owner = await contract.owner()
    return owner
  } catch (error: any) {
    console.error('Error getting owner:', error)
    if (error.code === 'BAD_DATA' || error.value === '0x') {
      console.warn('Contract may not be deployed or method does not exist')
      return '0x0000000000000000000000000000000000000000'
    }
    throw error
  }
}

const getGames = async (): Promise<GameStruct[]> => {
  try {
    const contract = await getEthereumContracts()
    const games = await contract.getGames()
    return structuredGames(games)
  } catch (error: any) {
    console.error('Error getting games:', error)
    if (error.code === 'BAD_DATA' || error.value === '0x') {
      console.warn('Contract may not be deployed or method does not exist')
      return []
    }
    throw error
  }
}

const getMyGames = async (): Promise<GameStruct[]> => {
  try {
    const contract = await getEthereumContracts()
    const games = await contract.getMyGames()
    return structuredGames(games)
  } catch (error: any) {
    console.error('Error getting my games:', error)
    if (error.code === 'BAD_DATA' || error.value === '0x') {
      console.warn('Contract may not be deployed or method does not exist')
      return []
    }
    throw error
  }
}

const getGame = async (gameId: number): Promise<GameStruct | null> => {
  try {
    const contract = await getEthereumContracts()
    const game = await contract.getGame(gameId)
    return structuredGames([game])[0]
  } catch (error: any) {
    console.error('Error getting game:', error)
    if (error.code === 'BAD_DATA' || error.value === '0x') {
      console.warn('Contract may not be deployed or game does not exist')
      return null
    }
    throw error
  }
}

const getInvitations = async (gameId: number): Promise<InvitationStruct[]> => {
  try {
    const contract = await getEthereumContracts()
    const invitation = await contract.getInvitations(gameId)
    return structuredInvitations(invitation)
  } catch (error: any) {
    console.error('Error getting invitations:', error)
    if (error.code === 'BAD_DATA' || error.value === '0x') {
      console.warn('Contract may not be deployed or method does not exist')
      return []
    }
    throw error
  }
}

const getMyInvitations = async (): Promise<InvitationStruct[]> => {
  try {
    const contract = await getEthereumContracts()
    const invitation = await contract.getMyInvitations()
    return structuredInvitations(invitation)
  } catch (error: any) {
    console.error('Error getting my invitations:', error)
    if (error.code === 'BAD_DATA' || error.value === '0x') {
      console.warn('Contract may not be deployed or method does not exist')
      return []
    }
    if (error.message?.includes('Cannot read properties')) {
      console.warn('Wallet not connected for personalized data')
      return []
    }
    throw error
  }
}

const getScores = async (gameId: number): Promise<ScoreStruct[]> => {
  try {
    const contract = await getEthereumContracts()
    const scores = await contract.getScores(gameId)
    return structuredScores(scores)
  } catch (error: any) {
    console.error('Error getting scores:', error)
    if (error.code === 'BAD_DATA' || error.value === '0x') {
      console.warn('Contract may not be deployed or method does not exist')
      return []
    }
    throw error
  }
}

const createGame = async (game: GameParams): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a browser provider')
    return Promise.reject(new Error('Browser provider not installed'))
  }

  try {
    const contract = await getEthereumContracts(true) // Need signer for write operation
    tx = await contract.createGame(
      game.title,
      game.description,
      game.participants,
      game.numberOfWinners,
      game.startDate,
      game.endDate,
      { value: toWei(Number(game.stake)) }
    )
    await tx.wait()

    const games: GameStruct[] = await getGames()
    store.dispatch(setGames(games))

    return Promise.resolve(tx)
  } catch (error: any) {
    reportError(error)
    // Provide user-friendly error messages
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return Promise.reject(new Error('Insufficient funds. Please add ETH to your wallet.'))
    }
    if (error.message?.includes('user rejected')) {
      return Promise.reject(new Error('Transaction cancelled by user'))
    }
    return Promise.reject(error)
  }
}

const deleteGame = async (gameId: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a browser provider')
    return Promise.reject(new Error('Browser provider not installed'))
  }

  try {
    const contract = await getEthereumContracts(true) // Need signer for write operation
    tx = await contract.deleteGame(gameId)
    await tx.wait()

    const games: GameStruct[] = await getGames()
    store.dispatch(setGames(games))

    return Promise.resolve(tx)
  } catch (error: any) {
    reportError(error)
    // Provide user-friendly error messages
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return Promise.reject(new Error('Insufficient funds for gas fees. Please add ETH to your wallet.'))
    }
    if (error.message?.includes('user rejected')) {
      return Promise.reject(new Error('Transaction cancelled by user'))
    }
    if (error.message?.includes('not the owner')) {
      return Promise.reject(new Error('Only the game owner can delete this game'))
    }
    return Promise.reject(error)
  }
}

const invitePlayer = async (receiver: string, gameId: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a browser provider')
    return Promise.reject(new Error('Browser provider not installed'))
  }

  try {
    const contract = await getEthereumContracts(true) // Need signer for write operation
    tx = await contract.invitePlayer(receiver, gameId)
    await tx.wait()

    const invitations: InvitationStruct[] = await getInvitations(gameId)
    store.dispatch(setInvitations(invitations))

    return Promise.resolve(tx)
  } catch (error: any) {
    reportError(error)
    // Provide user-friendly error messages
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return Promise.reject(new Error('Insufficient funds for gas fees. Please add ETH to your wallet.'))
    }
    if (error.message?.includes('user rejected')) {
      return Promise.reject(new Error('Transaction cancelled by user'))
    }
    if (error.message?.includes('invalid address')) {
      return Promise.reject(new Error('Invalid player address. Please check and try again.'))
    }
    if (error.message?.includes('already invited')) {
      return Promise.reject(new Error('This player has already been invited to the game.'))
    }
    return Promise.reject(error)
  }
}

const saveScore = async (gameId: number, index: number, score: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a browser provider')
    return Promise.reject(new Error('Browser provider not installed'))
  }

  try {
    const contract = await getEthereumContracts(true) // Need signer for write operation
    tx = await contract.saveScore(gameId, index, score)
    await tx.wait()

    const scores: ScoreStruct[] = await getScores(gameId)
    store.dispatch(setScores(scores))

    return Promise.resolve(tx)
  } catch (error: any) {
    reportError(error)
    // Provide user-friendly error messages
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return Promise.reject(new Error('Insufficient funds for gas fees. Please add ETH to your wallet.'))
    }
    if (error.message?.includes('user rejected')) {
      return Promise.reject(new Error('Transaction cancelled by user'))
    }
    if (error.message?.includes('game has ended')) {
      return Promise.reject(new Error('Cannot save score - the game has already ended.'))
    }
    if (error.message?.includes('not a participant')) {
      return Promise.reject(new Error('You are not a participant in this game.'))
    }
    return Promise.reject(error)
  }
}

const payout = async (gameId: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a browser provider')
    return Promise.reject(new Error('Browser provider not installed'))
  }

  try {
    const contract = await getEthereumContracts(true) // Need signer for write operation
    tx = await contract.payout(gameId)
    await tx.wait()

    const scores: ScoreStruct[] = await getScores(gameId)
    store.dispatch(setScores(scores))

    return Promise.resolve(tx)
  } catch (error: any) {
    reportError(error)
    // Provide user-friendly error messages
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return Promise.reject(new Error('Insufficient funds for gas fees. Please add ETH to your wallet.'))
    }
    if (error.message?.includes('user rejected')) {
      return Promise.reject(new Error('Transaction cancelled by user'))
    }
    if (error.message?.includes('already paid out')) {
      return Promise.reject(new Error('This game has already been paid out.'))
    }
    if (error.message?.includes('game not ended')) {
      return Promise.reject(new Error('Cannot payout - the game has not ended yet.'))
    }
    if (error.message?.includes('not the owner')) {
      return Promise.reject(new Error('Only the game owner can initiate payout.'))
    }
    return Promise.reject(error)
  }
}

const respondToInvite = async (
  accept: boolean,
  invitation: InvitationStruct,
  index: number
): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a browser provider')
    return Promise.reject(new Error('Browser provider not installed'))
  }

  try {
    const contract = await getEthereumContracts(true) // Need signer for write operation
    if (accept) {
      tx = await contract.acceptInvitation(invitation.gameId, index, {
        value: toWei(invitation.stake),
      })
    } else {
      tx = await contract.rejectInvitation(invitation.gameId, index)
    }
    await tx.wait()

    const invitations: InvitationStruct[] = await getMyInvitations()
    store.dispatch(setInvitations(invitations))

    return Promise.resolve(tx)
  } catch (error: any) {
    reportError(error)
    // Provide user-friendly error messages
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return Promise.reject(new Error(`Insufficient funds. You need ${invitation.stake} ETH plus gas fees to accept this invitation.`))
    }
    if (error.message?.includes('user rejected')) {
      return Promise.reject(new Error('Transaction cancelled by user'))
    }
    if (error.message?.includes('already responded')) {
      return Promise.reject(new Error('You have already responded to this invitation.'))
    }
    if (error.message?.includes('game is full')) {
      return Promise.reject(new Error('Cannot accept - the game is already full.'))
    }
    return Promise.reject(error)
  }
}

const structuredGames = (games: GameStruct[]): GameStruct[] =>
  games
    .map((game) => ({
      id: Number(game.id),
      title: game.title,
      participants: Number(game.participants),
      numberOfWinners: Number(game.numberOfWinners),
      acceptees: Number(game.acceptees),
      stake: parseFloat(fromWei(game.stake)),
      owner: game.owner,
      description: game.description,
      startDate: Number(game.startDate),
      endDate: Number(game.endDate),
      timestamp: Number(game.timestamp),
      deleted: game.deleted,
      paidOut: game.paidOut,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)

const structuredInvitations = (invitations: InvitationStruct[]): InvitationStruct[] =>
  invitations
    .map((invitation) => ({
      id: Number(invitation.id),
      gameId: Number(invitation.gameId),
      title: invitation.title,
      sender: invitation.sender,
      receiver: invitation.receiver,
      stake: parseFloat(fromWei(invitation.stake)),
      accepted: invitation.accepted,
      responded: invitation.responded,
      timestamp: Number(invitation.timestamp),
    }))
    .sort((a, b) => b.timestamp - a.timestamp)

const structuredScores = (scores: ScoreStruct[]): ScoreStruct[] =>
  scores
    .map((score) => ({
      id: Number(score.id),
      gameId: Number(score.gameId),
      player: score.player,
      prize: parseFloat(fromWei(score.prize)),
      score: Number(score.score),
      played: score.played,
    }))
    .sort((a, b) => a.score - b.score)

const reportError = (error: any) => {
  console.error('Blockchain Error:', error)
}

export {
  getOwner,
  getGames,
  getMyGames,
  getGame,
  getScores,
  getInvitations,
  getMyInvitations,
  respondToInvite,
  createGame,
  invitePlayer,
  saveScore,
  payout,
  deleteGame,
}
