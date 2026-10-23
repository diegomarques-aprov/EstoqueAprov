export async function GET() {
  return Response.json({
    status: 'ok',
    app: 'EstoqueAprov',
    version: '1.7.0',
  });
}
