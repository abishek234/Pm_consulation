// i18n.js - Complete Configuration file with all languages
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'en-IN': {
    translation: {
      chooseLanguage: 'Choose Your Language',
      languageDescription: 'Select your preferred language for the best experience',
      howProvideInfo: 'How would you like to provide your information?',
      stepByStep: 'Step by Step',
      stepByStepDesc: 'Answer questions one by one',
      voiceInput: 'Voice Input',
      voiceInputDesc: 'Tell us everything at once',
      tellAboutYourself: 'Tell us about yourself',
      speakNaturally: 'Speak naturally about your name, education, skills, interests, and location preferences',
      listening: 'Listening... Speak now',
      processing: 'Processing...',
      processReview: 'Process & Review',
      reviewInfo: 'Review Your Information',
      name: 'Name',
      education: 'Education',
      skills: 'Skills',
      interests: 'Interests',
      preferredLocations: 'Preferred Locations',
      confirmSubmit: 'Confirm & Submit',
      autoSubmitting: 'Auto-submitting in {{count}} seconds...',
      cancel: 'Cancel',
      submitNow: 'Submit Now',
      recommendedInternships: 'Recommended Internships',
      readAloud: 'Read Aloud',
      createNewProfile: 'Create New Profile',
      back: 'Back',
      previous: 'Previous',
      next: 'Next',
      review: 'Review',
      questionOf: 'Question {{current}} of {{total}}',
      addTag: 'Add Tag',
      addedTags: 'Added tags will appear here...',
      useThisText: 'Use This Text',
      clear: 'Clear',
      addAsTags: 'Add as Tags',
      typeAndPress: 'Type and press Enter or comma to add',
      voiceInputBox: 'Voice Input',
      tapToStart: 'Tap to Start',
      speakNaturally2: 'Speak naturally about yourself',
      orTypeInfo: 'Or type your information:',
      tellUsAbout: 'Tell us about your name, education background, skills, career interests, and preferred work locations...',
      questions: {
        name: {
          question: 'What is your name?',
          placeholder: 'e.g., Ananya Sharma'
        },
        education: {
          question: 'What is your educational background?',
          placeholder: 'e.g., B.Sc. Computer Science, 3rd year'
        },
        sector_interests: {
          question: 'Which sectors are you interested in working with?',
          placeholder: 'Select your preferred industry sectors'
        },
        skills: {
          question: 'What technical skills do you have?',
          placeholder: 'Add skills like: Python, JavaScript, React, SQL'
        },
        locationPreferences: {
          question: 'Which locations do you prefer for work?',
          placeholder: 'Add locations like: Chennai, Bangalore, Remote'
        }
      },
    chooseSector:'Choose sectors that interest you...',
    voiceInputNotSupported: 'Voice input is not supported in this browser.',
    voiceInputRecognitionNotAvailable: 'Voice recognition not available.',
    voiceInputUnavailable: 'Voice input is not available for sector selection. Please use the dropdown.',
    selectSectorInterest: 'Select your areas of interest from the official PM Internship Scheme sectors',
    voiceInputPaused: 'Voice input is paused for sector selection. It will resume for the next question.',
    listeningExample: 'Listening... Speak phrases clearly and pause between different items. Example: "Java" (pause) "Python" (pause) "React"',
    detectedText: 'Detected: "{{text}}"',
    sectorSelectionUnavailable: 'Voice input is not available for sector selection. Please use the dropdown.',
    sectorsSelected: '{{count}} sector{{count, plural, one {} other {s}}} selected',
    voiceInputWillResume: 'Voice input will resume for the next question',
    TechnicalInfo:'Add multiple items by typing and pressing Enter or comma. For voice: speak complete phrases clearly and pause between different items.',
    TechnicalInfoNote: ' Note: For technical terms like "C", "C++", "C#", etc - you may need to type them manually if voice recognition does not work well.',
    submitProfile: 'Submit Profile'

    }
  },
  'hi-IN': {
    translation: {
      chooseLanguage: 'अपनी भाषा चुनें',
      languageDescription: 'सर्वोत्तम अनुभव के लिए अपनी पसंदीदा भाषा चुनें',
      howProvideInfo: 'आप अपनी जानकारी कैसे देना चाहते हैं?',
      stepByStep: 'चरणबद्ध',
      stepByStepDesc: 'एक-एक करके प्रश्नों के उत्तर दें',
      voiceInput: 'आवाज़ से इनपुट',
      voiceInputDesc: 'एक साथ सब कुछ बताएं',
      tellAboutYourself: 'अपने बारे में बताएं',
      speakNaturally: 'अपना नाम, शिक्षा, कौशल, रुचियां और स्थान की प्राथमिकताओं के बारे में स्वाभाविक रूप से बोलें',
      listening: 'सुन रहा है... अब बोलें',
      processing: 'प्रसंस्करण...',
      processReview: 'प्रसंस्करण और समीक्षा',
      reviewInfo: 'अपनी जानकारी की समीक्षा करें',
      name: 'नाम',
      education: 'शिक्षा',
      skills: 'कौशल',
      interests: 'रुचियां',
      preferredLocations: 'पसंदीदा स्थान',
      confirmSubmit: 'पुष्टि करें और जमा करें',
      autoSubmitting: '{{count}} सेकंड में ऑटो-सबमिट हो रहा है...',
      cancel: 'रद्द करें',
      submitNow: 'अभी जमा करें',
      recommendedInternships: 'सुझावित इंटर्नशिप',
      readAloud: 'ज़ोर से पढ़ें',
      createNewProfile: 'नया प्रोफाइल बनाएं',
      back: 'वापस',
      previous: 'पिछला',
      next: 'अगला',
      review: 'समीक्षा',
      questionOf: 'प्रश्न {{current}} का {{total}}',
      addTag: 'टैग जोड़ें',
      addedTags: 'जोड़े गए टैग यहां दिखेंगे...',
      useThisText: 'इस टेक्स्ट का उपयोग करें',
      clear: 'साफ़ करें',
      addAsTags: 'टैग के रूप में जोड़ें',
      typeAndPress: 'टाइप करें और Enter या comma दबाएं',
      voiceInputBox: 'आवाज़ इनपुट',
      tapToStart: 'शुरू करने के लिए टैप करें',
      speakNaturally2: 'अपने बारे में स्वाभाविक रूप से बोलें',
      orTypeInfo: 'या अपनी जानकारी टाइप करें:',
      tellUsAbout: 'अपना नाम, शैक्षणिक पृष्ठभूमि, कौशल, करियर रुचियां और पसंदीदा कार्य स्थानों के बारे में बताएं...',
      questions: {
        name: {
          question: 'आपका नाम क्या है?',
          placeholder: 'उदा., अनन्या शर्मा'
        },
        education: {
          question: 'आपकी शैक्षणिक पृष्ठभूमि क्या है?',
          placeholder: 'उदा., B.Sc. कंप्यूटर साइंस, तीसरा वर्ष'
        },
        sector_interests: {
          question: 'आप किन क्षेत्रों में काम करने में रुचि रखते हैं?',
          placeholder: 'अपने पसंदीदा उद्योग क्षेत्रों का चयन करें'
        },
        skills: {
          question: 'आपके पास कौन से तकनीकी कौशल हैं?',
          placeholder: 'कौशल जोड़ें जैसे: Python, JavaScript, React, SQL'
        },
        locationPreferences: {
          question: 'काम के लिए आप कौन से स्थानों को प्राथमिकता देते हैं?',
          placeholder: 'स्थान जोड़ें जैसे: दिल्ली, मुंबई, रिमोट'
        }
      },
      chooseSector:'अपने रुचि के क्षेत्र चुनें...',
      voiceInputNotSupported: 'इस ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है।',
    voiceInputRecognitionNotAvailable: 'आवाज़ मान्यता उपलब्ध नहीं है।',
    voiceInputUnavailable: 'सेक्टर चयन के लिए आवाज इनपुट उपलब्ध नहीं है। कृपया ड्रॉपडाउन का उपयोग करें।',
       selectSectorInterest: 'प्रधानमंत्री इंटर्नशिप योजना के आधिकारिक क्षेत्रों से अपने रुचि के क्षेत्र चुनें',
    voiceInputPaused: 'सेक्टर चयन के लिए आवाज इनपुट रोक दिया गया है। यह अगले प्रश्न के लिए फिर से शुरू होगा।',
    listeningExample: 'सुन रहा है... वाक्यों को स्पष्ट रूप से बोलें और अलग-अलग आइटम के बीच रुकें। उदाहरण: "जावा" (रुकें) "पायथन" (रुकें) "रिएक्ट"',
    detectedText: 'पहचाना गया: "{{text}}"',
    sectorSelectionUnavailable: 'सेक्टर चयन के लिए आवाज इनपुट उपलब्ध नहीं है। कृपया ड्रॉपडाउन का उपयोग करें।',
    sectorsSelected: '{{count}} सेक्टर चुना गया',
    voiceInputWillResume: 'आवाज इनपुट अगले प्रश्न के लिए फिर से शुरू होगा',
    TechnicalInfo:'एकाधिक आइटम जोड़ने के लिए टाइप करें और Enter या कॉमा दबाएं। आवाज़ के लिए: पूर्ण वाक्यांश स्पष्ट रूप से बोलें और अलग-अलग आइटम के बीच रुकें।',
    TechnicalInfoNote: ' नोट: "C", "C++", "C#" जैसे तकनीकी शब्दों के लिए - यदि आवाज़ मान्यता ठीक से काम नहीं करती है तो आपको उन्हें मैन्युअल रूप से टाइप करना पड़ सकता है।',
    submitProfile: 'प्रोफाइल जमा करें'
    }
  },
  'ta-IN': {
    translation: {
      chooseLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
      languageDescription: 'சிறந்த அனுபவத்திற்கு உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
      howProvideInfo: 'உங்கள் தகவலை எப்படி வழங்க விரும்புகிறீர்கள்?',
      stepByStep: 'படிப்படியாக',
      stepByStepDesc: 'ஒவ்வொரு கேள்விக்கும் ஒவ்வொன்றாக பதிலளிக்கவும்',
      voiceInput: 'குரல் உள்ளீடு',
      voiceInputDesc: 'எல்லாவற்றையும் ஒரே நேரத்தில் சொல்லுங்கள்',
      tellAboutYourself: 'உங்களைப் பற்றி சொல்லுங்கள்',
      speakNaturally: 'உங்கள் பெயர், கல்வி, திறன்கள், ஆர்வங்கள் மற்றும் இடம் விருப்பங்களைப் பற்றி இயல்பாக பேசுங்கள்',
      listening: 'கேட்கிறது... இப்போது பேசுங்கள்',
      processing: 'செயலாக்கப்படுகிறது...',
      processReview: 'செயலாக்கம் மற்றும் மதிப்பாய்வு',
      reviewInfo: 'உங்கள் தகவலை மதிப்பாய்வு செய்யுங்கள்',
      name: 'பெயர்',
      education: 'கல்வி',
      skills: 'திறன்கள்',
      interests: 'ஆர்வங்கள்',
      preferredLocations: 'விருப்பமான இடங்கள்',
      confirmSubmit: 'உறுதிப்படுத்தி சமர்ப்பிக்கவும்',
      autoSubmitting: '{{count}} வினாடிகளில் தானாக சமர்ப்பிக்கப்படுகிறது...',
      cancel: 'ரத்து செய்',
      submitNow: 'இப்போது சமர்ப்பிக்கவும்',
      recommendedInternships: 'பரிந்துரைக்கப்பட்ட பயிற்சி',
      readAloud: 'உரக்கப் படிக்கவும்',
      createNewProfile: 'புதிய சுயவிவரம் உருவாக்கவும்',
      back: 'பின்',
      previous: 'முந்தைய',
      next: 'அடுத்த',
      review: 'மதிப்பாய்வு',
      questionOf: 'கேள்வி {{current}} இல் {{total}}',
      addTag: 'டேக் சேர்க்கவும்',
      addedTags: 'சேர்க்கப்பட்ட டேக்குகள் இங்கே தோன்றும்...',
      useThisText: 'இந்த உரையைப் பயன்படுத்தவும்',
      clear: 'அழிக்கவும்',
      addAsTags: 'டேக்களாக சேர்க்கவும்',
      typeAndPress: 'டைப் செய்து Enter அல்லது கமா அழுத்தவும்',
      voiceInputBox: 'குரல் உள்ளீடு',
      tapToStart: 'தொடங்க தட்டவும்',
      speakNaturally2: 'உங்களைப் பற்றி இயல்பாக பேசுங்கள்',
      orTypeInfo: 'அல்லது உங்கள் தகவலை டைப் செய்யவும்:',
      tellUsAbout: 'உங்கள் பெயர், கல்வி பின்னணி, திறன்கள், தொழில் ஆர்வங்கள் மற்றும் விருப்பமான பணி இடங்களைப் பற்றி சொல்லுங்கள்...',
      questions: {
        name: {
          question: 'உங்கள் பெயர் என்ன?',
          placeholder: 'உதா., அனன்யா ஷர்மா'
        },
        education: {
          question: 'உங்கள் கல்வி பின்னணி என்ன?',
          placeholder: 'உதா., B.Sc. கணினி அறிவியல், மூன்றாம் ஆண்டு'
        },
        sector_interests: {
          question: 'நீங்கள் எந்த துறைகளில் பணியாற்ற ஆர்வமாக உள்ளீர்கள்?',
          placeholder: 'உங்கள் விருப்பமான தொழில் துறைகளைத் தேர்ந்தெடுக்கவும்'
        },
        skills: {
          question: 'உங்களிடம் என்ன தொழில்நுட்ப திறன்கள் உள்ளன?',
          placeholder: 'திறன்களைச் சேர்க்கவும்: Python, JavaScript, React, SQL'
        },
        locationPreferences: {
          question: 'வேலைக்கு நீங்கள் எந்த இடங்களை விரும்புகிறீர்கள்?',
          placeholder: 'இடங்களைச் சேர்க்கவும்: சென்னை, பெங்களூர், ரிமோட்'
        }
      },
        chooseSector:'உங்களுக்கு ஆர்வமுள்ள துறைகளைத் தேர்ந்தெடுக்கவும்...',
        voiceInputNotSupported: 'இந்த உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.',
        voiceInputRecognitionNotAvailable: 'குரல் அங்கீகாரம் கிடைக்கவில்லை.',
        voiceInputUnavailable: 'துறை தேர்வுக்கு குரல் உள்ளீடு கிடைக்கவில்லை. தயவுசெய்து கீழ்தோன்றல் பட்டியலைப் பயன்படுத்தவும்.',
       selectSectorInterest: 'பிரதமர் பயிற்சித் திட்டத்தின் அதிகாரப்பூர்வ துறைகளில் இருந்து உங்கள் ஆர்வமுள்ள பகுதிகளைத் தேர்ந்தெடுக்கவும்',
    voiceInputPaused: 'துறை தேர்வுக்கு குரல் உள்ளீடு இடைநிறுத்தப்பட்டது. அடுத்த கேள்விக்கு இது மீண்டும் தொடங்கும்.',
    listeningExample: 'கேட்கிறது... வாக்கியங்களை தெளிவாகப் பேசுங்கள் மற்றும் வெவ்வேறு பொருட்களுக்கு இடையில் இடைநிறுத்துங்கள். எடுத்துக்காட்டு: "ஜாவா" (இடைநிறுத்தம்) "பைதான்" (இடைநிறுத்தம்) "ரியாக்ட்"',
    detectedText: 'கண்டறியப்பட்டது: "{{text}}"',
    sectorSelectionUnavailable: 'துறை தேர்வுக்கு குரல் உள்ளீடு கிடைக்கவில்லை. தயவுசெய்து கீழ்தோன்றல் பட்டியலைப் பயன்படுத்தவும்.',
    sectorsSelected: '{{count}} துறை தேர்ந்தெடுக்கப்பட்டது',
    voiceInputWillResume: 'குரல் உள்ளீடு அடுத்த கேள்விக்கு மீண்டும் தொடங்கும்',
    TechnicalInfo:'Enter அல்லது comma அழுத்தி பல பொருட்களைச் சேர்க்கவும். குரலுக்கு: முழு வாக்கியங்களை தெளிவாகப் பேசுங்கள் மற்றும் வெவ்வேறு பொருட்களுக்கு இடைநிறுத்துங்கள்.',
    TechnicalInfoNote: ' குறிப்பு: "C", "C++", "C#" போன்ற தொழில்நுட்ப சொற்களுக்கு - குரல் அங்கீகாரம் நன்றாக வேலை செய்யவில்லை என்றால் நீங்கள் அவற்றை கைமுறையாக டைப் செய்ய வேண்டியிருக்கலாம்.',
    submitProfile: 'சுயவிவரத்தை சமர்ப்பிக்கவும்'
    }
  },

};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en-IN', // default language
    fallbackLng: 'en-IN',
    interpolation: {
      escapeValue: false // React already does escaping
    }
  });

export default i18n;