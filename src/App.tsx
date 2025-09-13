import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import '@bcgov/bc-sans/css/BCSans.css';
import './styles/scrollPrevention.css';
import Header from './Header';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <div style={{ minHeight: '100vh' }}>
          <Header 
            languages={['ʻŌlelo', 'Kupu', 'Parau']}
            rightText="Code Works"
            gameName="Panga Kupu"
            icons={[
              { icon: "ℹ️", onClick: () => console.log('Info modal') },
              { icon: "🌐", onClick: () => console.log('Language selector') }
            ]}
          />
          
          <BrowserRouter basename={import.meta.env.PROD ? "/panga-kupu" : "/"}>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ paddingTop: '2px' }}>
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
