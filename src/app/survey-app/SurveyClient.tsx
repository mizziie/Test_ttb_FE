'use client';

import React, { useState, useEffect } from 'react';
import { getSurveyBySeq } from '@/lib/sampleSurvey';
import SurveyQuestion from '@/components/SurveyQuestion';
import { Question, Answer } from '@/types/survey';
import { getStoredResponses, storeResponses, clearAllSurveyData } from '@/lib/storage';
import Image from 'next/image';
import Link from 'next/link';

interface SurveyClientProps {
  seq: string;
}

export default function SurveyContent({ seq }: SurveyClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Answer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [currentValue, setCurrentValue] = useState<string | string[]>('');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !seq) return;
    
    const fetchSurveyData = async () => {
      try {
        setIsLoading(true);
        const survey = await getSurveyBySeq(seq);
        
        if (survey === null) {
          setIsMaintenance(true);
          return;
        }

        setQuestions(survey.questions);
        
        try {
          const storedResponses = getStoredResponses(seq);
          console.log('Stored responses:', storedResponses);
          if (storedResponses && storedResponses.length > 0) {
            setResponses(storedResponses);
            setCurrentQuestionIndex(Math.min(storedResponses.length, survey.questions.length - 1));
          }
        } catch (storageError) {
          console.error('Error accessing localStorage:', storageError);
        }
      } catch (error) {
        console.error('Error fetching survey:', error);
        setIsMaintenance(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, [seq, isClient]);

  useEffect(() => {
    if (questions.length === 0 || currentQuestionIndex < 0) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const savedResponse = responses.find(r => r.questionId === currentQuestion.id);
    
    if (savedResponse) {
      console.log('Setting currentValue from saved response:', savedResponse.value);
      setCurrentValue(savedResponse.value);
    } else {
      setCurrentValue('');
    }
  }, [currentQuestionIndex, questions, responses]);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setCurrentValue(value);
    console.log('Answer selected:', value);
  };

  const handleNextButton = () => {
    if (!currentQuestion) return;
    
    // ตรวจสอบว่ามีคำตอบหรือไม่ โดยตรวจสอบทั้งคำตอบปัจจุบันและคำตอบเก่า
    const existingAnswer = responses.find(r => r.questionId === currentQuestion.id)?.value;
    const hasAnswer = currentValue || existingAnswer;
    
    console.log('Current value:', currentValue);
    console.log('Existing answer:', existingAnswer);
    console.log('Has answer:', hasAnswer);
    
    if (!hasAnswer && currentQuestion.required) {
      alert('กรุณาเลือกคำตอบก่อนไปข้อถัดไป');
      return;
    }

    const questionId = currentQuestion.id;
    const updatedResponses = [...responses];
    const existingResponseIndex = updatedResponses.findIndex(r => r.questionId === questionId);
    
    const valueToStore = currentValue || existingAnswer || '';
    console.log('Value to store:', valueToStore);
    
    if (existingResponseIndex >= 0) {
      updatedResponses[existingResponseIndex] = { questionId, value: valueToStore };
    } else {
      updatedResponses.push({ questionId, value: valueToStore });
    }
    
    console.log('Updated responses:', updatedResponses);
    setResponses(updatedResponses);
    

    const isLastQuestion = currentQuestionIndex >= questions.length - 1;
    
    if (isClient) {
      try {
        if (isLastQuestion) {

          console.log('Sending final survey data to API...');
          setIsSubmitting(true);
          
          const surveyData = {
            surveyId: seq,
            responses: updatedResponses.map(resp => ({
              questionId: resp.questionId,
              answer: resp.value
            })),
            completedAt: new Date().toISOString()
          };
          
          console.log('Survey data to be sent (client-side):', JSON.stringify(surveyData, null, 2));
          

          const submitEndpoint = '/api/submit-survey';
          
          console.log('Submitting to:', submitEndpoint);

          fetch(submitEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(surveyData),
            cache: 'no-store'
          })
          .then(response => {
            console.log('API Response status:', response.status);
            if (!response.ok) {
              throw new Error(`Failed to submit survey: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('API Response data:', data);

            clearAllSurveyData(seq);
            console.log('Survey data cleared for seq:', seq);
            setIsSubmitting(false);
            setIsCompleted(true);
          })
          .catch(error => {
            console.error('Error submitting survey:', error);
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
            clearAllSurveyData(seq);
            setIsSubmitting(false);
          });
        } else {
          // ถ้าไม่ใช่คำถามสุดท้ายให้บันทึกข้อมูล
          storeResponses(seq, updatedResponses);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setCurrentValue('');
        }
      } catch (error) {
        console.error('Error handling survey data:', error);
        setIsSubmitting(false);
      }
    } else {
      // กรณีไม่ใช่คำถามสุดท้าย
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentValue('');
      }
    }
  };

  if (!isClient || isLoading) {
    return <div className="text-center">กำลังโหลด...</div>;
  }

  if (isMaintenance) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <div className="flex flex-col mb-6">
          <div className="w-full flex justify-start mb-4">
            <Image src="/images/logo-default.png" alt="TTB Logo" width={84} height={42} priority />
          </div>
        </div>
        
        <div className="flex-grow flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-4">ระบบอยู่ระหว่างการปรับปรุง</h2>
          <p className="text-center mb-6">
            ขออภัยในความไม่สะดวก กรุณากลับมาใหม่ในภายหลัง
          </p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <div className="flex flex-col mb-6">
          <div className="w-full flex justify-start mb-4">
            <Image src="/images/logo-default.png" alt="TTB Logo" width={84} height={42} priority />
          </div>
        </div>
        
        <div className="flex-grow flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4">ขอบคุณที่ร่วมตอบแบบสอบถาม</h2>
          {/* <Link href="/" className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full max-w-md text-center">
            กลับสู่หน้าหลัก
          </Link> */}
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <div className="flex flex-col mb-6">
          <div className="w-full flex justify-start mb-4">
            <Image src="/images/logo-default.png" alt="TTB Logo" width={84} height={42} priority />
          </div>
        </div>
        
        <div className="flex-grow flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-4">กำลังส่งข้อมูล</h2>
          <p className="text-center mb-6">
            กรุณารอสักครู่...
          </p>
          <div className="w-12 h-12 border-t-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center">กำลังโหลด...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex flex-col mb-6">
        <div className="w-full flex justify-start mb-4">
          <Image src="/images/logo-default.png" alt="TTB Logo" width={84} height={42} priority />
        </div>
        <div className="w-full flex justify-start">
          {currentQuestionIndex > 0 && (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              className="text-gray-500 hover:text-gray-700"
            >
              &lt; ย้อนกลับ
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow mb-2">
        <SurveyQuestion
          question={currentQuestion}
          currentAnswer={typeof currentValue === 'string' ? currentValue : responses.find(r => r.questionId === currentQuestion.id)?.value?.toString()}
          onAnswerChange={(value) => handleAnswer(currentQuestion.id, value)}
        />
      </div>

      <div className="mb-12 mt-4">
        <button
          onClick={handleNextButton}
          className="next-btn bg-blue-500 text-white font-bold py-3 px-4 rounded w-full"
        >
          {currentQuestionIndex === questions.length - 1 ? 'ส่งคำตอบ' : 'ถัดไป'}
        </button>
      </div>
    </div>
  );
} 