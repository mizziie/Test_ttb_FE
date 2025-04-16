interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export default function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="step-indicator">
      {steps.map((step) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        let stepClass = "step-circle";
        if (isActive) stepClass += " step-active";
        else if (isCompleted) stepClass += " step-completed";
        else stepClass += " step-inactive";

        return (
          <div key={step} className="flex flex-col items-center">
            <div className={stepClass}>{step}</div>
            {step === 1 && <div className="text-xs mt-1">เริ่มต้นแบบฟอร์ม</div>}
            {step === totalSteps && <div className="text-xs mt-1">สิ้นสุดแบบฟอร์ม</div>}
          </div>
        );
      })}
    </div>
  );
} 