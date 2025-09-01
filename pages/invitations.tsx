import GameInvitations from '@/components/GameInvitations'
import InviteModal from '@/components/InviteModal'
import { getMyInvitations } from '@/services/blockchain'
import { globalActions } from '@/store/globalSlices'
import { InvitationStruct, RootState } from '@/utils/type.dt'
import { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const Page: NextPage = () => {
  const dispatch = useDispatch()
  const { setGame, setInvitations } = globalActions
  const { invitations } = useSelector((states: RootState) => states.globalStates)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const invitationsData: InvitationStruct[] = await getMyInvitations()
        dispatch(setInvitations(invitationsData))
      } catch (error: any) {
        console.error('Failed to fetch invitations:', error)
        // Set empty array if contract is not deployed or method doesn't exist
        if (error.code === 'BAD_DATA' || error.value === '0x') {
          dispatch(setInvitations([]))
        }
      }
    }

    fetchData()
  }, [dispatch, setGame, setInvitations])

  return (
    <div>
      <Head>
        <title>Play2Earn | My Invitation</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {invitations && <GameInvitations invitations={invitations} label />}
      <InviteModal />
    </div>
  )
}

export default Page
