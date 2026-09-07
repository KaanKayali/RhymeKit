import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import { useVowelDebounce } from './hooks/useVowelDebounce'
import { DEFAULT_WORD_LIST, findRhymes } from './utils/rhymeEngine'

export default function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [rhymeType, setRhymeType] = useState('vowel')
  const [language, setLanguage] = useState('de')
  const [wordList, setWordList] = useState(() => {
    try {
      const savedList = window.localStorage.getItem('rhymekit_word_list')
      const parsedList = savedList ? JSON.parse(savedList) : null
      return Array.isArray(parsedList) ? parsedList : DEFAULT_WORD_LIST
    } catch {
      return DEFAULT_WORD_LIST
    }
  })
  const [settings, setSettings] = useState({ perfectRhymes: true, additionalWords: true })
  const debouncedSearchTerm = useVowelDebounce(searchTerm)

  useEffect(() => {
    try {
      if (wordList.length) {
        window.localStorage.setItem('rhymekit_word_list', JSON.stringify(wordList))
      } else {
        window.localStorage.removeItem('rhymekit_word_list')
      }
    } catch {
      // The app remains usable when browser storage is unavailable.
    }
  }, [wordList])

  const results = useMemo(
    () => findRhymes({ searchTerm: debouncedSearchTerm, rhymeType, language, wordList }),
    [debouncedSearchTerm, rhymeType, language, wordList],
  )

  return (
    <main className="app-shell">
      <Header />
      <div className="workspace">
        <LeftPanel
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          rhymeType={rhymeType}
          onRhymeTypeChange={setRhymeType}
          language={language}
          onLanguageChange={setLanguage}
          settings={settings}
          onSettingChange={(key, value) => setSettings((current) => ({ ...current, [key]: value }))}
          onAddWords={(words) => setWordList((current) => [...current, ...words])}
          onClearList={() => setWordList([])}
          existingWords={wordList}
        />
        <RightPanel results={results} hasSearchTerm={Boolean(searchTerm.trim())} />
      </div>
    </main>
  )
}
