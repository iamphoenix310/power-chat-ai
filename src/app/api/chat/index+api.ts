export function GET(request: Request) {
  console.log('GET request received');
  return Response.json({ hello: 'world' });
}
