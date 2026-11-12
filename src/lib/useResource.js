import { useCallback, useEffect, useState } from 'react'

export function useResource(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await loader()
      setState({ data, error: null, loading: false })
    } catch (error) {
      setState({ data: null, error: error.message || 'خطا در دریافت اطلاعات', loading: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}
