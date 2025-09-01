import GameResult from '@/components/GameResult'
import { getGame, getScores, payout } from '@/services/blockchain'
import { globalActions } from '@/store/globalSlices'
import { GameStruct, RootState, ScoreStruct } from '@/utils/type.dt'
import { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'

interface PageProps {
  gameData: GameStruct
  scoresData: ScoreStruct[]
}

const Page: NextPage<PageProps> = ({ gameData, scoresData }) => {
  const dispatch = useDispatch()
  const { address } = useAccount()
  const { setGame, setScores } = globalActions
  const { game, scores } = useSelector((states: RootState) => states.globalStates)

  useEffect(() => {
    dispatch(setGame(gameData))
    dispatch(setScores(scoresData))
  }, [dispatch, setGame, gameData, setScores, scoresData, scores])

  const handlePayout = async () => {
    if (!address) return toast.warning('Connect wallet first!')
    if (!game) return toast.warning('Game data not found')
    
    // Check if user is the game owner
    if (address !== game.owner) {
      return toast.error('Only the game owner can initiate payout')
    }
    
    // Check if game has ended
    if (Date.now() < game.endDate) {
      return toast.warning('Cannot payout - game has not ended yet')
    }
    
    // Check if already paid out
    if (game.paidOut) {
      return toast.info('This game has already been paid out')
    }

    try {
      await toast.promise(
        new Promise<void>((resolve, reject) => {
          payout(game.id)
            .then((tx) => {
              console.log(tx)
              resolve(tx)
            })
            .catch((error: any) => {
              console.error('Payout error:', error)
              // Pass user-friendly error message to toast
              reject(error.message || 'Failed to process payout')
            })
        }),
        {
          pending: 'Approve transaction...',
          success: 'Payout successful 👌',
          error: {
            render({ data }) {
              // Display the actual error message from blockchain service
              return typeof data === 'string' ? data : 'Failed to process payout'
            },
          },
        }
      )
    } catch (error: any) {
      console.error('Failed to process payout:', error)
      toast.error(error.message || 'Failed to process payout')
    }
  }

  return (
    <div>
      <Head>
        <title>Play2Earn | Game Result</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {game && <GameResult game={game} scores={scores} />}

      <div className="flex justify-center space-x-2">
        <button
          className="bg-transparent border border-orange-700 hover:bg-orange-800
          py-2 px-6 text-orange-700 hover:text-white rounded-full
          transition duration-300 ease-in-out"
          onClick={handlePayout}
        >
          Payout
        </button>
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

    return {
      props: {
        gameData: JSON.parse(JSON.stringify(gameData)),
        scoresData: JSON.parse(JSON.stringify(scoresData)),
      },
    }
  } catch (error) {
    console.error('Error fetching game results:', error)
    // Return redirect on error
    return {
      redirect: {
        destination: '/games',
        permanent: false,
      },
    }
  }
}
