import { useMemo, useState } from 'react'
import Header from './components/Header'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import { useVowelDebounce } from './hooks/useVowelDebounce'
import { DEFAULT_WORD_LIST, findRhymes } from './utils/rhymeEngine'

export default function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [rhymeType, setRhymeType] = useState('perfect')
  const [language, setLanguage] = useState('de')
  const [wordList, setWordList] = useState(DEFAULT_WORD_LIST)
  const [settings, setSettings] = useState({ perfectRhymes: true, additionalWords: true })
  const debouncedSearchTerm = useVowelDebounce(searchTerm)

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
        <RightPanel results={results} />
      </div>
    </main>
  )
}
