import CreateGame from '@/components/CreateGame'
import GameDetails from '@/components/GameDetails'
import GameList from '@/components/GameList'
import Hero from '@/components/Hero'
import { getGames } from '@/services/blockchain'
import { globalActions } from '@/store/globalSlices'
import { GameStruct, RootState } from '@/utils/type.dt'
import { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const Page: NextPage<{ gamesData: GameStruct[] }> = ({ gamesData }) => {
  const dispatch = useDispatch()
  const { setGames } = globalActions
  const { games } = useSelector((states: RootState) => states.globalStates)

  useEffect(() => {
    // If we have games data from server, use it
    if (gamesData && gamesData.length > 0) {
      dispatch(setGames(gamesData))
    } else {
      // Otherwise, fetch on client side
      const fetchGames = async () => {
        try {
          const games = await getGames()
          dispatch(setGames(games))
        } catch (error) {
          console.error('Failed to fetch games:', error)
          // Set empty array to prevent UI errors
          dispatch(setGames([]))
        }
      }
      fetchGames()
    }
  }, [dispatch, setGames, gamesData])

  return (
    <div>
      <Head>
        <title>Play2Earn</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Hero />

      {games.length > 1 && (
        <>
          <GameList games={games} />
          <GameDetails />
        </>
      )}
      <CreateGame />
    </div>
  )
}

export default Page

export const getServerSideProps = async () => {
  // Server-side blockchain calls will fail since ethereum is not available
  // Return empty data and fetch on client-side instead
  try {
    // Only try to fetch if we have an RPC URL configured
    if (process.env.NEXT_PUBLIC_RPC_URL) {
      const gamesData: GameStruct[] = await getGames()
      return {
        props: { gamesData: JSON.parse(JSON.stringify(gamesData)) },
      }
    }
  } catch (error) {
    console.log('Could not fetch games on server side:', error)
  }
  
  // Return empty games array as fallback
  return {
    props: { gamesData: [] },
  }
}
