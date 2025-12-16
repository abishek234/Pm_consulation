import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import '../i18n';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Box,
  Grid,
  Paper,
  IconButton,
  LinearProgress,
  Alert,
  CircularProgress,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MonetizationOnIcon,
  DateRange as DateRangeIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import Iconify from '../components/Iconify';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #e9ecef',
  overflow: 'hidden',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    '& fieldset': {
      borderColor: '#e9ecef',
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: '#dee2e6',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5B7FE8',
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '1rem',
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  boxShadow: '0 4px 12px rgba(91, 127, 232, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#4865D8',
    boxShadow: '0 6px 20px rgba(91, 127, 232, 0.4)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    backgroundColor: '#dee2e6',
    color: '#6c757d',
  },
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '1rem',
  color: '#5B7FE8',
  border: '2px solid #5B7FE8',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(91, 127, 232, 0.08)',
    borderColor: '#4865D8',
  },
}));

const LanguageButton = styled(Button)(({ theme, selected }) => ({
  borderRadius: 16,
  padding: theme.spacing(3, 4),
  minWidth: 150,
  height: 100,
  border: selected ? '3px solid #5B7FE8' : '2px solid #e9ecef',
  backgroundColor: selected ? 'rgba(91, 127, 232, 0.08)' : '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#5B7FE8',
    backgroundColor: 'rgba(91, 127, 232, 0.08)',
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(91, 127, 232, 0.2)',
  },
}));

const TagChip = styled(Chip)(({ theme }) => ({
  borderRadius: 10,
  fontWeight: 600,
  fontSize: '0.875rem',
  height: 36,
}));

const InternshipCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  border: '1px solid #e9ecef',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#5B7FE8',
    boxShadow: '0 8px 32px rgba(91, 127, 232, 0.16)',
    transform: 'translateY(-4px)',
  },
}));

const MatchBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.875rem',
  height: 32,
  borderRadius: 10,
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
  padding: theme.spacing(2),
  border: '1px solid #e9ecef',
  marginBottom: theme.spacing(2),
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    padding: theme.spacing(1),
  },
}));

