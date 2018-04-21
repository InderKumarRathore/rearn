export default function getRootUrl() {
  const port = process.env.PORT || 4000;
  const dev = process.env.NODE_ENV !== 'production';
  const ROOT_URL = dev ? `http://localhost:${port}` : 'https://rearn.org';

  return ROOT_URL;
}
