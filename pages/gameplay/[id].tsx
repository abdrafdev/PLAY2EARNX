import GameCard from '@/components/GameCard'
import { getGame, getScores, saveScore } from '@/services/blockchain'
import { GameCardStruct, GameStruct, ScoreStruct } from '@/utils/type.dt'
import { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  GiAngelWings,
  GiBeech,
  GiBowArrow,
  GiCrossedSwords,
  GiShieldBounces,
  GiSpartanHelmet,
} from 'react-icons/gi'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'

const uniqueCardElements: GameCardStruct[] = [
  {
    id: 0,
    name: 'Helmet',
    icon: <GiSpartanHelmet size={100} />,
  },
  {
    id: 1,
    name: 'Beech',
    icon: <GiBeech size={100} />,
  },
  {
    id: 2,
    name: 'Shield',
    icon: <GiShieldBounces size={100} />,
  },
  {
    id: 3,
    name: 'Swords',
    icon: <GiCrossedSwords size={100} />,
  },
  {
    id: 4,
    name: 'Wings',
    icon: <GiAngelWings size={100} />,
  },
  {
    id: 5,
    name: 'Arrow',
    icon: <GiBowArrow size={100} />,
  },
]

const shuffleCards = (array: GameCardStruct[]) => {
  const length = array.length
  for (let i = length; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * i)
    const currentIndex = i - 1
    const temp = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temp
  }
  return array
}

interface PageComponents {
  gameData: GameStruct
  playerAddresses: string[]
  scoresData: ScoreStruct[]
}

const Page: NextPage<PageComponents> = ({ gameData, playerAddresses, scoresData }) => {
  const { address } = useAccount()
  const [flipCount, setFlipCount] = useState<number>(0)
  const [player, setPlayer] = useState<ScoreStruct | null>(null)
  const [openCards, setOpenCards] = useState<GameCardStruct[]>([])
  const [allCardsFlipped, setAllCardsFlipped] = useState<boolean>(false)

  useEffect(() => {
    if (address && scoresData) {
      const foundPlayer = scoresData.find((player) => 
        player.player?.toLowerCase() === address?.toLowerCase()
      )
      setPlayer(foundPlayer || null)
    }
  }, [address, scoresData])

  const [cards, setCards] = useState<GameCardStruct[]>(
    shuffleCards(
      uniqueCardElements.concat(
        uniqueCardElements.map((card, index) => ({
          ...card,
          id: card.id + uniqueCardElements.length,
        }))
      )
    )
  )

  const handleCardClick = (id: number) => {
    setCards((prevCards) => {
      const updatedCards = prevCards.map((card) =>
        card.id === id ? { ...card, isFlipped: !card.isFlipped } : card
      )
      const allFlipped = updatedCards.every((card) => card.isFlipped)
      setAllCardsFlipped(allFlipped)
      return updatedCards
    })

    setFlipCount(flipCount + 1)

    setOpenCards((prevOpenCards) => {
      const newOpenCards = [...prevOpenCards, cards.find((card) => card.id === id)!]

      if (newOpenCards.length === 2) {
        if (newOpenCards[0].name === newOpenCards[1].name) {
          // If the two cards are the same, clear the openCards array
          return []
        } else {
          // If the two cards are not the same, flip them back after a delay
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((card) =>
                newOpenCards.find((openCard) => openCard.id === card.id)
                  ? { ...card, isFlipped: false }
                  : card
              )
            )
          }, 1000)

          // Clear the openCards array
          return []
        }
      }

      // If there's only one card in openCards, keep it
      return newOpenCards
    })
  }

  const handleSubmit = async () => {
    if (!address) return toast.warning('Connect wallet first!')
    if (!player) return toast.warning('Player data not found')
    if (!gameData) return toast.warning('Game data not found')
    
    // Check if player has already played
    if (player.played) {
      return toast.info('You have already submitted your score for this game')
    }
    
    // Check if game has ended
    if (Date.now() > gameData.endDate) {
      return toast.error('Cannot submit score - the game has ended')
    }
    
    // Check if game has started
    if (Date.now() < gameData.startDate) {
      return toast.warning('Cannot submit score - the game has not started yet')
    }

    try {
      await toast.promise(
        new Promise<void>((resolve, reject) => {
          saveScore(player.gameId, player.id, flipCount)
            .then((tx) => {
              console.log(tx)
              resetGame()
              resolve(tx)
            })
            .catch((error: any) => {
              console.error('Save score error:', error)
              // Pass user-friendly error message to toast
              reject(error.message || 'Failed to save score')
            })
        }),
        {
          pending: 'Approve transaction...',
          success: 'Score saved successfully 👌',
          error: {
            render({ data }) {
              // Display the actual error message from blockchain service
              return typeof data === 'string' ? data : 'Failed to save score'
            },
          },
        }
      )
    } catch (error: any) {
      console.error('Failed to save score:', error)
      toast.error(error.message || 'Failed to save score')
    }
  }

  const resetGame = () => {
    setCards(
      shuffleCards(
        uniqueCardElements.concat(
          uniqueCardElements.map((card, index) => ({
            ...card,
            id: card.id + uniqueCardElements.length,
          }))
        )
      )
    )
    setOpenCards([])
    setFlipCount(0)
    setAllCardsFlipped(false)
  }

  return (
    <div>
      <Head>
        <title>Play2Earn | {gameData?.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col justify-center items-center space-y-8">
        <h4 className="text-2xl font-semibold text-blue-700">
          We are keeping count of your flips, beware...
        </h4>

        <div className="grid grid-cols-4 gap-4">
          {cards.map((card: GameCardStruct, i: number) => (
            <GameCard
              key={i}
              card={card}
              isDisabled={card.isFlipped || false}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>

        <div className="flex space-x-2">
          <button
            className="bg-transparent border border-blue-700 hover:bg-blue-800
            py-2 px-6 text-blue-700 hover:text-white rounded-full
            transition duration-300 ease-in-out"
            onClick={resetGame}
          >
            Reset Game
          </button>

          {playerAddresses.includes(String(address)) && allCardsFlipped && (
            <button
              onClick={handleSubmit}
              className="bg-transparent border border-green-700 hover:bg-green-800
              py-2 px-6 text-green-700 hover:text-white rounded-full
              transition duration-300 ease-in-out"
            >
              Submit Game
            </button>
          )}

          <Link
            href={'/results/' + gameData.id}
            className="bg-transparent border border-blue-700 hover:bg-blue-800
            py-2 px-6 text-blue-700 hover:text-white rounded-full
            transition duration-300 ease-in-out"
          >
            Check Result
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Page

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { id } = context.query
  
  try {
    const gameData: GameStruct | null = await getGame(Number(id))
    const scoresData: ScoreStruct[] = await getScores(Number(id))
    
    // If game doesn't exist, redirect to games page
    if (!gameData) {
      return {
        redirect: {
          destination: '/games',
          permanent: false,
        },
      }
    }
    
    const playerAddresses: string[] = scoresData.map((player) => player.player)

    return {
      props: {
        gameData: JSON.parse(JSON.stringify(gameData)),
        scoresData: JSON.parse(JSON.stringify(scoresData)),
        playerAddresses: JSON.parse(JSON.stringify(playerAddresses)),
      },
    }
  } catch (error) {
    console.error('Error fetching game data:', error)
    // Return redirect on error
    return {
      redirect: {
        destination: '/games',
        permanent: false,
      },
    }
  }
}
