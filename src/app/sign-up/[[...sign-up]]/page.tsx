import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: 'Crear Cuenta | Santo Grial',
  description: 'Regístrate para comenzar a generar JSONs para n8n con IA',
};

/**
 * Página de registro con Clerk
 * Utiliza el componente SignUp de Clerk para renderizar el formulario
 * La ruta catch-all [[...sign-up]] permite a Clerk manejar sus rutas internas
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex flex-col justify-center items-center px-4 relative">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,40,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,40,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-purple-800/10 filter blur-[120px] opacity-40"></div>
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-cyan-800/10 filter blur-[120px] opacity-40"></div>
      
      {/* Contenido principal */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-1">
            MaaS WC
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Generador de JSON para n8n
          </p>
        </div>
        
        {/* Tarjeta de autenticación */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-800/50 overflow-hidden">
          {/* Encabezado de la tarjeta */}
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-2xl font-bold text-white mb-1">
              Comienza tu viaje
            </h2>
            <p className="text-gray-400 text-sm">
              Crea una cuenta para descubrir todo el potencial
            </p>
          </div>
          
          {/* Formulario de Clerk personalizado */}
          <div className="px-8 pb-8">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-lg shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                  card: "bg-transparent shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formFieldLabel: "text-gray-300 font-medium",
                  formFieldInput: "bg-gray-800/60 border-gray-700 text-white rounded-md focus:border-cyan-500 focus:ring focus:ring-cyan-500/20 transition-all duration-200",
                  footerAction: "text-gray-400 hover:text-white",
                  socialButtonsBlockButton: 
                    "border border-gray-700 bg-gray-800/60 hover:bg-gray-800 text-white font-medium rounded-md py-2 transition-all duration-200",
                  socialButtonsBlockButtonText: "text-white font-medium",
                  otpCodeFieldInput: "bg-gray-800/60 border-gray-700 text-white rounded-md",
                  identityPreviewEditButton: "text-cyan-500 hover:text-cyan-400",
                  alert: "bg-red-900/50 border border-red-800 text-white rounded-md",
                  alertText: "text-white",
                  formFieldErrorText: "text-red-400",
                  formFieldSuccessText: "text-green-400",
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  socialButtonsVariant: "blockButton",
                },
                variables: {
                  colorPrimary: '#06b6d4', // cyan-500
                  colorText: 'white',
                  colorTextSecondary: '#94a3b8', // slate-400
                  colorBackground: 'transparent',
                  colorDanger: '#f87171', // red-400
                  colorSuccess: '#4ade80', // green-400
                }
              }}
              redirectUrl="/chat"
            />
          </div>
        </div>
        
        {/* Benefits Section */}
        <div className="mt-8 bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30">
          <h3 className="text-white font-bold text-lg mb-3">¿Por qué unirte a nosotros?</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">✓</span>
              <span className="text-gray-300 text-sm">Generación automática de JSONs para n8n</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">✓</span>
              <span className="text-gray-300 text-sm">Visualización interactiva de diagramas</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">✓</span>
              <span className="text-gray-300 text-sm">Ahorra horas de configuración manual</span>
            </li>
          </ul>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MaaS WC. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
} 