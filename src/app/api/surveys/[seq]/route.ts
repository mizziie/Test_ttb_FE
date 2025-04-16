import { NextRequest, NextResponse } from 'next/server';

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface Question {
  id: string;
  type: string;
  title: string;
  required: boolean;
  choices?: Choice[];
  settings?: Setting[];
}

interface Choice {
  title: string;
  value: string;
}

interface Setting {
  key: string;
  value: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { seq: string } }
) {
  try {
    const { seq } = params;
    console.log(`API Route: Fetching survey with seq: ${seq}`);


    // ใช้ชื่อ container 'ttb-survey-backend' เพื่อเชื่อมต่อภายใน Docker network
    // const backendUrl = 'http://localhost:8080';
    // const apiEndpoint = `${backendUrl}/api/surveys/${params.seq}`;
    
    // ใช้ host.docker.internal เพื่อเข้าถึง host machine จาก container
    const backendUrl = 'http://host.docker.internal:8080';
    const apiEndpoint = `${backendUrl}/api/surveys/${seq}`;
    
    console.log(`Connecting to backend at: ${apiEndpoint}`);

    try {
      // ตั้ง timeout สำหรับการเชื่อมต่อ
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      console.log(`Response status from BE: ${response.status}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Survey with seq ${seq} not found in backend`);
          return NextResponse.json(
            { error: 'Survey not found' },
            { status: 404 }
          );
        }
        
        console.error(`Error from BE: ${response.status}`);
        return NextResponse.json(
          { error: 'Failed to fetch survey from backend' },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      console.log('Received data from BE:', data);
      
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Error connecting to backend:', fetchError);
      
      return NextResponse.json(
        { error: 'Unable to connect to backend service' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
} 