const StudentProfileCreation = () => {
  const { t, i18n } = useTranslation();
  
  // Core state
  const [currentStep, setCurrentStep] = useState('language');
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [stepHistory, setStepHistory] = useState(['language']);
  const [micPersistentMode, setMicPersistentMode] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    id: localStorage.getItem('id'),
    name: '',
    education: '',
    skills: [],
    sector_interests: [],
    preferred_locations: [],
    language: 'en-IN'
  });

  // Step-by-step states
  const [stepData, setStepData] = useState({
    currentQuestion: 0,
    answers: {}
  });

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentTags, setCurrentTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Sector management states
  const [availableSectors, setAvailableSectors] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceBuffer, setVoiceBuffer] = useState('');
  const [lastProcessedLength, setLastProcessedLength] = useState(0);
  const [voiceDisabledForQuestion, setVoiceDisabledForQuestion] = useState(false);

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const voiceTimeoutRef = useRef(null);

  // Language options
  const languages = [
    { code: 'en-IN', name: 'English', flag: '🇮🇳' },
    { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
  ];

  const questionKeys = ['name', 'education', 'sector_interests', 'skills', 'locationPreferences'];
  const token = localStorage.getItem('token');

  // Fetch sectors on component mount
  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    setLoadingSectors(true);
    try {
      const response = await axios.get('https://pm-consulation.onrender.com/api/sectors');
      setAvailableSectors(response.data.sectors || []);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      toast.error('Failed to load sectors');
    } finally {
      setLoadingSectors(false);
    }
  };

  const processVoiceForTags = (text) => {
    const cleanText = text.toLowerCase().trim();
    const phrases = cleanText.split(/[,;.!?]+/).map(phrase => phrase.trim()).filter(phrase => phrase.length > 0);
    
    phrases.forEach(phrase => {
      const subPhrases = phrase.split(/\s+(?:and|or|also|plus)\s+/).map(p => p.trim()).filter(p => p.length > 2);
      
      subPhrases.forEach(subPhrase => {
        const cleanPhrase = subPhrase
          .replace(/\b(i\s+like|i\s+want|i\s+am\s+interested\s+in|my\s+interest\s+is)\b/g, '')
          .replace(/\b(the|a|an|in|on|at|to|for|with|by)\b/g, '')
          .trim();
        
        if (cleanPhrase.length > 2 && !currentTags.some(tag => 
          tag.toLowerCase().includes(cleanPhrase) || cleanPhrase.includes(tag.toLowerCase())
        )) {
          setCurrentTags(prev => [...prev, cleanPhrase]);
        }
      });
    });
  };

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setVoiceSupported(true);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = selectedLanguage;

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i+=1) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          const currentQuestionKey = questionKeys[stepData.currentQuestion];
          const isTagQuestion = ['skills', 'locationPreferences'].includes(currentQuestionKey);
          
          if (isTagQuestion) {
            const fullText = finalTranscript + interimTranscript;
            setVoiceBuffer(fullText);
            
            if (voiceTimeoutRef.current) {
              clearTimeout(voiceTimeoutRef.current);
            }
            
            if (finalTranscript.trim()) {
              processVoiceForTags(finalTranscript);
              setLastProcessedLength(finalTranscript.length);
            }
            
            voiceTimeoutRef.current = setTimeout(() => {
              const newContent = fullText.substring(lastProcessedLength);
              if (newContent.trim().length > 5) {
                processVoiceForTags(newContent);
                setLastProcessedLength(fullText.length);
              }
            }, 1500);
            
          } else if (finalTranscript.trim()) {
            setCurrentAnswer(prev => {
              const newText = prev + (prev ? ' ' : '') + finalTranscript;
              return newText;
            });
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          switch(event.error) {
            case 'not-allowed':
              toast.error('Microphone permission denied');
              break;
            case 'no-speech':
              toast.warning('No speech detected');
              break;
            case 'network':
              toast.error('Network error');
              break;
            default:
              toast.error('Voice recognition error');
          }
        };

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setVoiceBuffer('');
          setLastProcessedLength(0);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (voiceTimeoutRef.current) {
            clearTimeout(voiceTimeoutRef.current);
          }
          
          if (micPersistentMode && !voiceDisabledForQuestion) {
            const currentQuestionKey = questionKeys[stepData.currentQuestion];
            if (currentQuestionKey !== 'sector_interests') {
              setTimeout(() => {
                if (recognitionRef.current && !isListening) {
                  try {
                    recognitionRef.current.start();
                  } catch (error) {
                    setMicPersistentMode(false);
                  }
                }
              }, 100);
            }
          }
        };
      } else {
        setVoiceSupported(false);
      }
    };

    initializeSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, [selectedLanguage, stepData.currentQuestion, currentTags, lastProcessedLength]);

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setSelectedLanguage(langCode);
    setProfileData(prev => ({ ...prev, language: langCode }));
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = langCode;
    }
  };

  const navigateToStep = (step) => {
    setStepHistory(prev => [...prev, step]);
    setCurrentStep(step);
  };

  const goBack = () => {
    if (currentStep === 'step-by-step' && stepData.currentQuestion > 0) {
      const prevQuestion = stepData.currentQuestion - 1;
      const prevAnswers = { ...stepData.answers };
      delete prevAnswers[questionKeys[stepData.currentQuestion]];
      
      setStepData({
        currentQuestion: prevQuestion,
        answers: prevAnswers
      });
      
      const prevQuestionKey = questionKeys[prevQuestion];
      const prevAnswer = stepData.answers[prevQuestionKey];
      
      if (prevQuestionKey === 'sector_interests') {
        const sectorsToSelect = Array.isArray(prevAnswer) 
          ? prevAnswer.map(id => availableSectors.find(s => s._id === id)).filter(Boolean)
          : [];
        setSelectedSectors(sectorsToSelect);
        setCurrentAnswer('');
        setCurrentTags([]);
        setTagInput('');
      } else if (prevQuestionKey === 'skills' || prevQuestionKey === 'locationPreferences') {
        setCurrentTags(Array.isArray(prevAnswer) ? prevAnswer : []);
        setCurrentAnswer('');
        setTagInput('');
        setSelectedSectors([]);
      } else {
        setCurrentAnswer(prevAnswer || '');
        setCurrentTags([]);
        setSelectedSectors([]);
      }
      setVoiceBuffer('');
      setLastProcessedLength(0);
      return;
    }

    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory];
      newHistory.pop();
      const previousStep = newHistory[newHistory.length - 1];
      setStepHistory(newHistory);
      setCurrentStep(previousStep);
    }
  };

  const canGoBack = () => {
    if (currentStep === 'language') return false;
    if (currentStep === 'recommendations') return false;
    if (currentStep === 'step-by-step' && stepData.currentQuestion === 0 && stepHistory.length <= 1) return false;
    return true;
  };

  const startVoiceRecognition = async () => {
    const currentQuestionKey = questionKeys[stepData.currentQuestion];
    if (currentQuestionKey === 'sector_interests') {
      toast.info(t('voiceInputUnavailable'));
      return;
    }

    if (!voiceSupported) {
      toast.error(t('voiceInputNotSupported'));
      return;
    }

    if (!recognitionRef.current) {
      toast.error(t('voiceInputRecognitionNotAvailable'));
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isListening) {
        setVoiceBuffer('');
        setLastProcessedLength(0);
        setVoiceDisabledForQuestion(false);
        setMicPersistentMode(true);
        recognitionRef.current.start();
      }
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone permission denied');
      } else {
        toast.error('Unable to access microphone');
      }
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      setMicPersistentMode(false);
      setVoiceDisabledForQuestion(true);
      recognitionRef.current.stop();
    }
  };

  const addTag = (value = tagInput) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !currentTags.some(tag => 
      tag.toLowerCase() === trimmedValue.toLowerCase()
    )) {
      setCurrentTags(prev => [...prev, trimmedValue]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setCurrentTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  };

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    navigateToStep('step-by-step');
  };

  const handleStepAnswer = (answer) => {
    const currentQuestionKey = questionKeys[stepData.currentQuestion];
    let processedAnswer = answer;
    
    if (currentQuestionKey === 'sector_interests') {
      processedAnswer = selectedSectors.map(sector => sector._id);
    } else if (currentQuestionKey === 'skills' || currentQuestionKey === 'locationPreferences') {
      processedAnswer = currentTags;
    }
    
    const newAnswers = { ...stepData.answers, [currentQuestionKey]: processedAnswer };
    
    if (stepData.currentQuestion < questionKeys.length - 1) {
      setStepData({
        currentQuestion: stepData.currentQuestion + 1,
        answers: newAnswers
      });
      
      const nextQuestionKey = questionKeys[stepData.currentQuestion + 1];
      
      if (micPersistentMode) {
        setVoiceDisabledForQuestion(false);
      }
      
      if (nextQuestionKey === 'sector_interests') {
        setCurrentAnswer('');
        setCurrentTags([]);
        setTagInput('');
        setSelectedSectors([]);
      } else if (nextQuestionKey === 'skills' || nextQuestionKey === 'locationPreferences') {
        setCurrentAnswer('');
        setCurrentTags([]);
        setTagInput('');
        setSelectedSectors([]);
      } else {
        setCurrentAnswer('');
        setCurrentTags([]);
        setSelectedSectors([]);
      }
      setVoiceBuffer('');
      setLastProcessedLength(0);
    } else {
      processStepByStepAnswers(newAnswers);
    }
  };

  const processStepByStepAnswers = (answers) => {
    setProfileData(prev => ({
      ...prev,
      name: answers.name || 'Student',
      education: answers.education || 'Not specified',
      skills: answers.skills || [],
      sector_interests: answers.sector_interests || [],
      preferred_locations: answers.locationPreferences || []
    }));

    navigateToStep('review');
  };

  const submitProfile = async () => {
    try {
      setIsLoadingRecommendations(true);

      await axios.post(
        'https://pm-consulation.onrender.com/api/auth/profile/create',
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const userId = localStorage.getItem('id');
      const recommendationsResponse = await axios.get(
        `https://pm-consulation.onrender.com/api/internships/recommendations/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecommendations(recommendationsResponse.data.recommendations || []);
      navigateToStep('recommendations');
      toast.success('Profile created successfully!');

    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Error creating profile');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleViewDetails = (internship) => {
    setSelectedInternship(internship);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedInternship(null);
  };

  const renderBackButton = () => {
    if (!canGoBack()) return null;
    return (
      <OutlinedButton startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mb: 2 }}>
        {t('back')}
      </OutlinedButton>
    );
  };

  const renderUnifiedInput = () => {
    const currentQuestionKey = questionKeys[stepData.currentQuestion];
    
    if (currentQuestionKey === 'sector_interests') {
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
            {t('selectSectorInterest')}
          </Typography>
          
          {micPersistentMode && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              {t('voiceInputPaused')}
            </Alert>
          )}
          
          {loadingSectors ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={40} sx={{ color: '#5B7FE8' }} />
            </Box>
          ) : (
            <Autocomplete
              multiple
              options={availableSectors}
              getOptionLabel={(option) => option.name}
              value={selectedSectors}
              onChange={(event, newValue) => setSelectedSectors(newValue)}
              renderInput={(params) => (
                <StyledTextField
                  {...params}
                  label={t('selectSectorInterest')}
                  placeholder={t('chooseSectors')}
                  helperText={t('voiceInputWillResume')}
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <TagChip label={option.name} {...getTagProps({ index })} key={option._id} color="secondary" />
                ))
              }
            />
          )}
          
          {selectedSectors.length > 0 && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t('sectorsSelected', { count: selectedSectors.length })}
              </Typography>
            </Alert>
          )}
        </Box>
      );
    }

    const isTagQuestion = ['skills', 'locationPreferences'].includes(currentQuestionKey);

    if (!isTagQuestion) {
      return (
        <Box>
          <StyledTextField
            fullWidth
            multiline
            rows={3}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={t(`questions.${currentQuestionKey}.placeholder`)}
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: voiceSupported && (
                <IconButton
                  color={isListening ? 'error' : 'primary'}
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  sx={{ 
                    bgcolor: isListening ? 'rgba(255, 86, 48, 0.12)' : 'rgba(91, 127, 232, 0.12)',
                    '&:hover': {
                      bgcolor: isListening ? 'rgba(255, 86, 48, 0.2)' : 'rgba(91, 127, 232, 0.2)'
                    }
                  }}
                >
                  {isListening ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              )
            }}
          />
          
          {isListening && (
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF5630', animation: 'pulse 1s infinite' }} />
              <Typography variant="body2" sx={{ color: '#FF5630', fontWeight: 600 }}>
                {t('listening')}
              </Typography>
            </Box>
          )}
        </Box>
      );
    } 
    
    return (
      <Box sx={{ mt: 2 }}>
        <Box display="flex" gap={1} mb={2}>
          <StyledTextField
            fullWidth
            size="medium"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            placeholder={t('typeAndPress')}
            InputProps={{
              endAdornment: voiceSupported && (
                <IconButton
                  color={isListening ? 'error' : 'primary'}
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  sx={{ 
                    bgcolor: isListening ? 'rgba(255, 86, 48, 0.12)' : 'rgba(91, 127, 232, 0.12)',
                    '&:hover': {
                      bgcolor: isListening ? 'rgba(255, 86, 48, 0.2)' : 'rgba(91, 127, 232, 0.2)'
                    }
                  }}
                >
                  {isListening ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              )
            }}
          />
          <PrimaryButton onClick={() => addTag()} disabled={!tagInput.trim()} startIcon={<AddIcon />}>
            {t('addTag')}
          </PrimaryButton>
        </Box>
        
        {isListening && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              🎤 {t('listeningExample')}
            </Typography>
            {voiceBuffer && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                {t('detectedText', { text: voiceBuffer })}
              </Typography>
            )}
          </Alert>
        )}
        
        <Box sx={{ 
          minHeight: '80px',
          border: '2px dashed #e9ecef',
          borderRadius: 2,
          p: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          bgcolor: '#f8f9fa',
          alignItems: 'flex-start'
        }}>
          {currentTags.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              {t('addedTags')}
            </Typography>
          ) : (
            currentTags.map((tag, index) => (
              <TagChip key={index} label={tag} onDelete={() => removeTag(tag)} deleteIcon={<CloseIcon />} color="primary" />
            ))
          )}
        </Box>
      </Box>
    );
  };

  const renderLanguageSelection = () => (
    <StyledCard>
      <CardContent sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: '#1a1a1a' }}>
          {t('chooseLanguage')}
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          {t('languageDescription')}
        </Typography>
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
          {languages.map((lang) => (
            <Grid item key={lang.code}>
              <LanguageButton selected={selectedLanguage === lang.code} onClick={() => handleLanguageSelect(lang.code)}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ mb: 1 }}>{lang.flag}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{lang.name}</Typography>
                </Box>
              </LanguageButton>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </StyledCard>
  );

  const renderStepByStep = () => {
    const currentQuestionKey = questionKeys[stepData.currentQuestion];
    const isSectorQuestion = currentQuestionKey === 'sector_interests';
    const isTagQuestion = ['skills', 'locationPreferences'].includes(currentQuestionKey);

    return (
      <StyledCard>
        <CardContent sx={{ py: 4 }}>
          {renderBackButton()}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress 
                variant="determinate" 
                value={(stepData.currentQuestion / questionKeys.length) * 100}
                sx={{
                  height: 8,
                  borderRadius: 2,
                  bgcolor: '#e9ecef',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#5B7FE8',
                    borderRadius: 2
                  }
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontWeight: 600 }}>
              {t('questionOf', { current: stepData.currentQuestion + 1, total: questionKeys.length })}
            </Typography>
          </Box>
          
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            {t(`questions.${currentQuestionKey}.question`)}
          </Typography>
          
          {isSectorQuestion && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              {t('selectSectorInterest')} {t('sectorSelectionUnavailable')}
            </Typography>
          )}

          {isTagQuestion && !isSectorQuestion && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              {t('TechnicalInfo')} {t('TechnicalInfoNote')}
            </Typography>
          )}

          {renderUnifiedInput()}
          
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            {stepData.currentQuestion > 0 && (
              <OutlinedButton startIcon={<ArrowBackIcon />} onClick={goBack}>
                {t('previous')}
              </OutlinedButton>
            )}
            <PrimaryButton
              size="large"
              onClick={() => {
                if (isSectorQuestion) {
                  handleStepAnswer(selectedSectors);
                } else if (isTagQuestion) {
                  handleStepAnswer(currentTags);
                } else {
                  handleStepAnswer(currentAnswer);
                }
              }}
              disabled={(() => {
                if (isSectorQuestion) return selectedSectors.length === 0;
                if (isTagQuestion) return currentTags.length === 0;
                return !currentAnswer.trim();
              })()}
              sx={{ flex: 1 }}
            >
              {stepData.currentQuestion < questionKeys.length - 1 ? t('next') : t('review')}
            </PrimaryButton>
          </Box>
        </CardContent>
      </StyledCard>
    );
  };

  const renderReview = () => {
    const displaySectors = stepData.answers.sector_interests?.map(sectorId => {
      const sector = availableSectors.find(s => s._id === sectorId);
      return sector ? sector.name : 'Unknown Sector';
    }) || [];

    return (
      <StyledCard>
        <CardContent sx={{ py: 4 }}>
          {renderBackButton()}
          <Typography variant="h3" gutterBottom textAlign="center" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 4 }}>
            {t('reviewInfo')}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <InfoBox>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#5B7FE8', mb: 1 }}>{t('name')}</Typography>
                <Typography variant="h6">{profileData.name}</Typography>
              </InfoBox>
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoBox>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#5B7FE8', mb: 1 }}>{t('education')}</Typography>
                <Typography variant="h6">{profileData.education}</Typography>
              </InfoBox>
            </Grid>
            <Grid item xs={12}>
              <InfoBox>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#5B7FE8', mb: 2 }}>{t('skills')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileData.skills.map((skill, index) => (
                    <TagChip key={index} label={skill} color="primary" />
                  ))}
                </Box>
              </InfoBox>
            </Grid>
            <Grid item xs={12}>
              <InfoBox>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#8E33FF', mb: 2 }}>Sector Interests</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {displaySectors.map((sectorName, index) => (
                    <TagChip key={index} label={sectorName} color="secondary" />
                  ))}
                </Box>
              </InfoBox>
            </Grid>
            <Grid item xs={12}>
              <InfoBox>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#00B8D9', mb: 2 }}>{t('preferredLocations')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileData.preferred_locations.map((location, index) => (
                    <TagChip key={index} label={location} color="info" />
                  ))}
                </Box>
              </InfoBox>
            </Grid>
          </Grid>

          <Box textAlign="center" sx={{ mt: 4 }}>
            <PrimaryButton size="large" onClick={submitProfile} startIcon={<CheckIcon />}>
              {t('submitProfile')}
            </PrimaryButton>
          </Box>
        </CardContent>
      </StyledCard>
    );
  };

  const renderInternshipDetailsDialog = () => {
    if (!selectedInternship) return null;

    return (
      <StyledDialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#5B7FE8' }}>
                {selectedInternship.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedInternship.company}
              </Typography>
              <Box display="flex" alignItems="center" mt={1.5} gap={1}>
                <MatchBadge label={`${selectedInternship.matchScore}% Match`} />
                <Chip label={selectedInternship.job_id} variant="outlined" size="small" />
              </Box>
            </Box>
            <IconButton onClick={handleCloseDetailsDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="eva:briefcase-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                    Job Details
                  </Typography>
                  
                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Location</Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: '#5B7FE8' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedInternship.location}
                      </Typography>
                      {selectedInternship.remote_ok && <Chip label="Remote" size="small" color="success" sx={{ ml: 1 }} />}
                    </Box>
                  </InfoBox>

                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Duration</Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <ScheduleIcon fontSize="small" sx={{ mr: 1, color: '#5B7FE8' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedInternship.duration}</Typography>
                    </Box>
                  </InfoBox>

                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Stipend</Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <MonetizationOnIcon fontSize="small" sx={{ mr: 1, color: '#36B37E' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#36B37E' }}>
                        {selectedInternship.stipend?.amount > 0 ? `₹${selectedInternship.stipend.amount.toLocaleString()}/month` : 'Unpaid'}
                      </Typography>
                    </Box>
                  </InfoBox>

                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Deadline</Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <DateRangeIcon fontSize="small" sx={{ mr: 1, color: '#FF5630' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(selectedInternship.applicationDeadline).toLocaleDateString('en-IN')}
                      </Typography>
                    </Box>
                  </InfoBox>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="eva:code-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                    Requirements
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 1 }}>Skills Required</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedInternship.skills_required?.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  {selectedInternship.sectors && selectedInternship.sectors.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 1 }}>Industry Sectors</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedInternship.sectors.map((sector, index) => (
                          <Chip key={index} label={sector.name} size="small" color="secondary" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 1 }}>Education</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedInternship.eligibility?.education && selectedInternship.eligibility.education.length > 0 ? (
                        selectedInternship.eligibility.education.map((edu, index) => (
                          <Chip key={index} label={edu} size="small" color="default" variant="outlined" />
                        ))
                      ) : (
                        <Chip label="Any education level" size="small" color="success" />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="eva:file-text-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                    Job Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                    {selectedInternship.description}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12}>
              <StyledCard sx={{ bgcolor: 'rgba(54, 179, 126, 0.08)', border: '1px solid #36B37E' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#36B37E', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon />
                    Why This Matches ({selectedInternship.matchScore}%)
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon sx={{ color: '#36B37E' }} fontSize="small" /></ListItemIcon>
                      <ListItemText primary={selectedInternship.matchDetails?.skills || 'Skills match'} primaryTypographyProps={{ color: '#36B37E', fontWeight: 600 }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon sx={{ color: '#36B37E' }} fontSize="small" /></ListItemIcon>
                      <ListItemText primary={selectedInternship.matchDetails?.location || 'Location preference'} primaryTypographyProps={{ color: '#36B37E', fontWeight: 600 }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon sx={{ color: '#36B37E' }} fontSize="small" /></ListItemIcon>
                      <ListItemText primary={selectedInternship.matchDetails?.sectors || 'Sector interest'} primaryTypographyProps={{ color: '#36B37E', fontWeight: 600 }} />
                    </ListItem>
                  </List>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <OutlinedButton onClick={handleCloseDetailsDialog}>Close</OutlinedButton>
          <PrimaryButton startIcon={<SendIcon />} onClick={() => window.open(selectedInternship.websiteLink, '_blank')}>
            Apply Now
          </PrimaryButton>
        </DialogActions>
      </StyledDialog>
    );
  };

  const renderRecommendations = () => {
    const getRecommendationsContent = () => {
      if (isLoadingRecommendations) {
        return (
          <Box textAlign="center" sx={{ py: 6 }}>
            <CircularProgress size={60} sx={{ color: '#5B7FE8', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {t('findingMatches')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyzing your profile for perfect matches
            </Typography>
          </Box>
        );
      }
      
      if (recommendations.length > 0) {
        return (
          <>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontWeight: 600 }}>
              Found {recommendations.length} internship{recommendations.length > 1 ? 's' : ''} matching your profile
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {recommendations.map((internship, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <InternshipCard>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#5B7FE8' }}>
                          {internship.title}
                        </Typography>
                        <MatchBadge label={`${internship.matchScore || 85}%`} size="small" />
                      </Box>
                      
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {internship.company}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" mb={2}>
                        <LocationIcon fontSize="small" sx={{ mr: 1, color: '#6c757d' }} />
                        <Typography variant="body2" color="text.secondary">
                          {internship.location}
                          {internship.remote_ok && <Chip label="Remote" size="small" color="success" sx={{ ml: 1, height: 20 }} />}
                        </Typography>
                      </Box>

                      {internship.sectors && internship.sectors.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {internship.sectors.map((sector, idx) => (
                              <Chip key={idx} label={sector.name} size="small" color="secondary" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ bgcolor: 'rgba(54, 179, 126, 0.08)', p: 1.5, borderRadius: 2, border: '1px solid rgba(54, 179, 126, 0.3)' }}>
                        <Typography variant="caption" sx={{ color: '#36B37E', fontWeight: 700, display: 'block', mb: 0.5 }}>
                          Why this matches:
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#36B37E', display: 'block' }}>
                          ✓ {internship.matchDetails?.skills || 'Skills'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#36B37E', display: 'block' }}>
                          ✓ {internship.matchDetails?.location || 'Location'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#36B37E', display: 'block' }}>
                          ✓ {internship.matchDetails?.sectors || 'Sector'}
                        </Typography>
                      </Box>

                      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                        {internship.stipend?.amount > 0 ? (
                          <Chip label={`₹${internship.stipend.amount}/mo`} size="small" sx={{ bgcolor: '#36B37E', color: '#fff', fontWeight: 600 }} />
                        ) : (
                          <Chip label="Unpaid" size="small" variant="outlined" />
                        )}
                        {internship.duration && <Chip label={internship.duration} size="small" color="info" variant="outlined" />}
                      </Box>

                      {internship.applicationDeadline && (
                        <Typography variant="caption" sx={{ color: '#FF5630', fontWeight: 600, display: 'block', mt: 1 }}>
                          Deadline: {new Date(internship.applicationDeadline).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <OutlinedButton startIcon={<VisibilityIcon />} onClick={() => handleViewDetails(internship)} fullWidth size="small" sx={{ mb: 1 }}>
                        View Details
                      </OutlinedButton>
                      <PrimaryButton startIcon={<SendIcon />} onClick={() => window.open(internship.websiteLink, '_blank')} fullWidth size="small">
                        Apply Now
                      </PrimaryButton>
                    </Box>
                  </InternshipCard>
                </Grid>
              ))}
            </Grid>
            {renderInternshipDetailsDialog()}
          </>
        );
      }
      
      return (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} gutterBottom>
            No matching internships found
          </Typography>
          <Typography variant="body2">
            New internships are added regularly. We'll notify you when perfect matches become available!
          </Typography>
        </Alert>
      );
    };

    return (
      <StyledCard>
        <CardContent sx={{ py: 4 }}>
          <Typography variant="h3" gutterBottom textAlign="center" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 4 }}>
            {t('recommendedInternships')}
          </Typography>
          
          {getRecommendationsContent()}

          <Box textAlign="center" sx={{ mt: 4 }}>
            <PrimaryButton
              size="large"
              onClick={() => {
                setCurrentStep('language');
                setStepHistory(['language']);
                setProfileData({
                  id: localStorage.getItem('id'),
                  name: '',
                  education: '',
                  skills: [],
                  sector_interests: [],
                  preferred_locations: [],
                  language: 'en-IN'
                });
                setStepData({ currentQuestion: 0, answers: {} });
                setRecommendations([]);
                setCurrentAnswer('');
                setCurrentTags([]);
                setSelectedSectors([]);
                setTagInput('');
                setVoiceBuffer('');
                setLastProcessedLength(0);
                setVoiceDisabledForQuestion(false);
              }}
            >
              {t('createNewProfile')}
            </PrimaryButton>
          </Box>
        </CardContent>
      </StyledCard>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {currentStep === 'language' && renderLanguageSelection()}
      {currentStep === 'step-by-step' && renderStepByStep()}
      {currentStep === 'review' && renderReview()}
      {currentStep === 'recommendations' && renderRecommendations()}
    </Container>
  );
};

export default StudentProfileCreation;