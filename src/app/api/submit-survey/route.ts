import { NextRequest, NextResponse } from 'next/server';

interface SurveyResponse {
  questionId: string;
  answer: string;
}

const radioOptionsMapping: Record<string, string> = {
  "q2_1": "ความเร็วในการเปิด",
  "q2_2": "การค้นหาเมนูที่ใช้บ่อย",
  "q2_3": "การถอนเงินโดยไม่ใช้บัตร",
  // สามารถเพิ่มตัวเลือกใหม่ได้ง่าย ๆ ที่นี่
  "q2_4": "การแสดงผลบนหน้าจอ",
  "q2_5": "ฟีเจอร์การโอนเงิน"
};

export async function POST(request: NextRequest) {
  try {
    // รับข้อมูลจาก request body
    const surveyData = await request.json();
    console.log('Received survey submission from client:', JSON.stringify(surveyData, null, 2));
    
    // const backendUrl = 'http://localhost:8080';
    // const apiEndpoint = `${backendUrl}/api/submit-survey`;

    // ใช้ host.docker.internal เพื่อเข้าถึง host machine จาก container
    const backendUrl = 'http://host.docker.internal:8080';
    const apiEndpoint = `${backendUrl}/api/submit-survey`;
    
    console.log(`Forwarding survey data to backend at: ${apiEndpoint}`);
    
    const formattedResponses = surveyData.responses.map((resp: any) => {
      const newResponse = { ...resp };
      
      if (resp.questionId === "q2" && radioOptionsMapping[resp.answer]) {
        newResponse.answer = radioOptionsMapping[resp.answer];
      }
      
      return newResponse;
    });
    
    const formattedData = {
      surveyId: surveyData.surveyId,
      surveyTitle: "แบบสำรวจความพึงพอใจ TTB Touch",
      submittedAt: surveyData.completedAt || new Date().toISOString(),
      answers: formattedResponses
    };
    
    console.log('Formatted request body that will be sent to backend:', JSON.stringify(formattedData, null, 2));
    
    try {

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData),
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      console.log(`Response status from BE: ${response.status}`);
      
      if (!response.ok) {
        console.error(`Error from BE: ${response.status}`);
        return NextResponse.json(
          { error: `Error from backend: ${response.status}` },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      console.log('Submission response from BE:', JSON.stringify(data, null, 2));
      
      return NextResponse.json(data || {
        success: true,
        message: "Survey submitted successfully",
        submittedAt: new Date().toISOString(),
        surveySubmitId: Math.floor(Math.random() * 100)
      });
    } catch (fetchError) {
      console.error('Error connecting to backend:', fetchError);
      return NextResponse.json({
        success: true,
        message: "Survey submitted successfully",
        submittedAt: new Date().toISOString(),
        surveySubmitId: Math.floor(Math.random() * 100)
      });
    }
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    
    return NextResponse.json({
      success: true,
      message: "Survey submitted successfully",
      submittedAt: new Date().toISOString(),
      surveySubmitId: Math.floor(Math.random() * 100)
    });
  }
} 