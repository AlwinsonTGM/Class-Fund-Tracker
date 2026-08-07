import { createClient } from '@/lib/supabase-server'
import { PlazaPageClient } from './plaza-page-client'

export const dynamic = 'force-dynamic'

export default async function PlazaPage() {
  const supabase = await createClient()

  // 1. Get active session user
  const { data: { user } } = await supabase.auth.getUser()

  let isOfficer = false
  let isDev = false
  if (user) {
    const userRoleMeta = (user.app_metadata?.role || user.user_metadata?.role || '').toString().toLowerCase()
    const isUserAdminMeta = user.app_metadata?.is_admin || user.user_metadata?.is_admin || user.app_metadata?.admin || user.user_metadata?.admin
    if (
      userRoleMeta === 'admin' ||
      userRoleMeta === 'dev' ||
      userRoleMeta === 'developer' ||
      isUserAdminMeta ||
      user.email?.toLowerCase().includes('admin') ||
      user.email?.toLowerCase().includes('dev')
    ) {
      isDev = true
    }

    const { data: moderator } = await supabase
      .from('moderators')
      .select('email')
      .eq('email', user.email)
      .maybeSingle()

    try {
      const { data: officer, error: offError } = await supabase
        .from('officers')
        .select('email')
        .eq('email', user.email)
        .maybeSingle()
      if (!offError && officer) {
        isOfficer = true
      }
    } catch (err) {
      console.warn('Officers check failed inside /plaza:', err)
    }

    if (moderator) isOfficer = true
  }

  // 2. Fetch Freedom Wall Posts for Bulletin Board
  const { data: dbPosts, error: postsError } = await supabase
    .from('freedom_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (postsError) {
    console.warn('Error fetching freedom posts for plaza:', postsError.message)
  }

  return (
    <PlazaPageClient
      initialPosts={dbPosts || []}
      user={user}
      isOfficer={isOfficer}
      isDev={isDev}
    />
  )
}
