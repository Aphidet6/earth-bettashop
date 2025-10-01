import { supabase } from '@/lib/supabase';

export default async function TestPage() {
  // ทดสอบการเชื่อมต่อ
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      {error ? (
        <div className="bg-red-100 p-4 rounded">
          <h2 className="text-red-800 font-semibold">Error:</h2>
          <pre className="text-red-600">{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-green-800 font-semibold">Success!</h2>
          <pre className="text-green-600">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}