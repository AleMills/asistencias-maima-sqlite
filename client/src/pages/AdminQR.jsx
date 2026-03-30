import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, QrCode as QrIcon, ShieldCheck } from "lucide-react";
import domtoimage from "dom-to-image-more";

const AdminQR = () => {
  const [qrData, setQrData] = useState(null);
  const printRef = useRef();
  
  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await api.get("/qr");
        setQrData(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQR();
  }, []);

  const handleDownload = () => {
    const element = printRef.current;
    domtoimage
      .toPng(element, {
        quality: 1.0,
        style: {
          backgroundColor: "white",
        },
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "qr-control-asistencia.png";
        link.href = dataUrl;
        link.click();
      });
  };

  if (!qrData) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
        <QrIcon className="w-12 h-12" />
        <p className="text-sm font-medium tracking-tighter">Generando código QR...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 sm:p-8 flex flex-col items-center">
      {/* Header controls */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 sm:mb-12 print:hidden backdrop-blur-md bg-background/50 sticky top-0 py-2 sm:py-4 z-10">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Gestión
        </Link>
        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4 mr-2" /> Descargar PNG
        </button>
      </div>

      <div
        ref={printRef}
        className="relative text-center border border-border sm:p-16 p-8 rounded-3xl max-w-2xl w-full bg-card shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden"
      >
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
          <QrIcon className="w-64 h-64 -rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-primary p-2 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Acceso Seguro</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4 text-foreground leading-tight">
            Control de Asistencias <br/>
            <span className="text-primary">Nexo 0km</span>
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed">
            Escanea este código QR desde tu dispositivo móvil conectado a la red WiFi local para registrar tu jornada.
          </p>

          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border-4 border-stone-50 mb-10 group relative transition-transform duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img 
              src={qrData.qrImage} 
              alt="QR Code" 
              className="w-64 h-64 sm:w-80 sm:h-80 relative z-10" 
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Conectado a Red Local
            </div>
            
            <p className="text-[10px] text-muted-foreground italic max-w-[280px]">
              El código QR expira y se regenera automáticamente para garantizar la seguridad de su asistencia.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center max-w-md sm:block hidden">
        <p className="text-xs text-muted-foreground leading-relaxed">
          &copy; {new Date().getFullYear()} Nexo 0km. Sistema de gestión de personal privado y seguro.
        </p>
      </div>
    </div>
  );
};

export default AdminQR;
