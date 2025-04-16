import { Survey } from '@/types/survey';

/**
 * ตรวจสอบความถูกต้องของข้อมูลที่จะส่งไป API
 * @param data ข้อมูลที่ต้องการตรวจสอบ
 * @returns ผลการตรวจสอบ {valid: boolean, errors: string[]}
 */
export function validateSurveyAnswers(data: any): {valid: boolean, errors: string[]} {
  const errors: string[] = [];

  // ตรวจสอบ required fields
  if (!data.surveyId) {
    errors.push('ไม่พบรหัสแบบสอบถาม (surveyId)');
  }
  
  if (!data.surveyTitle) {
    errors.push('ไม่พบชื่อแบบสอบถาม (surveyTitle)');
  }
  
  if (!data.submittedAt) {
    errors.push('ไม่พบเวลาที่ส่งข้อมูล (submittedAt)');
  } else {
    // ตรวจสอบรูปแบบวันที่
    if (isNaN(Date.parse(data.submittedAt))) {
      errors.push('รูปแบบเวลาไม่ถูกต้อง (submittedAt)');
    }
  }
  
  // ตรวจสอบ answers array
  if (!data.answers || !Array.isArray(data.answers) || data.answers.length === 0) {
    errors.push('ไม่พบข้อมูลคำตอบ หรือข้อมูลคำตอบไม่ถูกต้อง (answers)');
  } else {
    // ตรวจสอบแต่ละคำตอบ
    data.answers.forEach((answer: any, index: number) => {
      if (!answer.questionId) {
        errors.push(`คำตอบที่ ${index + 1}: ไม่พบรหัสคำถาม (questionId)`);
      }
      
      if (!answer.questionText) {
        errors.push(`คำตอบที่ ${index + 1}: ไม่พบข้อความคำถาม (questionText)`);
      }
      
      if (!answer.questionType) {
        errors.push(`คำตอบที่ ${index + 1}: ไม่พบประเภทคำถาม (questionType)`);
      } else {
        // ตรวจสอบประเภทคำถามที่รองรับ
        const validTypes = ['rank', 'radio', 'checkbox', 'text', 'textarea'];
        if (!validTypes.includes(answer.questionType)) {
          errors.push(`คำตอบที่ ${index + 1}: ประเภทคำถามไม่ถูกต้อง (${answer.questionType})`);
        }
      }
      
      if (!answer.answer || answer.answer.value === undefined) {
        errors.push(`คำตอบที่ ${index + 1}: ไม่พบข้อมูลคำตอบ (answer.value)`);
      } else {
        // ตรวจสอบความถูกต้องของคำตอบตามประเภทคำถาม
        switch (answer.questionType) {
          case 'rank':
            if (typeof answer.answer.value !== 'number') {
              errors.push(`คำตอบที่ ${index + 1}: คำตอบสำหรับคำถามประเภท rank ต้องเป็นตัวเลข`);
            }
            break;
          case 'radio':
            if (typeof answer.answer.value !== 'string') {
              errors.push(`คำตอบที่ ${index + 1}: คำตอบสำหรับคำถามประเภท radio ต้องเป็นข้อความ`);
            }
            break;
          case 'text':
          case 'textarea':
            if (typeof answer.answer.value !== 'string') {
              errors.push(`คำตอบที่ ${index + 1}: คำตอบสำหรับคำถามประเภท text/textarea ต้องเป็นข้อความ`);
            }
            break;
        }
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
} 