import { SurveyResponse, Answer } from '../types/survey';

const isClient = typeof window !== 'undefined';

const STORAGE_KEY_PREFIX = 'survey_';

export function saveProgress(surveyId: string, data: any, currentStep: number) {
  if (!isClient) return false;
  
  try {
    const progressData = {
      answers: data,
      currentStep: currentStep,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`survey_progress_${surveyId}`, JSON.stringify(progressData));
    return true;
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
    return false;
  }
}

export function loadProgress(surveyId: string): { answers: any, currentStep: number } | null {
  if (!isClient) return null;
  
  try {
    const data = localStorage.getItem(`survey_progress_${surveyId}`);
    if (!data) return null;
    
    const progressData = JSON.parse(data);
    return {
      answers: progressData.answers,
      currentStep: progressData.currentStep || 1
    };
  } catch (error) {
    console.error('Error loading progress from localStorage:', error);
    return null;
  }
}

export function clearProgress(surveyId: string) {
  if (!isClient) return false;
  
  try {
    localStorage.removeItem(`survey_progress_${surveyId}`);
    return true;
  } catch (error) {
    console.error('Error clearing progress from localStorage:', error);
    return false;
  }
}

export function storeResponses(surveyId: string, answers: Answer[]) {
  if (!isClient) return false;
  
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${surveyId}`, JSON.stringify(answers));
    return true;
  } catch (error) {
    console.error('Error storing responses in localStorage:', error);
    return false;
  }
}

export function getStoredResponses(surveyId: string): Answer[] | null {
  if (!isClient) return null;
  
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${surveyId}`);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving responses from localStorage:', error);
    return null;
  }
}

export function clearAllSurveyData(surveyId: string) {
  if (!isClient) return false;
  
  try {
    // ลบข้อมูลความคืบหน้า
    localStorage.removeItem(`survey_progress_${surveyId}`);
    // ลบข้อมูลคำตอบ
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${surveyId}`);
    return true;
  } catch (error) {
    console.error('Error clearing all survey data:', error);
    return false;
  }
} 