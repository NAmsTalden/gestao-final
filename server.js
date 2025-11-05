import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const YOUR_SUPABASE_URL = process.env.DATABASE_URL;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!YOUR_SUPABASE_URL || !supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Variáveis de ambiente não configuradas.');
  console.log('Verifique se seu arquivo .env contém DATABASE_URL, VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Tentando conectar ao banco de dados...');

const pool = new pg.Pool({
  connectionString: YOUR_SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();

// --- INÍCIO DA CORREÇÃO ---
// Lógica de CORS mais segura
const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  console.log(`Adicionando ${process.env.FRONTEND_URL} às origens permitidas.`);
}

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// --- FIM DA CORREÇÃO ---


app.use(express.json());

const checkAuth = async (req, res, next) => {
  try {
    const jwt = req.headers.authorization?.split('Bearer ')[1];
    if (!jwt) {
      throw new Error('Nenhum token fornecido');
    }

    const { error } = await supabase.auth.getUser(jwt);
    if (error) {
      throw error;
    }

    next();
  } catch (error) {
    console.error('Erro de autenticação:', error.message);
    res.status(401).json({ message: 'Não autorizado' });
  }
};

const PORT = 3001;

app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestão de Licitações',
    endpoints: {
      'GET /api/processes': 'Lista todos os processos',
      'POST /api/processes': 'Cria um novo processo',
      'PUT /api/processes/:id': 'Atualiza um processo existente',
      'PATCH /api/processes/:id': 'Atualiza o status de um processo',
      'DELETE /api/processes/:id': 'Remove um processo'
    }
  });
});

const createTableIfNotExists = async () => {
  const tableCheck = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'processes'
    );
  `);
  
  if (!tableCheck.rows[0].exists) {
    console.log('Tabela processes não existe. Criando...');
    await pool.query(`
      CREATE TABLE processes (
        id TEXT PRIMARY KEY,
        numero TEXT,
        objeto TEXT,
        secretaria TEXT,
        status TEXT,
        "dataAbertura" TEXT,
        "prazoFinal" TEXT,
        responsavel TEXT,
        "valorEstimado" TEXT,
        observacoes TEXT,
        timeline JSONB
      );
    `);
    console.log('Tabela processes criada com sucesso!');
  }
};

app.get('/api/processes', checkAuth, async (req, res) => {
  console.log('GET: /api/processes (Buscando no Banco de Dados...)');
  try {
    await createTableIfNotExists();
    
    const result = await pool.query('SELECT * FROM processes ORDER BY "dataAbertura" DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro detalhado:', err);
    res.status(500).json({ message: 'Erro ao buscar processos no banco de dados', error: err.message });
  }
});

app.post('/api/processes', checkAuth, async (req, res) => {
  console.log('POST: /api/processes (Inserindo no Banco de Dados...)');
  
  const { id, numero, objeto, secretaria, status, dataAbertura, prazoFinal, responsavel, valorEstimado, observacoes, timeline } = req.body;
  
  try {
    await createTableIfNotExists();

    const query = `
      INSERT INTO processes (id, numero, objeto, secretaria, status, "dataAbertura", "prazoFinal", responsavel, "valorEstimado", observacoes, timeline)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    
    const values = [id, numero, objeto, secretaria, status, dataAbertura, prazoFinal, responsavel, valorEstimado, observacoes, JSON.stringify(timeline || [])];
    
    const result = await pool.query(query, values);
    
    console.log('Novo processo criado:', result.rows[0].numero);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro ao criar processo no banco de dados' });
  }
});

app.put('/api/processes/:id', checkAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`PUT: /api/processes/${id} (Atualizando no Banco de Dados...)`);
  
  const { numero, objeto, secretaria, status, dataAbertura, prazoFinal, responsavel, valorEstimado, observacoes, timeline } = req.body;

  try {
    const query = `
      UPDATE processes
      SET numero = $1, 
          objeto = $2, 
          secretaria = $3, 
          status = $4, 
          "dataAbertura" = $5, 
          "prazoFinal" = $6, 
          responsavel = $7, 
          "valorEstimado" = $8, 
          observacoes = $9, 
          timeline = $10
      WHERE id = $11
      RETURNING *;
    `;
    const values = [numero, objeto, secretaria, status, dataAbertura, prazoFinal, responsavel, valorEstimado, observacoes, JSON.stringify(timeline), id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado' });
    }
    
    console.log('Processo atualizado:', result.rows[0].numero);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro ao atualizar processo no banco de dados' });
  }
});

app.patch('/api/processes/:id', checkAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`PATCH: /api/processes/${id} (Atualizando status no Banco...)`);
  
  const { status, timelineEvent } = req.body;

  try {
    const checkQuery = `SELECT * FROM processes WHERE id = $1;`;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado' });
    }

    const query = `
      UPDATE processes
      SET status = $1, 
          timeline = COALESCE(timeline, '[]'::jsonb) || $2::jsonb
      WHERE id = $3
      RETURNING *;
    `;
    
    const values = [status, JSON.stringify([timelineEvent]), id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado' });
    }

    console.log('Status atualizado:', result.rows[0].numero);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro ao atualizar status no banco de dados' });
  }
});

app.delete('/api/processes/:id', checkAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE: /api/processes/${id} (Deletando no Banco...)`);

  try {
    const query = 'DELETE FROM processes WHERE id = $1 RETURNING *;';
    const values = [id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado' });
    }

    console.log('Processo deletado:', result.rows[0].numero);
    res.status(200).json({ message: 'Processo deletado com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro ao deletar processo no banco de dados' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend (com BANCO DE DADOS) rodando em http://localhost:${PORT}`);
});