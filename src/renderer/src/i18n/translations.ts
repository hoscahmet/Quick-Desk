import { Language } from '../types'

export const translations = {
  tr: {
    common: {
      copy: 'Kopyala',
      copied: 'Kopyalandı',
      delete: 'Sil',
      save: 'Kaydet',
      cancel: 'Vazgeç',
      clear: 'Temizle',
      create: 'Oluştur',
      search: 'Ara',
      characters: 'karakter',
      words: 'kelime',
      lines: 'satır',
      error: 'Hata',
      success: 'Başarılı',
      close: 'Kapat'
    },
    header: {
      appName: 'QuickDesk',
      saving: 'Kaydediliyor...',
      saved: 'Otomatik Kaydedildi',
      compactMode: 'Kompakt Not Moduna Geç',
      fullMode: 'Tam Boyuta Geç',
      pinWindow: 'Her Zaman Üstte Tut',
      unpinWindow: 'Sabitlemeyi Kaldır',
      pinnedToast: '📌 Pencere üstte sabitlendi',
      unpinnedToast: 'Pencere serbest bırakıldı',
      compactToast: '🗗 Kompakt mod açık',
      normalModeToast: 'Normal moda dönüldü',
      switchLanguage: 'Dili Değiştir'
    },
    nav: {
      notes: 'Notlar',
      snippets: "Snippet'lar",
      tools: 'Araç Kutusu',
      focus: 'Odak & Görevler'
    },
    notes: {
      myNotes: 'Notlarım',
      addNewNote: 'Yeni Not Ekle',
      defaultTitle: 'Yeni Not',
      untitledNote: 'Başlıksız Not',
      emptyNote: 'Boş not...',
      titlePlaceholder: 'Not Başlığı...',
      contentPlaceholder: 'Buraya notlarınızı yazmaya başlayın...',
      noNoteSelected: 'Görüntülenecek not seçilmedi',
      copySuccess: 'Not panoya kopyalandı! 📋',
      noContentToCopy: 'Kopyalanacak içerik bulunmuyor',
      noteCreated: 'Yeni not oluşturuldu',
      minOneNoteWarning: 'En az bir not bulunmalıdır',
      noteDeleted: 'Not silindi',
      deleteNote: 'Notu Sil',
      stats: '{chars} karakter · {words} kelime'
    },
    snippets: {
      searchPlaceholder: 'Snippet ara veya filtrele...',
      newSnippet: 'Yeni Snippet',
      noSnippetsFound: 'Eşleşen snippet bulunamadı.',
      modalTitle: 'Yeni Kod Parçacığı',
      titleLabel: 'Başlık',
      titlePlaceholder: 'Örn: Docker Konteyner Temizle',
      categoryLabel: 'Kategori',
      categoryPlaceholder: 'Örn: Git, Docker, CSS, SQL',
      defaultCategory: 'Genel',
      codeLabel: 'Kod / Metin',
      codePlaceholder: 'Snippet içeriğini buraya girin...',
      fillRequiredFields: 'Lütfen başlık ve kod alanlarını doldurun',
      snippetAdded: 'Yeni snippet eklendi! 🎉',
      snippetDeleted: 'Snippet silindi',
      deleteSnippet: "Snippet'ı Sil",
      copiedToast: '"{title}" kopyalandı! 📋'
    },
    tools: {
      tabs: {
        json: 'JSON Formatlayıcı',
        base64: 'Base64 & URL',
        text: 'Metin Dönüştürücü',
        generators: 'UUID & Parola Üretici'
      },
      json: {
        beautify: 'Biçimlendir (Beautify)',
        minify: 'Sıkıştır (Minify)',
        placeholder: 'JSON verinizi buraya yapıştırın...',
        validJson: 'Geçerli JSON ✔️',
        minified: 'Sıkıştırıldı ✔️',
        errorPrefix: 'Hata:'
      },
      base64: {
        encode: 'Base64 Kodla',
        decode: 'Base64 Çöz',
        urlEncode: 'URL Encode',
        urlDecode: 'URL Decode',
        placeholder: 'Metninizi buraya yazın veya yapıştırın...',
        encodedToast: 'Base64 kodlandı',
        encodeError: 'Kodlama hatası!',
        decodedToast: 'Base64 çözüldü',
        invalidBase64: 'Geçersiz Base64 verisi!',
        urlEncodedToast: 'URL Encode uygulandı',
        urlDecodedToast: 'URL Decode uygulandı',
        invalidUrl: 'Geçersiz URL verisi!'
      },
      text: {
        label: 'Metin',
        uppercase: 'BÜYÜK HARF',
        lowercase: 'küçük harf',
        titlecase: 'Başlık Düzeni',
        camelcase: 'camelCase',
        snakecase: 'snake_case',
        kebabcase: 'kebab-case',
        placeholder: 'Dönüştürmek istediğiniz metni buraya girin...',
        stats: 'Karakter: {chars} | Kelime: {words} | Satır: {lines}'
      },
      generators: {
        uuidTitle: 'Rastgele UUID (v4)',
        generateNew: 'Yeni Üret',
        passwordTitle: 'Güvenli Rastgele Parola',
        passwordLabel: 'Parola',
        passwordPlaceholder: 'Parola üretmek için butona tıklayın...',
        charsUnit: 'Krk',
        generate: 'Üret',
        timestampTitle: 'Unix Zaman Damgası (Timestamp)',
        now: 'Şimdi',
        copiedToast: '{label} kopyalandı! 📋'
      }
    },
    focus: {
      timerTitle: 'Pomodoro Odak Sayacı',
      workTime: 'Çalışma Zamanı 🎯',
      breakTime: 'Mola Zamanı ☕',
      start: 'Başlat',
      pause: 'Duraklat',
      reset: 'Sıfırla',
      workDuration: '25 Dk Çalışma',
      breakDuration: '5 Dk Mola',
      workDoneToast: '🎉 Harika! 25 dakikalık çalışma bitti. 5 dakika mola verin!',
      breakDoneToast: '⚡ Mola bitti! Yeni çalışma turuna başlayabilirsiniz.',
      tasksTitle: 'Günün Görevleri',
      tasksCompleted: '{completed} / {total} Tamamlandı',
      noTasks: 'Henüz görev eklenmedi.',
      addTaskPlaceholder: 'Yeni görev ekle...',
      deleteTask: 'Görevi Sil'
    }
  },
  en: {
    common: {
      copy: 'Copy',
      copied: 'Copied',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      clear: 'Clear',
      create: 'Create',
      search: 'Search',
      characters: 'characters',
      words: 'words',
      lines: 'lines',
      error: 'Error',
      success: 'Success',
      close: 'Close'
    },
    header: {
      appName: 'QuickDesk',
      saving: 'Saving...',
      saved: 'Auto-Saved',
      compactMode: 'Switch to Compact Note Mode',
      fullMode: 'Switch to Full Size',
      pinWindow: 'Keep Always on Top',
      unpinWindow: 'Unpin Window',
      pinnedToast: '📌 Window pinned on top',
      unpinnedToast: 'Window unpinned',
      compactToast: '🗗 Compact mode active',
      normalModeToast: 'Returned to normal mode',
      switchLanguage: 'Switch Language'
    },
    nav: {
      notes: 'Notes',
      snippets: 'Snippets',
      tools: 'Toolbox',
      focus: 'Focus & Tasks'
    },
    notes: {
      myNotes: 'My Notes',
      addNewNote: 'Add New Note',
      defaultTitle: 'New Note',
      untitledNote: 'Untitled Note',
      emptyNote: 'Empty note...',
      titlePlaceholder: 'Note Title...',
      contentPlaceholder: 'Start typing your notes here...',
      noNoteSelected: 'No note selected to display',
      copySuccess: 'Note copied to clipboard! 📋',
      noContentToCopy: 'No content to copy',
      noteCreated: 'New note created',
      minOneNoteWarning: 'At least one note must remain',
      noteDeleted: 'Note deleted',
      deleteNote: 'Delete Note',
      stats: '{chars} characters · {words} words'
    },
    snippets: {
      searchPlaceholder: 'Search or filter snippets...',
      newSnippet: 'New Snippet',
      noSnippetsFound: 'No matching snippets found.',
      modalTitle: 'New Code Snippet',
      titleLabel: 'Title',
      titlePlaceholder: 'e.g. Prune Docker Containers',
      categoryLabel: 'Category',
      categoryPlaceholder: 'e.g. Git, Docker, CSS, SQL',
      defaultCategory: 'General',
      codeLabel: 'Code / Text',
      codePlaceholder: 'Enter snippet content here...',
      fillRequiredFields: 'Please fill in title and code fields',
      snippetAdded: 'New snippet added! 🎉',
      snippetDeleted: 'Snippet deleted',
      deleteSnippet: 'Delete Snippet',
      copiedToast: '"{title}" copied! 📋'
    },
    tools: {
      tabs: {
        json: 'JSON Formatter',
        base64: 'Base64 & URL',
        text: 'Text Converter',
        generators: 'UUID & Password Generator'
      },
      json: {
        beautify: 'Format (Beautify)',
        minify: 'Minify',
        placeholder: 'Paste your JSON data here...',
        validJson: 'Valid JSON ✔️',
        minified: 'Minified ✔️',
        errorPrefix: 'Error:'
      },
      base64: {
        encode: 'Base64 Encode',
        decode: 'Base64 Decode',
        urlEncode: 'URL Encode',
        urlDecode: 'URL Decode',
        placeholder: 'Type or paste your text here...',
        encodedToast: 'Base64 encoded',
        encodeError: 'Encoding error!',
        decodedToast: 'Base64 decoded',
        invalidBase64: 'Invalid Base64 data!',
        urlEncodedToast: 'URL encoded',
        urlDecodedToast: 'URL decoded',
        invalidUrl: 'Invalid URL data!'
      },
      text: {
        label: 'Text',
        uppercase: 'UPPERCASE',
        lowercase: 'lowercase',
        titlecase: 'Title Case',
        camelcase: 'camelCase',
        snakecase: 'snake_case',
        kebabcase: 'kebab-case',
        placeholder: 'Enter text you want to convert here...',
        stats: 'Characters: {chars} | Words: {words} | Lines: {lines}'
      },
      generators: {
        uuidTitle: 'Random UUID (v4)',
        generateNew: 'Generate New',
        passwordTitle: 'Secure Random Password',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Click button to generate password...',
        charsUnit: 'Chars',
        generate: 'Generate',
        timestampTitle: 'Unix Timestamp',
        now: 'Now',
        copiedToast: '{label} copied! 📋'
      }
    },
    focus: {
      timerTitle: 'Pomodoro Focus Timer',
      workTime: 'Focus Time 🎯',
      breakTime: 'Break Time ☕',
      start: 'Start',
      pause: 'Pause',
      reset: 'Reset',
      workDuration: '25 Min Focus',
      breakDuration: '5 Min Break',
      workDoneToast: '🎉 Great job! 25 minutes of focus completed. Take a 5-minute break!',
      breakDoneToast: '⚡ Break over! Ready for the next focus round.',
      tasksTitle: 'Daily Tasks',
      tasksCompleted: '{completed} / {total} Completed',
      noTasks: 'No tasks added yet.',
      addTaskPlaceholder: 'Add new task...',
      deleteTask: 'Delete Task'
    }
  }
} as const

export function getTranslation(
  lang: Language,
  path: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.tr
  const parts = path.split('.')
  let current: unknown = dict

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      // Fallback to Turkish if missing in target language
      let fallback: unknown = translations.tr
      for (const fbPart of parts) {
        if (fallback && typeof fallback === 'object' && fbPart in fallback) {
          fallback = (fallback as Record<string, unknown>)[fbPart]
        } else {
          fallback = undefined
          break
        }
      }
      current = fallback ?? path
      break
    }
  }

  if (typeof current !== 'string') {
    return path
  }

  if (!params) return current

  return current.replace(/\{(\w+)\}/g, (_, key) => {
    return key in params ? String(params[key]) : `{${key}}`
  })
}
