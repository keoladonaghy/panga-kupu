// JSON Validation Test for Māori
const testMaoriJSON = `{
  "welcome": {
    "title": "Pangā Kupu",
    "startButton": "Tīmata",
    "helpButton": "Āwhina"
  },
  "instructions": {
    "title": "Me Pēhea e Tākaro ai",
    "hawaiianToggle": "Te Reo Māori",
    "englishToggle": "English",
    "close": "Kati",
    "steps": {
      "selectLetters": {
        "title": "Kōwhiri Reta:",
        "description": "Pāwhiria ngā pātene huri noa i te wīra kia waihangātia tētahi kupu. Tītohua ēnei reta i roto i te wīra:",
        "vowels": "Ngā oropuare Māori: a, e, i, o, u",
        "longVowels": "Ngā oropuare roa me te tohutō: ā, ē, ī, ō, ū",
        "note": "Ka noho pea ngā reta neke atu i te kotahi puta noa i ngā kupu rereke engāri ka tītohua kotahi anake i roto i te wira.",
        "okina": "Te ngoto: (ʻ)"
      },
      "formingWords": {
        "title": "Te Waihangā Kupu:",
        "correctSpelling": "Me tika te tātaki kupu o ngā kupu te reo Māori, whakamahihia hoki te tohutō me i ngā wā tika.",
        "availableLetters": "Me riro katoa ngā reta o te kupu mai i ngā reta e whitu kei roto i te wīra.",
        "minLength": "Kia X te roa iti o ngā reta (whakamaramatia tēnei roa iti mēnā koia te herengā)."
      },
      "submitAuto": {
        "title": "Tuku Aunoa:",
        "autoAppear": "Ka oti ana tētahi kupu tika, ka kitea aunoatia te kupu i rungā i te wīra.",
        "noSubmit": "Kāore he pātene \\"tuku\\" hei pēhi."
      },
      "editing": {
        "title": "Whakatikatika:",
        "mistake": "I hē koe? Pāwhiritia te pātene mukua i waengānui i te wīra hei tangohia tāu reta mutungā i kōwhiri ai.",
        "keepTapping": "Me pāwhiri tonu i te pātene \\"tuku\\" kia tangohia ngā reta tētahi i muri i tētahi."
      },
      "continue": {
        "title": "Haere Tonu:",
        "afterSuccess": "Ki te kitea tētahi kupu i tika tōna tātaki kupu, me kimi tonu atu!",
        "findAll": "Me ngāna koe ki te whakaatu i ngā kupu katoa kua huna ki te pangā kupu!"
      }
    },
    "tips": {
      "title": "Tohutohu",
      "diacriticals": "Kaua e wareware ki te whakamahi i te tohutō i ngā wā e tika ai — he reta rerekē ēnei.",
      "differences": "He maha ngā kupu Māori i rerekē nā te whakamahia o te tohutō. Kia tūpato:",
      "example": "Hei tauira, he kupu rerekē katoa ēnei: keke, kēkē, kekē.",
      "pronunciation": "Whakarongo ki te whakahua o ngā kupu Māori — he tohu ēnei mō te kupu tika."
    }
  },
  "game": {
    "wordsFound": "Ngā Kupu I Kitea",
    "hintsUsed": "Ngā Tīwhiri  I Whakamahia",
    "currentWord": "Te Kupu O Nāianei",
    "delete": "Muku",
    "hint": "Tīwhiri",
    "refresh": "Kēmu Hōu",
    "upload": "Tuku Ake",
    "debug": "Patuiro",
    "showWords": "Whakaatu Kupu",
    "hideWords": "Huna Kupu",
    "confirmRefresh": {
      "title": "Tīmata Kēmu Hōu?",
      "message": "Mā tēnei koe ka whakatūngia tō whakaahu whakamua, ā, ka tīmata hōu ai he kēmu.",
      "confirm": "Tīmata Hōu",
      "cancel": "Ka Mutu"
    },
    "messages": {
      "wordFound": "ĀNA!",
      "wordFoundDesc": "Kua kitea i a koe te kupu {{word}}!",
      "alreadyFound": "KUA KITEA KĒTIA!",
      "invalidWord": "Ehara tēnā i tētahi kupu tika",
      "tooShort": "He poto rawa te kupu",
      "letterNotAvailable": "Kāore te reta nei i roto i tētahi kupu",
      "threeLetterHint": "Me ngāna ki te kimi i ngā reta mō ngā kupu roa atu!",
      "hintUsed": "Kotahi tīwiri i whakamahia!",
      "hintLetterRevealed": "Te reta i whakakitea: {{letter}}",
      "noHintsLeft": "Kāore he tīwhiri!",
      "celebrationComplete": [
        "Ka Mau Te Wehi!",
        "Kia Ora!",
        "Tino Pai Rawa Atu!",
        "Tino Rawe!"
      ],
      "error": "Kua Hē",
      "failedToLoad": "Kāore i tuku ake tika te kōnae kupu",
      "wordNotFound": "Kāore i kitea tēnei kupu",
      "threeLetterTimeout": "Ka mutu ana tō patopatotanga mō te toru hēkona, ka aromātai ahau ki te kimi i tō kupu. Mena kua patopato koe i tētahi kupu tika,  whakaaturia te kupu e ahau. Ki te kore i tika, ka mukua tāu kupu kia ka taea e koe te ngana anō i tētahi kupu hou.",
      "reminder": "Reminder",
      "hintReminder": "Kaua e wareware, ka whakamahia tētahi tīwiri, ngā tīwiri rānei, ā, ka kitea tēhahi reta, me patopatotia ngā reta katoa kia kitea ai taua kupu!"
    },
    "tooltips": {
      "checkWord": "Hihiratia Te Kupu",
      "refreshGame": "Tīmata i te Panga Hōu",
      "clearWord": "Hihiratia te kupu o nāianei",
      "revealWords": "Whakaaturia ngā kupu katoa",
      "backspace": "Pātene Hokimuri (Pātene Whakakore)"
    },
    "input": {
      "placeholder": "Patopatotia te kupu ki konei..."
    },
    "buttons": {
      "submit": "Tukua"
    }
  },
  "uploader": {
    "title": "Tuku Ake Kōnae Kupu Motuhake",
    "description": "Tukua ake tētahi kōnae kupu Māori (kotahi kupu i ia raina) hei waihangā pangā kupu motuhake.",
    "dragDrop": "Tōia, tukua hoki tētahi kōnae .txt ki konei, pāwhiri rānei ki te pātene kōwhiri",
    "processing": "E whāwhā tukangā ana...",
    "success": "{{count}} kupu i utaina rawatia!",
    "error": "I raruraru te uta kōnae. Me tuku ake anō.",
    "useDefault": "Whakamahia Kupu Taunoa",
    "startGame": "Tīmata i te kēmu ki ngā kupu hou",
    "fileProcessed": "Kua tika te tukanga kōnae",
    "fileProcessedDesc": "{{count}} kupu i kitea",
    "failedToProcess": "Kua hē te tukanga kōnae",
    "invalidFileType": "Ehara tēnei kōnae i te momo kōnae tika",
    "invalidFileTypeDesc": "Tukua ake tētahi kōnae .txt, tētahi kōnae .csv rānei",
    "wordListUpdated": "Whakahoungia te rārangi kupu",
    "wordListUpdatedDesc": "Whakahoungia {{count}} kupu i roto i te rārangi kupu",
    "uploadSuccess": "Kua pai te tukua ake o ngā kupu!",
    "uploadSuccessDesc": "Tukua ake {{count}} kupu. Hihiratia te papatohu mō te rārangi kupu kia kopea ki te kōnae {{fileName}}"
  },
  "languageDropdown": {
    "interfaceLanguage": "Reo Rata",
    "gameLanguage": "Reo Kēmu",
    "hawaiian": "'Ōlelo Hawaiʻi",
    "maori": "Te Reo Māori",
    "tahitian": "Reo Tahiti", 
    "english": "Reo Ingarihi",
    "underDevelopment": "(ka whakawhanaketia nei)",
    "cancel": "Whakakore",
    "ok": "Ae",
    "acknowledgment": "Ngā mihi ki a Mary Boyce nāna ka rārangi kupu e whakamahia i tēnei tanga kupu."
  },
  "loading": "E tukua ake ana ngā kupu Māori..."
}`;

try {
  const parsed = JSON.parse(testMaoriJSON);
  console.log("✅ Māori JSON is valid!");
  console.log("Keys found:", Object.keys(parsed));
  console.log("Added languageDropdown section with keys:", Object.keys(parsed.languageDropdown));
} catch (error) {
  console.error("❌ Māori JSON validation failed:", error.message);
}