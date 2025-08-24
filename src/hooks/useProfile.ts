// ============= src/hooks/useProfile.ts =============
import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_USER_PROFILE } from '../lib/queries'
import { CREATE_USER_PROFILE, UPDATE_USER_PROFILE } from '../lib/mutations'
import { useAuth } from './useAuth'
import { showToast } from '../components/UI/Toast'
import { ServerProfile } from '../types/auth'

export const useProfile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  
  const { data, loading, refetch } = useQuery(GET_USER_PROFILE, {
    variables: { userId: user?.id },
    skip: !user?.id
  })

  const [createProfileMutation, { loading: creating }] = useMutation(CREATE_USER_PROFILE)
  const [updateProfileMutation, { loading: updating }] = useMutation(UPDATE_USER_PROFILE)

  const profile: ServerProfile | null = data?.user_profiles?.[0] || null

  const createProfile = useCallback(async (profileData: Partial<ServerProfile>): Promise<boolean> => {
    if (!user?.id) return false

    try {
      await createProfileMutation({
        variables: {
          userId: user.id,
          displayName: (profileData as ServerProfile).display_name,
          bio: (profileData as ServerProfile).bio,
          avatarUrl: (profileData as ServerProfile).avatar_url
        }
      })
      
      showToast.success('Profile created!')
      await refetch()
      return true
    } catch (error) {
      console.error('Error creating profile:', error)
      showToast.error('Failed to create profile')
      return false
    }
  }, [user?.id, createProfileMutation, refetch])

  const updateProfile = useCallback(async (updates: Partial<ServerProfile>): Promise<boolean> => {
    if (!user?.id) return false

    try {
      await updateProfileMutation({
        variables: {
          userId: user.id,
          displayName: (updates as ServerProfile).display_name,
          bio: (updates as ServerProfile).bio,
          avatarUrl: (updates as ServerProfile).avatar_url,
          themePreference: (updates as ServerProfile).theme_preference
        }
      })
      
      showToast.success('Profile updated!')
      await refetch()
      setIsEditing(false)
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast.error('Failed to update profile')
      return false
    }
  }, [user?.id, updateProfileMutation, refetch])

  return {
    profile,
    loading,
    creating,
    updating,
    isEditing,
    setIsEditing,
    createProfile,
    updateProfile,
    refetch
  }
}
