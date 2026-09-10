import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import LeftPanel from './components/LeftPanel'
import LogicExplanationModal from './components/LogicExplanationModal'
import RightPanel from './components/RightPanel'
import { useVowelDebounce } from './hooks/useVowelDebounce'
import { loadPreferences, savePreferences } from './utils/preferences'
import { DEFAULT_WORD_LIST, findRhymes } from './utils/rhymeEngine'

const INITIAL_PREFERENCES = loadPreferences()

export default function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [rhymeType, setRhymeType] = useState(INITIAL_PREFERENCES.rhymeType)
  const [language, setLanguage] = useState(INITIAL_PREFERENCES.language)
  const [sortMode, setSortMode] = useState(INITIAL_PREFERENCES.sortMode)
  const [wordList, setWordList] = useState(() => {
    try {
      const savedList = window.localStorage.getItem('rhymekit_word_list')
      const parsedList = savedList ? JSON.parse(savedList) : null
      return Array.isArray(parsedList) ? parsedList : DEFAULT_WORD_LIST
    } catch {
      return DEFAULT_WORD_LIST
    }
  })
  const [settings, setSettings] = useState(INITIAL_PREFERENCES.settings)
  const [selectedWords, setSelectedWords] = useState([])
  const [leftPanelHeight, setLeftPanelHeight] = useState(null)
  const [showExplanationModal, setShowExplanationModal] = useState(false)
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

  useEffect(() => {
    savePreferences({ rhymeType, language, sortMode, settings })
  }, [rhymeType, language, sortMode, settings])

  const results = useMemo(
    () => findRhymes({
      searchTerm: debouncedSearchTerm,
      rhymeType,
      language,
      wordList,
      treatErAsA: settings.treatErAsA,
      vowelTolerance: settings.vowelTolerance,
      strictLastSyllable: settings.strictLastSyllable,
      treatIAsIe: settings.treatIAsIe,
      normalizeAnglicisms: settings.normalizeAnglicisms,
      includeCombinations: settings.additionalWords,
      distinguishVowelLength: settings.distinguishVowelLength,
    }),
    [debouncedSearchTerm, rhymeType, language, wordList, settings.treatErAsA, settings.vowelTolerance, settings.strictLastSyllable, settings.treatIAsIe, settings.normalizeAnglicisms, settings.additionalWords, settings.distinguishVowelLength],
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
      <Header onOpenExplanation={() => setShowExplanationModal(true)} />
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
          onDeleteSelection={(words) => {
            setWordList((current) => current.filter((word) => !words.includes(word)))
            setSelectedWords([])
          }}
        />
        <RightPanel
          results={results}
          searchTerm={searchTerm}
          wordListCount={wordList.length}
          settings={settings}
          selectedWords={selectedWords}
          onSelectedWordsChange={setSelectedWords}
          panelHeight={leftPanelHeight}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
        />
      </div>

      {showExplanationModal && (
        <LogicExplanationModal onClose={() => setShowExplanationModal(false)} />
      )}
    </main>
  )
}
