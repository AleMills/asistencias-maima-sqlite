import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
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
        quality: 1.0, // Calidad máxima
        style: {
          // Asegura que el fondo sea blanco en la imagen final
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

  if (!qrData) return <div className="p-8 text-center">Cargando QR...</div>;

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-12 print:hidden">
        <Link
          to="/admin/dashboard"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver
        </Link>
        <button
          onClick={handleDownload}
          className="flex cursor-pointer items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Download className="w-5 h-5 mr-2" /> Descargar
        </button>
      </div>

      <div
        ref={printRef}
        className="text-center border-4 border-black p-12 rounded-xl max-w-2xl w-full bg-white"
      >
        <h1 className="text-4xl font-bold mb-4 uppercase tracking-wider">
          Control de Asistencia MAIMA FIESTAS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Escanea este código para registrar tu ingreso o egreso
        </p>

        <div className="flex justify-center mb-8">
          <a href={qrData.url} target="_blank" rel="noopener noreferrer">
            <img src={qrData.qrImage} alt="QR Code" className="w-96 h-96" />
          </a>
        </div>

        {/* <div className="text-lg text-gray-500 font-mono bg-gray-100 py-2 px-4 rounded inline-block">
          {qrData.url}
        </div> */}

        <div className="mt-8 text-sm text-gray-400">
          Asegúrate de estar conectado a la red WiFi del trabajo.
        </div>
      </div>
    </div>
  );
};

export default AdminQR;
