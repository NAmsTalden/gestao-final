// src/components/Configuracoes.tsx

import React from 'react';

const Configuracoes = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600">Gira as configurações do sistema e do seu perfil.</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="text-center text-gray-500">
          <p className="mb-2">A página de configurações será implementada na fase final.</p>
          <p className="text-sm">Incluirá opções como gestão de utilizadores (administrador), personalização de notificações e configuração de parâmetros do sistema.</p>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;