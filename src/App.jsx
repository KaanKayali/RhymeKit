import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  const [settings, setSettings] = useState({ vowelTolerance: false, additionalWords: false, treatErAsA: false, treatIAsIe: false, normalizeAnglicisms: false })
  const [selectedWords, setSelectedWords] = useState([])
  const [leftPanelHeight, setLeftPanelHeight] = useState(null)
  const leftPanelRef = useRef(null)
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
    () => findRhymes({
      searchTerm: debouncedSearchTerm,
      rhymeType,
      language,
      wordList,
      treatErAsA: settings.treatErAsA,
      vowelTolerance: settings.vowelTolerance,
      treatIAsIe: settings.treatIAsIe,
      normalizeAnglicisms: settings.normalizeAnglicisms,
      includeCombinations: settings.additionalWords,
    }),
    [debouncedSearchTerm, rhymeType, language, wordList, settings.treatErAsA, settings.vowelTolerance, settings.treatIAsIe, settings.normalizeAnglicisms, settings.additionalWords],
  )

  useLayoutEffect(() => {
    const panel = leftPanelRef.current
    if (!panel) return undefined

    const updateHeight = () => setLeftPanelHeight(Math.ceil(panel.getBoundingClientRect().height))
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(panel)
    return () => observer.disconnect()
  }, [])

  return (
    <main className="app-shell">
      <Header />
      <div className="workspace">
        <LeftPanel
          panelRef={leftPanelRef}
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
          selectedWords={selectedWords}
          onApplySelection={(words) => {
            setSearchTerm(words.join(' '))
            setSelectedWords([])
          }}
        />
        <RightPanel
          results={results}
          hasSearchTerm={Boolean(searchTerm.trim())}
          selectedWords={selectedWords}
          onSelectedWordsChange={setSelectedWords}
          panelHeight={leftPanelHeight}
        />
      </div>
    </main>
  )
}
