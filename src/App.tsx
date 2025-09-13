import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import KimiKupuHeader from "@/shared/components/KimiKupuHeader";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <div className="kimi-kupu-app">
          {/* KimiKupu Background Gradient */}
          <div className="kimi-kupu-background" />
          
          <BrowserRouter basename={import.meta.env.PROD ? "/panga-kupu" : "/"}>
            {/* KimiKupu Header */}
            <KimiKupuHeader 
              gameName="Panga Kupu"
              icons={[
                { icon: "🌐", onClick: () => console.log('Language selector') },
                { icon: "ℹ️", onClick: () => console.log('Info') },
                { icon: "📊", onClick: () => console.log('Stats') }
              ]}
            />
            
            {/* Game Content */}
            <div className="kimi-kupu-game-container">
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </div>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
