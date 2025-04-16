describe('Survey Application', () => {
  
  beforeEach(() => {

    cy.visit('http://localhost:3000/survey-app?seq=00001');
    
  });
  
  it('should navigate through all questions and submit the survey', () => {

    cy.contains('จากการใช้งาน TTB Touch ท่านพึงพอใจระดับใด').should('be.visible');
    
    cy.contains('.rounded-full', '1').click();
    
    cy.wait(2000);

    cy.get('button.next-btn').click();
    
    cy.contains('หัวข้อไหนของ TTB Touch ที่ท่านคิดว่าควรปรับปรุงมากที่สุด').should('be.visible');
    
    cy.contains('span', 'ความเร็วในการเปิด').click();
    
    cy.wait(2000);

    cy.get('button.next-btn').click();
    
    cy.contains('คำแนะนำอื่นๆ').should('be.visible');
    
    cy.get('textarea, input[type="text"]').type('ทดสอบระบบส่งคำตอบแบบสอบถาม');
    
    cy.wait(2000);

    cy.get('button.next-btn').click();
    
    cy.contains('ขอบคุณที่ร่วมตอบแบบสอบถาม', {timeout: 10000}).should('be.visible');
    
  });
}); 