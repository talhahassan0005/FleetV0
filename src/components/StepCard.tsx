interface StepCardProps {
  step: number;
  title: string;
  description: string;
}

export default function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="relative bg-gradient-to-br from-white to-emerald-50/30 p-8 rounded-xl shadow-lg border border-emerald-100">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
        {step}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 mt-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
