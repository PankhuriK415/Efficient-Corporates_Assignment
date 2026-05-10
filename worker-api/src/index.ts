import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  FEEDBACK_KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
app.use('*', cors());

// Health check
app.get('/', (c) => c.text('Anonymous Feedback API is running!'));

// GET /api/messages - Fetch messages with KV caching
app.get('/api/messages', async (c) => {
  try {
    // 1. Try KV first
    const cachedMessages = await c.env.FEEDBACK_KV.get('latest_messages', 'json');
    if (cachedMessages) {
      console.log('Serving from KV cache');
      return c.json({ source: 'kv', data: cachedMessages });
    }

    // 2. Fallback to Supabase
    console.log('KV empty, fetching from Supabase');
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Update KV cache with the latest 10 for the next request
    if (data && data.length > 0) {
      await c.env.FEEDBACK_KV.put('latest_messages', JSON.stringify(data.slice(0, 10)), {
        expirationTtl: 3600 // Cache for 1 hour
      });
    }

    return c.json({ source: 'supabase', data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/submit - Submit new feedback
app.post('/api/submit', async (c) => {
  try {
    const { name, message } = await c.req.json();

    // Validation
    if (!message || message.trim().length === 0) {
      return c.json({ error: 'Message is required' }, 400);
    }

    if (message.length > 500) {
      return c.json({ error: 'Message too long (max 500 chars)' }, 400);
    }

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    
    // 1. Store in Supabase
    const { data, error } = await supabase
      .from('feedbacks')
      .insert([{ name: name?.trim() || 'Anonymous', message: message.trim() }])
      .select()
      .single();

    if (error) throw error;

    // 2. Update KV cache with the latest 10 messages
    const { data: latestData } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (latestData) {
      await c.env.FEEDBACK_KV.put('latest_messages', JSON.stringify(latestData), {
        expirationTtl: 3600
      });
    }

    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
