import { computed, defineComponent, ref } from 'vue'
import Mentions from '../src'
import './dynamic.less'

function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

export default defineComponent(() => {
  const loading = ref(false)
  const users = ref<any[]>([])
  const searchRef = ref('')

  const loadGithubUsers = useDebounce((key: string) => {
    if (!key) {
      users.value = []
      return
    }

    fetch(`https://api.github.com/search/users?q=${key}`)
      .then(res => res.json())
      .then(({ items = [] }) => {
        if (searchRef.value !== key) {
          console.log('Out Of Date >', key, items)
          return
        }

        console.log('Fetch Users >', items)
        users.value = items.slice(0, 10)
        loading.value = false
      })
  }, 800)

  const onSearch = (text: string) => {
    searchRef.value = text
    loading.value = !!text
    users.value = []
    console.log('Search:', text)
    loadGithubUsers(text)
  }

  const options = computed(() => {
    if (loading.value) {
      return [
        {
          value: searchRef.value,
          disabled: true,
          label: `Searching '${searchRef.value}'...`,
        },
      ]
    }

    return users.value.map(({ login, avatar_url: avatar }) => ({
      key: login,
      value: login,
      className: 'dynamic-option',
      label: (
        <>
          <img src={avatar} alt={login} />
          <span>{login}</span>
        </>
      ),
    }))
  })

  return () => (
    <div>
      <Mentions
        onSearch={onSearch}
        style={{ width: '100%' }}
        autoFocus
        options={options.value}
      />
      search:
      <code>{searchRef.value}</code>
    </div>
  )
})
