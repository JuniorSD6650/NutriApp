'use client';

import { useRouter } from 'next/navigation';
import { 
  BeakerIcon, 
  ArchiveBoxIcon, 
  ClipboardDocumentListIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const nutritionModules = [
  {
    name: 'Ingredientes',
    href: '/dashboard/ingredients',
    icon: BeakerIcon,
    description: 'Gestiona la base de datos de ingredientes con información nutricional completa',
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    iconBg: 'bg-orange-500',
    features: ['Hierro por 100g', 'Calorías', 'Proteínas', 'Carbohidratos']
  },
  {
    name: 'Platillos & Recetas',
    href: '/dashboard/dishes',
    icon: ArchiveBoxIcon,
    description: 'Crea y administra recetas con composiciones nutricionales automáticas',
    color: 'from-indigo-400 to-indigo-600',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    iconBg: 'bg-indigo-500',
    features: ['Recetas personalizadas', 'Cálculo automático', 'Visualización de platos', 'Gestión de estado']
  },
  {
    name: 'Registros Nutricionales',
    href: '/dashboard/meal-logs',
    icon: ClipboardDocumentListIcon,
    description: 'Sistema avanzado de seguimiento nutricional con cálculos automáticos por edad',
    color: 'from-emerald-400 to-emerald-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    iconBg: 'bg-emerald-500',
    features: ['Cálculo por edad', 'Porciones automáticas', 'Seguimiento hierro', 'Análisis nutricional']
  }
];

export default function NutritionSystemPage() {
  const router = useRouter();

  const handleModuleClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header simplificado */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <BeakerIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema Nutricional Avanzado
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-600">
            Gestiona ingredientes, recetas y seguimiento nutricional con precisión científica
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {nutritionModules.map((module, index) => (
            <div
              key={module.name}
              onClick={() => handleModuleClick(module.href)}
              className={`${module.bgColor} ${module.borderColor} border-2 rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 ${module.iconBg} rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <module.icon className="h-8 w-8 text-white" />
                </div>
                <ArrowRightIcon className={`h-6 w-6 ${module.textColor} opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300`} />
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${module.textColor}`}>
                  {module.name}
                </h3>
                
                <p className={`${module.textColor} opacity-80 text-sm leading-relaxed`}>
                  {module.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className={`text-sm font-semibold ${module.textColor} uppercase tracking-wide`}>
                    Características:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {module.features.map((feature, idx) => (
                      <div key={idx} className={`flex items-center text-xs ${module.textColor} opacity-75`}>
                        <div className={`w-1.5 h-1.5 ${module.iconBg} rounded-full mr-2`}></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <div className={`${module.iconBg} text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center group-hover:shadow-lg transition-shadow duration-300`}>
                    Acceder
                    <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
