import { Survey } from '../types/survey';

// ตรวจสอบว่าอยู่ในฝั่ง client หรือไม่
const isClient = typeof window !== 'undefined';

// // ข้อมูล rank question
// export const sampleRankQuestion = {
//   type: "rank",
//   title: "จากการใช้งาน TTB Touch ท่านพึงพอใจระดับใด",
//   settings:[
//     {
//       key: "require",
//       value: "true"
//     },
//     {
//       key: "min",
//       value: "1"
//     },
//     {
//       key: "max",
//       value: "5"
//     },
//     {
//       key: "min_title",
//       value: "1 คือไม่พอใจมาก"
//     },
//     {
//       key: "max_title",
//       value: "5 คือพอใจมาก"
//     }
//   ]
// };

// // ข้อมูล radio question
// export const sampleRadioQuestion = {
//   type: "radio",
//   title: "หัวข้อไหนของ TTB Touch ที่ท่านคิดว่าควรปรับปรุงมากที่สุด",
//   choices: [
//     {
//       title: "ความเร็วในการเปิด",
//       value: "1"
//     },
//     {
//       title: "การค้นหาเมนูที่ใช้บ่อย",
//       value: "2"
//     },
//     {
//       title: "การถอนเงินโดยไม่ใช้บัตร",
//       value: "3"
//     }
//   ],
//   settings:[
//     {
//       key: "require",
//       value: "false"
//     }
//   ]
// };

// // ข้อมูล text question
// export const sampleTextQuestion = {
//   type: "text",
//   title: "คำแนะนำอื่นๆ",
//   settings: [
//     {
//       key: "max_length",
//       value: "100"
//     },
//     {
//       key: "require",
//       value: "false"
//     }
//   ]
// };

// ฟังก์ชันสำหรับแปลงข้อมูลจาก API เป็นโครงสร้างที่ใช้ในแอพพลิเคชัน
const convertApiSurveyToAppSurvey = (apiSurvey: any): Survey => {
  return {
    id: apiSurvey.id,
    title: apiSurvey.title,
    description: apiSurvey.description,
    questions: apiSurvey.questions.map((q: any, index: number) => {
      const question: any = {
        id: `q${index + 1}`,
        type: q.type,
        text: q.title,
        required: q.required,
        settings: q.settings
      };
      
      if (q.choices && q.choices.length > 0) {
        question.options = q.choices.map((c: any, cIndex: number) => ({
          id: `q${index + 1}_${cIndex + 1}`,
          text: c.title
        }));
      }
      
      return question;
    })
  };
};

// ฟังก์ชันดึงข้อมูลจาก API
export async function fetchSurveyFromApi(seq: string): Promise<{survey: Survey | null, isApiError: boolean}> {
  try {
    // สร้าง controller สำหรับ timeout แบบปลอดภัย
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // ลด timeout ลงเพื่อให้เกิด fallback เร็วขึ้น
    
    // ใช้ API endpoint ผ่าน Next.js proxy เพื่อแก้ปัญหา CORS
    // ใช้ try/catch ภายในเพื่อจัดการกับข้อผิดพลาดโดยละเอียด
    try {
      const response = await fetch(`/api/surveys/${seq}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId); // ยกเลิก timeout หากได้รับ response แล้ว
      
      if (!response.ok) {
        // API ตอบกลับแต่มี error code
        console.warn(`API returned status ${response.status} for survey ${seq}`);
        return { survey: null, isApiError: response.status >= 500 };
      }
      
      const data = await response.json();
      return { survey: convertApiSurveyToAppSurvey(data), isApiError: false };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Error during fetch operation:', fetchError);
      return { survey: null, isApiError: true };
    }
  } catch (error) {
    // กรณีไม่สามารถเชื่อมต่อกับ API ได้
    console.error('Error fetching survey from API:', error);
    return { survey: null, isApiError: true };
  }
}

// ฟังก์ชันดึงข้อมูลสำรวจจาก API หรือใช้ข้อมูล fallback
export async function getSurveyBySeq(seq: string): Promise<Survey | null> {
  try {

    const { survey, isApiError } = await fetchSurveyFromApi(seq);
    
    if (survey) {
      console.log('Successfully fetched survey from API:', seq);
      return survey;
    }
    
    console.error('API service is unavailable or survey not found');
    return null;
  } catch (error) {
    console.error('Error in getSurveyBySeq:', error);
    return null;
  }
}

// ฟังก์ชันแบบเดิมสำหรับการใช้งานแบบ synchronous (เพื่อ backward compatibility)
export function getSurveyBySeqSync(seq: string): Survey | null {
  return null;
} 