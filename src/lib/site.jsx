import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const FALLBACK = {
  settings: {
    site_name: 'همراهان امید',
    site_subtitle: 'بنیاد خیریه حمایت از زنان و کودکان بلوچ',
  },
  activities: [],
  projects: [],
  stories: [],
  impact: null,
  payment: { online: false },
  volunteerInterests: [],
}

const SiteContext = createContext({
  ...FALLBACK,
  loading: true,
  error: null,
  refresh: async () => {},
})

export function SiteProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const payload = await api('/site')
      setData(payload)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ ...FALLBACK, ...(data || {}), loading, error, refresh }),
    [data, loading, error, refresh]
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)

export const useSettings = () => useSite().settings || FALLBACK.settings
