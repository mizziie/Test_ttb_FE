export type QuestionType = 'text' | 'radio' | 'checkbox' | 'textarea' | 'rank';

export interface ChoiceOption {
  id: string;
  text: string;
}

export interface RankQuestion {
  type: 'rank';
  title: string;
  settings: {
    key: string;
    value: string;
  }[];
}

export interface RadioQuestion {
  type: 'radio';
  title: string;
  choices: {
    title: string;
    value: string;
  }[];
  settings: {
    key: string;
    value: string;
  }[];
}

export interface TextQuestion {
  type: 'text';
  title: string;
  settings: {
    key: string;
    value: string;
  }[];
}

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'rank';
  text: string;
  required: boolean;
  options?: ChoiceOption[];
  settings?: {
    key: string;
    value: string;
  }[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  value: string | string[];
}

export interface SurveyResponse {
  surveyId: string;
  answers: Record<string, any>;
} 