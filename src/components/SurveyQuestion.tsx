'use client';

import { useState, useEffect } from 'react';
import { Question, Answer } from '../types/survey';

interface SurveyQuestionProps {
  question: Question;
  currentAnswer?: string;
  onAnswerChange: (value: string) => void;
}

export default function SurveyQuestion({ question, currentAnswer, onAnswerChange }: SurveyQuestionProps) {
  const [localAnswer, setLocalAnswer] = useState<string>(currentAnswer || '');

  useEffect(() => {
    setLocalAnswer(currentAnswer || '');
  }, [currentAnswer, question.id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalAnswer(value);
    onAnswerChange(value);
  };

  const handleRadioChange = (value: string) => {
    setLocalAnswer(value);
    onAnswerChange(value);
  };

  const handleRankChange = (value: string) => {
    setLocalAnswer(value);
    onAnswerChange(value);
  };

  switch (question.type) {
    case 'text':
      return (
        <div>
          <label className="block font-medium text-lg mb-2">{question.text}</label>
          <input
            type="text"
            className="input-field"
            value={localAnswer}
            onChange={handleTextChange}
            placeholder="กรุณากรอกคำตอบ"
            required={question.required}
          />
        </div>
      );

    case 'textarea':
      return (
        <div>
          <label className="block font-medium text-lg mb-2">{question.text}</label>
          <textarea
            className="input-field"
            value={localAnswer}
            onChange={handleTextChange}
            placeholder="กรุณากรอกคำตอบ"
            rows={4}
            required={question.required}
          />
        </div>
      );

    case 'rank':
      const minRating = Number(question.settings?.find(s => s.key === 'min')?.value || '1');
      const maxRating = Number(question.settings?.find(s => s.key === 'max')?.value || '5');
      const minTitle = question.settings?.find(s => s.key === 'min_title')?.value || 'ไม่พอใจมาก';
      const maxTitle = question.settings?.find(s => s.key === 'max_title')?.value || 'พอใจมาก';
      
      return (
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-medium text-center mb-6">{question.text}</h2>
          
          <div className="flex justify-between w-full max-w-md">
            {Array.from({ length: maxRating - minRating + 1 }, (_, i) => i + minRating).map((rating) => (
              <div 
                key={rating} 
                onClick={() => handleRankChange(rating.toString())}
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all
                  ${parseInt(localAnswer) === rating 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <span className="text-lg font-medium">{rating}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between w-full max-w-md mt-4">
            <span className="text-sm text-blue-500">{minTitle}</span>
            <span className="text-sm text-blue-500">{maxTitle}</span>
          </div>
        </div>
      );

    case 'radio':
      return (
        <div>
          <h2 className="text-xl font-medium text-center mb-6">{question.text}</h2>
          {question.options?.map((option) => (
            <div
              key={option.id}
              onClick={() => handleRadioChange(option.id)}
              className={`w-full my-3 border ${localAnswer === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-md`}
            >
              <label className="flex items-center p-4 cursor-pointer w-full">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${localAnswer === option.id ? 'border-blue-500' : 'border-gray-300'} mr-3`}>
                  {localAnswer === option.id && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
                </div>
                <span className="text-base">{option.text}</span>
              </label>
            </div>
          ))}
        </div>
      );

    default:
      return <div>ไม่รองรับคำถามประเภทนี้</div>;
  }
} 