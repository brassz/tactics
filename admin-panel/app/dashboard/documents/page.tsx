'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';
import Image from 'next/image';

interface Document {
  id: string;
  id_user: string;
  selfie_url: string;
  cnh_rg_url: string;
  comprovante_endereco_url: string;
  comprovante_renda_url: string;
  carteira_trabalho_pdf_url: string;
  status_documentos: string;
  created_at: string;
  users: {
    nome: string;
    cpf: string;
  };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*, users(nome, cpf)')
      .order('created_at', { ascending: false });

    setDocuments(data || []);
    setLoading(false);
  };

  const updateDocumentStatus = async (docId: string, status: string) => {
    const { error } = await supabase
      .from('documents')
      .update({ status_documentos: status })
      .eq('id', docId);

    if (!error) {
      loadDocuments();
      setSelectedDoc(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pendente: 'bg-yellow-100 text-yellow-800',
      aprovado: 'bg-green-100 text-green-800',
      reprovado: 'bg-red-100 text-red-800',
      em_analise: 'bg-blue-100 text-blue-800',
    };

    const labels = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      reprovado: 'Reprovado',
      em_analise: 'Em Análise',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Documentos dos Clientes
        </h1>
        <p className="text-gray-600">
          Visualize e aprove documentos enviados
        </p>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {doc.users.nome}
                </h3>
                <p className="text-sm text-gray-600">CPF: {doc.users.cpf}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Enviado em{' '}
                  {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {getStatusBadge(doc.status_documentos)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">Selfie</p>
                <button
                  onClick={() => setViewingImage(doc.selfie_url)}
                  className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Eye size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">RG/CNH</p>
                <button
                  onClick={() => setViewingImage(doc.cnh_rg_url)}
                  className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Eye size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">Comp. End.</p>
                <button
                  onClick={() => window.open(doc.comprovante_endereco_url)}
                  className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Download size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">Comp. Renda</p>
                <button
                  onClick={() => window.open(doc.comprovante_renda_url)}
                  className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Download size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">CTPS</p>
                <button
                  onClick={() => window.open(doc.carteira_trabalho_pdf_url)}
                  className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Download size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedDoc(doc)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Gerenciar Documento
            </button>
          </div>
        ))}
      </div>

      {/* Status Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Gerenciar Documento
            </h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium text-gray-900">
                  {selectedDoc.users.nome}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status Atual</p>
                {getStatusBadge(selectedDoc.status_documentos)}
              </div>
            </div>

            <div className="space-y-3">
              {selectedDoc.status_documentos !== 'aprovado' && (
                <button
                  onClick={() =>
                    updateDocumentStatus(selectedDoc.id, 'aprovado')
                  }
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Aprovar
                </button>
              )}

              {selectedDoc.status_documentos !== 'em_analise' && (
                <button
                  onClick={() =>
                    updateDocumentStatus(selectedDoc.id, 'em_analise')
                  }
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Clock size={20} />
                  Marcar Em Análise
                </button>
              )}

              {selectedDoc.status_documentos !== 'reprovado' && (
                <button
                  onClick={() =>
                    updateDocumentStatus(selectedDoc.id, 'reprovado')
                  }
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  Reprovar
                </button>
              )}

              <button
                onClick={() => setSelectedDoc(null)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <img
              src={viewingImage}
              alt="Documento"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
